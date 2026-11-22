-- KREISLAUF: serialize escrow votes and settle high-value trades atomically.
create or replace function kreislauf_cast_escrow_vote(
  p_listing_id text, p_moderator_id text, p_vote text, p_note text default ''
)
returns table(status text, votes integer, approvals integer, rejections integer, assigned integer, required integer)
language plpgsql
as $fn$
declare
  v_case escrow_cases%rowtype;
  v_assigned integer := 0;
  v_votes integer := 0;
  v_approvals integer := 0;
  v_rejections integer := 0;
  v_required integer := 4;
  v_profile_count integer := 0;
  v_updated integer := 0;
  v_buyer_balance integer := 0;
  v_listing record;
begin
  if p_vote not in ('approve', 'reject') then raise exception 'Ungültige Stimme'; end if;

  select e.* into v_case from escrow_cases e
  where e.listing_id = p_listing_id and e.status = 'pending'
  order by e.created_at desc limit 1 for update;
  if not found then raise exception 'Keine offene Treuhand für dieses Inserat'; end if;

  if not exists (
    select 1 from escrow_moderators a join profiles p on p.user_id = a.moderator_id
    where a.escrow_id = v_case.id and a.moderator_id = p_moderator_id
      and p.is_verified = true and p.moderator_rank > 0
      and p.last_active_at >= now() - interval '30 days'
  ) then raise exception 'Keine aktive Moderationszuordnung'; end if;

  insert into escrow_votes(escrow_id, moderator_id, vote, note)
  values (v_case.id, p_moderator_id, p_vote, left(coalesce(p_note, ''), 500));

  select count(*)::int,
    count(*) filter (where v.vote = 'approve')::int,
    count(*) filter (where v.vote = 'reject')::int
  into v_votes, v_approvals, v_rejections
  from escrow_votes v where v.escrow_id = v_case.id;

  select count(*)::int into v_assigned from escrow_moderators a where a.escrow_id = v_case.id;
  v_required := 4;

  if v_votes >= 4 and v_approvals >= ceil(v_votes * 2.0 / 3.0) then
    if v_case.reason = 'Hochwertiges Tauschgeschäft' then
      select l.id, l.user_id as seller_id, l.region_id, l.price_karma, l.title, l.item_uuid, l.place_label
      into v_listing from listings l
      where l.id = v_case.listing_id and l.status = 'booked' for update;

      if not found or v_case.requester_id is null or v_case.requester_id = v_listing.seller_id then
        update escrow_cases as ec set status = 'disputed', resolved_at = now()
        where ec.id = v_case.id and ec.status = 'pending';
      else
        perform p.user_id from profiles p
        where p.user_id in (v_case.requester_id, v_listing.seller_id)
        order by p.user_id for update;

        select count(*)::int into v_profile_count from profiles p
        where p.user_id in (v_case.requester_id, v_listing.seller_id);
        select p.karma_balance into v_buyer_balance from profiles p
        where p.user_id = v_case.requester_id;

        if v_profile_count <> 2 or v_buyer_balance < v_listing.price_karma then
          update escrow_cases as ec set status = 'disputed', resolved_at = now()
          where ec.id = v_case.id and ec.status = 'pending';
        else
          update profiles p
          set karma_balance = p.karma_balance +
                case when p.user_id = v_case.requester_id then -v_listing.price_karma + 1 else v_listing.price_karma end,
              last_activity_at = now()
          where p.user_id in (v_case.requester_id, v_listing.seller_id);
          get diagnostics v_updated = row_count;
          if v_updated <> 2 then raise exception 'Konten konnten nicht vollständig aktualisiert werden'; end if;

          update listings l set status = 'completed', hands_count = l.hands_count + 1
          where l.id = v_listing.id and l.status = 'booked';
          get diagnostics v_updated = row_count;
          if v_updated <> 1 then raise exception 'Inserat konnte nicht sicher abgeschlossen werden'; end if;

          insert into ledger_entries(region_id, sender_id, receiver_id, listing_id, amount_karma, entry_kind, message)
          values (v_listing.region_id, v_case.requester_id, v_listing.seller_id, v_listing.id,
            v_listing.price_karma, 'transfer', 'Treuhand-Tausch nach Mehrheitsbeschluss: ' || v_listing.title);

          insert into ledger_entries(region_id, receiver_id, listing_id, amount_karma, entry_kind, message)
          values (v_listing.region_id, v_case.requester_id, v_listing.id, 1,
            'activity', 'Aktivitätsbonus nach Treuhand: ' || v_listing.title);

          insert into item_history(item_uuid, listing_id, owner_id, place_label, event_kind)
          values (v_listing.item_uuid, v_listing.id, v_case.requester_id, v_listing.place_label, 'transferred');

          update escrow_cases as ec set status = 'released', resolved_at = now()
          where ec.id = v_case.id and ec.status = 'pending';
        end if;
      end if;
    else
      update escrow_cases as ec set status = 'released', resolved_at = now()
      where ec.id = v_case.id and ec.status = 'pending';
    end if;
  elsif v_votes >= 4 and v_rejections >= ceil(v_votes * 2.0 / 3.0) then
    update escrow_cases as ec set status = 'disputed', resolved_at = now()
    where ec.id = v_case.id and ec.status = 'pending';
  end if;

  select e.* into v_case from escrow_cases e where e.id = v_case.id;
  return query select v_case.status, v_votes, v_approvals, v_rejections, v_assigned, v_required;
end;
$fn$;


-- The vote function trusts the moderator ID supplied by the authenticated server.
-- Prevent direct calls from browser-facing Supabase roles.
revoke all on function kreislauf_cast_escrow_vote(text, text, text, text) from public;
do $permissions$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on function kreislauf_cast_escrow_vote(text, text, text, text) from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on function kreislauf_cast_escrow_vote(text, text, text, text) from authenticated';
  end if;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    execute 'grant execute on function kreislauf_cast_escrow_vote(text, text, text, text) to service_role';
  end if;
end;
$permissions$;
