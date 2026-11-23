-- 0025_archive_legacy_conflicted_escrow_votes.sql
-- Preserve the audit trail, but remove party votes cast before migration 0024
-- from the live ballots so they can no longer influence quorum calculations.
create table if not exists public.escrow_vote_conflict_archive (
  id bigint generated always as identity primary key,
  ballot_type text not null check (ballot_type in ('approval','resolution')),
  source_vote_id bigint not null,
  escrow_id text not null,
  moderator_id text not null,
  party_role text not null check (party_role in ('buyer','seller')),
  choice text not null,
  note text not null default '',
  vote_created_at timestamptz not null,
  escrow_status_at_archive text,
  archived_at timestamptz not null default now(),
  unique (ballot_type, source_vote_id),
  check (
    (ballot_type = 'approval' and choice in ('approve','reject'))
    or (ballot_type = 'resolution' and choice in ('release','refund'))
  )
);
create index if not exists escrow_vote_conflict_archive_case_idx
  on public.escrow_vote_conflict_archive(escrow_id, archived_at desc);

alter table public.escrow_vote_conflict_archive enable row level security;
revoke all on table public.escrow_vote_conflict_archive from public;
do $permissions$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on table public.escrow_vote_conflict_archive from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on table public.escrow_vote_conflict_archive from authenticated';
  end if;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    execute 'revoke all on table public.escrow_vote_conflict_archive from service_role';
  end if;
end;
$permissions$;

-- Archive initial approval votes from a buyer or seller, retaining the
-- original vote, note, timestamp, party role and case status for audit.
insert into public.escrow_vote_conflict_archive
  (ballot_type, source_vote_id, escrow_id, moderator_id, party_role,
   choice, note, vote_created_at, escrow_status_at_archive)
select 'approval', v.id, v.escrow_id, v.moderator_id,
       case when v.moderator_id = e.buyer_id then 'buyer' else 'seller' end,
       v.vote, v.note, v.created_at, e.status
from public.escrow_votes v
join public.escrow_cases e on e.id = v.escrow_id
where v.moderator_id in (e.buyer_id, e.seller_id)
on conflict (ballot_type, source_vote_id) do nothing;

-- Archive later dispute-resolution votes under the same rule.
insert into public.escrow_vote_conflict_archive
  (ballot_type, source_vote_id, escrow_id, moderator_id, party_role,
   choice, note, vote_created_at, escrow_status_at_archive)
select 'resolution', v.id, v.escrow_id, v.moderator_id,
       case when v.moderator_id = e.buyer_id then 'buyer' else 'seller' end,
       v.decision, v.note, v.created_at, e.status
from public.escrow_resolution_votes v
join public.escrow_cases e on e.id = v.escrow_id
where v.moderator_id in (e.buyer_id, e.seller_id)
on conflict (ballot_type, source_vote_id) do nothing;

-- Remove the conflicted entries from the active ballots. Their audit copies
-- remain in escrow_vote_conflict_archive and no longer count toward quorum.
delete from public.escrow_votes v
using public.escrow_cases e
where e.id = v.escrow_id
  and v.moderator_id in (e.buyer_id, e.seller_id);

delete from public.escrow_resolution_votes v
using public.escrow_cases e
where e.id = v.escrow_id
  and v.moderator_id in (e.buyer_id, e.seller_id);
