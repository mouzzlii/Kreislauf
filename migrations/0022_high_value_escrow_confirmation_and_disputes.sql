-- 0022_high_value_escrow_confirmation_and_disputes.sql
-- Bilateral receipt confirmation releases reserved Karma only after community approval.
-- Either party may open a dispute; an independent moderator quorum then chooses release or refund.
create or replace function public.kreislauf_confirm_high_value_escrow(
  p_listing_id text,
  p_actor_id text
) returns table(status text, buyer_confirmed boolean, seller_confirmed boolean, funds_status text)
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
#variable_conflict use_column
#variable_conflict use_column
declare
  v_case public.escrow_cases%rowtype;
  v_votes integer;
  v_approvals integer;
  v_listing_id text;
begin
  select e.* into v_case
  from public.escrow_cases e
  where e.listing_id = p_listing_id
    and e.reason = 'Hochwertiges Tauschgeschäft'
    and e.status = 'pending'
    and e.funds_status = 'held'
  order by e.created_at desc
  limit 1
  for update;

  if not found then
    raise exception 'Keine offene, finanzierte hochwertige Treuhand gefunden.';
  end if;
  if p_actor_id not in (v_case.buyer_id, v_case.seller_id) then
    raise exception 'Nur die beiden Tauschparteien dürfen die Übergabe bestätigen.';
  end if;

  select count(*)::integer,
    count(*) filter (where vote = 'approve')::integer
  into v_votes, v_approvals
  from public.escrow_votes
  where escrow_id = v_case.id;

  if v_votes < 4 or v_approvals < ceil(v_votes * 2.0 / 3.0) then
    raise exception 'Die erforderliche Community-Freigabe liegt noch nicht vor.';
  end if;

  if p_actor_id = v_case.buyer_id then
    update public.escrow_cases
      set buyer_confirmed_at = coalesce(buyer_confirmed_at, now())
      where id = v_case.id;
  else
    update public.escrow_cases
      set seller_confirmed_at = coalesce(seller_confirmed_at, now())
      where id = v_case.id;
  end if;

  select e.* into v_case from public.escrow_cases e where e.id = v_case.id;
  if v_case.buyer_confirmed_at is null or v_case.seller_confirmed_at is null then
    return query select v_case.status, v_case.buyer_confirmed_at is not null, v_case.seller_confirmed_at is not null, v_case.funds_status;
    return;
  end if;

  perform 1 from public.listings l
    where l.id = v_case.listing_id and l.status = 'booked'
    for update;
  if not found then
    raise exception 'Das Inserat ist nicht mehr für diese Treuhand reserviert.';
  end if;

  perform 1 from public.profiles p
    where p.user_id in (v_case.buyer_id, v_case.seller_id)
    order by p.user_id
    for update;

  update public.profiles
    set karma_balance = karma_balance + v_case.amount_karma,
        last_activity_at = now()
    where user_id = v_case.seller_id;

  insert into public.ledger_entries
    (region_id, receiver_id, listing_id, amount_karma, entry_kind, message)
  values
    (v_case.region_id, v_case.seller_id, v_case.listing_id, v_case.amount_karma,
     'escrow_release', 'Treuhand freigegeben nach beidseitiger Übergabebestätigung');

  update public.listings as l
    set status = 'completed', hands_count = l.hands_count + 1
    where l.id = v_case.listing_id and l.status = 'booked'
    returning id into v_listing_id;
  if v_listing_id is null then
    raise exception 'Inserat konnte nicht abgeschlossen werden.';
  end if;

  insert into public.item_history(item_uuid, listing_id, owner_id, place_label, event_kind)
  select item_uuid, id, v_case.buyer_id, place_label, 'transferred'
  from public.listings where id = v_case.listing_id;

  update public.escrow_cases as ec
    set status = 'released', funds_status = 'released', resolved_at = now()
    where ec.id = v_case.id and ec.status = 'pending' and ec.funds_status = 'held';

  return query select 'released'::text, true, true, 'released'::text;
end;
$fn$;

create or replace function public.kreislauf_open_high_value_dispute(
  p_listing_id text,
  p_actor_id text,
  p_reason text
) returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
declare
  v_case public.escrow_cases%rowtype;
