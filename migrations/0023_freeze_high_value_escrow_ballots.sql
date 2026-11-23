-- 0023_freeze_high_value_escrow_ballots.sql
-- Once a high-value escrow reaches a two-thirds community decision, prevent
-- late votes from changing that decision while the two parties confirm receipt.
create or replace function kreislauf_cast_escrow_vote(
  p_listing_id text, p_moderator_id text, p_vote text, p_note text default ''
)
returns table(status text, votes integer, approvals integer, rejections integer, assigned integer, required integer)
language plpgsql
set search_path = pg_catalog, public, pg_temp
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
  v_existing_votes integer := 0;
  v_existing_approvals integer := 0;
  v_existing_rejections integer := 0;
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

  -- High-value escrow stays pending after approval until both parties confirm.
  -- Freeze the community ballot as soon as a two-thirds decision exists so a
  -- late vote cannot reverse the decision between the first and second receipt.
  if v_case.reason = 'Hochwertiges Tauschgeschäft' then
    select count(*)::int,
      count(*) filter (where vote = 'approve')::int,
      count(*) filter (where vote = 'reject')::int
    into v_existing_votes, v_existing_approvals, v_existing_rejections
    from escrow_votes
    where escrow_id = v_case.id;

    if v_existing_votes >= 4
      and greatest(v_existing_approvals, v_existing_rejections)
        >= ceil(v_existing_votes * 2.0 / 3.0) then
      raise exception 'Die Community-Abstimmung ist bereits abgeschlossen.';
    end if;
  end if;

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
      -- Fail closed: moderator approval is not proof that goods changed hands.
      -- Keep the listing reserved and the case pending until bilateral receipt
      -- confirmation and a separately audited dispute process are implemented.
      null;
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

revoke all on function public.kreislauf_cast_escrow_vote(text, text, text, text) from public;
do $permissions$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on function public.kreislauf_cast_escrow_vote(text, text, text, text) from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on function public.kreislauf_cast_escrow_vote(text, text, text, text) from authenticated';
  end if;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    execute 'grant execute on function public.kreislauf_cast_escrow_vote(text, text, text, text) to service_role';
  end if;
end;
$permissions$;
