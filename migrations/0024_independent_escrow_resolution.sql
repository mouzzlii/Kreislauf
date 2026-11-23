-- 0024_independent_escrow_resolution.sql
-- A party to a high-value escrow must never vote on its own dispute,
-- even if their profile also has moderator privileges or an assignment row.
create or replace function public.kreislauf_reject_party_escrow_resolution_vote()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $fn$
declare
  v_buyer_id text;
  v_seller_id text;
begin
  select buyer_id, seller_id
    into v_buyer_id, v_seller_id
  from public.escrow_cases
  where id = new.escrow_id;

  if new.moderator_id in (v_buyer_id, v_seller_id) then
    raise exception 'Tauschparteien dürfen nicht über ihren eigenen Streitfall abstimmen.'
      using errcode = '42501';
  end if;

  return new;
end;
$fn$;

drop trigger if exists escrow_resolution_vote_independent on public.escrow_resolution_votes;
create trigger escrow_resolution_vote_independent
before insert on public.escrow_resolution_votes
for each row execute function public.kreislauf_reject_party_escrow_resolution_vote();

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