begin
  select e.* into v_case
  from public.escrow_cases e
  where e.listing_id = p_listing_id
    and e.reason = 'Hochwertiges Tauschgeschäft'
    and e.status = 'pending'
    and e.funds_status = 'held'
  order by e.created_at desc
  limit 1
  for update;

  if not found then raise exception 'Keine offene Treuhand gefunden.'; end if;
  if p_actor_id not in (v_case.buyer_id, v_case.seller_id) then
    raise exception 'Nur die Tauschparteien dürfen einen Streitfall eröffnen.';
  end if;
  if length(trim(coalesce(p_reason, ''))) < 10 then
    raise exception 'Bitte beschreibe den Streitfall mit mindestens 10 Zeichen.';
  end if;

  update public.escrow_cases
    set status = 'disputed',
        dispute_reason = left(trim(p_reason), 1000)
    where id = v_case.id and status = 'pending';

  return v_case.id;
end;
$fn$;

create or replace function public.kreislauf_vote_escrow_resolution(
  p_listing_id text,
  p_moderator_id text,
  p_decision text,
  p_note text default ''
) returns table(status text, votes integer, releases integer, refunds integer, assigned integer)
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
#variable_conflict use_column
declare
  v_case public.escrow_cases%rowtype;
  v_votes integer;
  v_releases integer;
  v_refunds integer;
  v_assigned integer;
  v_decision text;
  v_listing_id text;
begin
  if p_decision not in ('release','refund') then
    raise exception 'Ungültige Streitfallentscheidung.';
  end if;

  select e.* into v_case
  from public.escrow_cases e
  where e.listing_id = p_listing_id
    and e.reason = 'Hochwertiges Tauschgeschäft'
    and e.status = 'disputed'
    and e.funds_status = 'held'
  order by e.created_at desc
  limit 1
  for update;

  if not found then raise exception 'Kein offener finanzierter Streitfall gefunden.'; end if;

  if not exists (
    select 1
    from public.escrow_moderators a
    join public.profiles p on p.user_id = a.moderator_id
    where a.escrow_id = v_case.id
      and a.moderator_id = p_moderator_id
      and p.is_verified = true
      and p.moderator_rank > 0
      and p.last_active_at >= now() - interval '30 days'
  ) then
    raise exception 'Keine aktive Moderationszuordnung.';
  end if;

  insert into public.escrow_resolution_votes(escrow_id,moderator_id,decision,note)
  values (v_case.id,p_moderator_id,p_decision,left(coalesce(p_note,''),500));

  select count(*)::integer,
    count(*) filter (where decision = 'release')::integer,
    count(*) filter (where decision = 'refund')::integer
  into v_votes,v_releases,v_refunds
  from public.escrow_resolution_votes where escrow_id = v_case.id;

  select count(*)::integer into v_assigned
  from public.escrow_moderators where escrow_id = v_case.id;

  if v_votes >= 4 and greatest(v_releases,v_refunds) >= ceil(v_votes * 2.0 / 3.0) then
    v_decision := case when v_releases > v_refunds then 'release' else 'refund' end;

    perform 1 from public.listings l
      where l.id = v_case.listing_id and l.status = 'booked'
      for update;
    if not found then raise exception 'Das reservierte Inserat ist nicht mehr verfügbar.'; end if;

    perform 1 from public.profiles p
      where p.user_id in (v_case.buyer_id,v_case.seller_id)
      order by p.user_id
      for update;

    if v_decision = 'release' then
      update public.profiles
        set karma_balance = karma_balance + v_case.amount_karma, last_activity_at = now()
        where user_id = v_case.seller_id;
      insert into public.ledger_entries
        (region_id,receiver_id,listing_id,amount_karma,entry_kind,message)
      values
        (v_case.region_id,v_case.seller_id,v_case.listing_id,v_case.amount_karma,
         'escrow_release','Treuhand durch dokumentierte Moderationsentscheidung freigegeben');
      update public.listings as l set status = 'completed', hands_count = l.hands_count + 1
        where l.id = v_case.listing_id and l.status = 'booked'
        returning id into v_listing_id;
      if v_listing_id is null then raise exception 'Inserat konnte nicht abgeschlossen werden.'; end if;
      insert into public.item_history(item_uuid,listing_id,owner_id,place_label,event_kind)
      select item_uuid,id,v_case.buyer_id,place_label,'transferred'
      from public.listings where id = v_case.listing_id;
      update public.escrow_cases as ec set status = 'released', funds_status = 'released', resolved_at = now()
        where ec.id = v_case.id and ec.status = 'disputed' and ec.funds_status = 'held';
    else
      update public.profiles
        set karma_balance = karma_balance + v_case.amount_karma, last_activity_at = now()
        where user_id = v_case.buyer_id;
      insert into public.ledger_entries
        (region_id,receiver_id,listing_id,amount_karma,entry_kind,message)
      values
        (v_case.region_id,v_case.buyer_id,v_case.listing_id,v_case.amount_karma,
         'escrow_refund','Treuhand nach dokumentierter Moderationsentscheidung erstattet');
      update public.listings as l set status = 'active'
        where l.id = v_case.listing_id and l.status = 'booked'
        returning id into v_listing_id;
      if v_listing_id is null then raise exception 'Inserat konnte nicht wieder freigegeben werden.'; end if;
      update public.escrow_cases as ec set status = 'refunded', funds_status = 'refunded', resolved_at = now()
        where ec.id = v_case.id and ec.status = 'disputed' and ec.funds_status = 'held';
    end if;
  end if;

  select e.* into v_case from public.escrow_cases e where e.id = v_case.id;
  return query select v_case.status,v_votes,v_releases,v_refunds,v_assigned;
