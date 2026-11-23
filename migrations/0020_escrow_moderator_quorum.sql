-- Require a real moderator quorum for every newly opened escrow case.
-- The assignment trigger (escrow_assign_moderators) runs alphabetically before
-- this guard. If fewer than four eligible moderators remain at insert time,
-- raise an exception so the entire booking/listing/escrow statement rolls back.
create or replace function public.kreislauf_require_escrow_moderator_quorum()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $fn$
declare
  v_assigned integer;
begin
  select count(*)::integer into v_assigned
  from public.escrow_moderators
  where escrow_id = new.id;

  if v_assigned < 4 then
    raise exception 'Treuhand benötigt mindestens vier aktive, verifizierte Moderationspersonen.'
      using errcode = '23514';
  end if;

  return new;
end;
$fn$;

drop trigger if exists escrow_require_moderator_quorum on public.escrow_cases;
create trigger escrow_require_moderator_quorum
after insert on public.escrow_cases
for each row execute function public.kreislauf_require_escrow_moderator_quorum();

revoke all on function public.kreislauf_require_escrow_moderator_quorum() from public;
do $permissions$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on function public.kreislauf_require_escrow_moderator_quorum() from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on function public.kreislauf_require_escrow_moderator_quorum() from authenticated';
  end if;
end;
$permissions$;
