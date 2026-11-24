-- 0028_independent_all_escrow_parties.sql
-- Prevent every transaction party from voting on any escrow ballot, including
-- standard sharing reservations where buyer_id/seller_id are intentionally NULL.
-- The database guard is defense in depth even if an assignment row is inserted
-- manually or by a future admin workflow.
create or replace function public.kreislauf_reject_party_escrow_resolution_vote()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $fn$
declare
  v_buyer_id text;
  v_seller_id text;
  v_requester_id text;
  v_listing_owner_id text;
begin
  select e.buyer_id, e.seller_id, e.requester_id, l.user_id
    into v_buyer_id, v_seller_id, v_requester_id, v_listing_owner_id
  from public.escrow_cases e
  join public.listings l on l.id = e.listing_id
  where e.id = new.escrow_id;

  if new.moderator_id = v_buyer_id
    or new.moderator_id = v_seller_id
    or new.moderator_id = v_requester_id
    or new.moderator_id = v_listing_owner_id then
    raise exception 'Tauschparteien dürfen nicht über ihren eigenen Treuhand- oder Streitfall abstimmen.'
      using errcode = '42501';
  end if;

  return new;
end;
$fn$;

revoke all on function public.kreislauf_reject_party_escrow_resolution_vote() from public;
do $permissions$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on function public.kreislauf_reject_party_escrow_resolution_vote() from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on function public.kreislauf_reject_party_escrow_resolution_vote() from authenticated';
  end if;
end;
$permissions$;