end;
$fn$;


-- Participant-visible message when reserved Karma is released or refunded.
create or replace function public.kreislauf_escrow_funds_message()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
#variable_conflict use_column
declare
  v_buyer text;
  v_seller text;
  v_body text;
begin
  if NEW.entry_kind not in ('escrow_release','escrow_refund') or NEW.listing_id is null then
    return NEW;
  end if;
  select buyer_id, seller_id into v_buyer, v_seller
  from public.escrow_cases
  where listing_id = NEW.listing_id and funds_status = 'held'
  order by created_at desc limit 1;
  if v_buyer is null or v_seller is null then return NEW; end if;
  v_body := case NEW.entry_kind
    when 'escrow_release' then 'Treuhand abgeschlossen: Die reservierten Karma-Punkte wurden an die anbietende Person übertragen.'
    else 'Treuhand abgeschlossen: Die reservierten Karma-Punkte wurden an die kaufende Person zurückerstattet.'
  end;
  perform public.kreislauf_system_message(NEW.listing_id, v_buyer, v_seller, v_body);
  return NEW;
end;
$fn$;

drop trigger if exists escrow_funds_message_created on public.ledger_entries;
create trigger escrow_funds_message_created
after insert on public.ledger_entries
for each row
when (NEW.entry_kind in ('escrow_release','escrow_refund'))
execute function public.kreislauf_escrow_funds_message();

revoke all on function public.kreislauf_escrow_funds_message() from public;
do $message_permissions$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on function public.kreislauf_escrow_funds_message() from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on function public.kreislauf_escrow_funds_message() from authenticated';
  end if;
end;
$message_permissions$;

revoke all on function public.kreislauf_confirm_high_value_escrow(text,text) from public;
revoke all on function public.kreislauf_open_high_value_dispute(text,text,text) from public;
revoke all on function public.kreislauf_vote_escrow_resolution(text,text,text,text) from public;
do $permissions$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on function public.kreislauf_confirm_high_value_escrow(text,text) from anon';
    execute 'revoke all on function public.kreislauf_open_high_value_dispute(text,text,text) from anon';
    execute 'revoke all on function public.kreislauf_vote_escrow_resolution(text,text,text,text) from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on function public.kreislauf_confirm_high_value_escrow(text,text) from authenticated';
    execute 'revoke all on function public.kreislauf_open_high_value_dispute(text,text,text) from authenticated';
    execute 'revoke all on function public.kreislauf_vote_escrow_resolution(text,text,text,text) from authenticated';
  end if;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    execute 'grant execute on function public.kreislauf_confirm_high_value_escrow(text,text) to service_role';
    execute 'grant execute on function public.kreislauf_open_high_value_dispute(text,text,text) to service_role';
    execute 'grant execute on function public.kreislauf_vote_escrow_resolution(text,text,text,text) to service_role';
  end if;
end;
$permissions$;
