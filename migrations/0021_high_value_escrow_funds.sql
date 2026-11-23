-- 0021_high_value_escrow_funds.sql
-- Record the actual parties and amount for high-value goods/service escrow.
-- The buyer's Karma is reserved at request time, not merely checked beforehand.
alter table public.escrow_cases
  add column if not exists buyer_id text references public.profiles(user_id),
  add column if not exists seller_id text references public.profiles(user_id),
  add column if not exists region_id text references public.regions(id),
  add column if not exists amount_karma integer,
  add column if not exists funds_status text not null default 'not_applicable',
  add column if not exists buyer_confirmed_at timestamptz,
  add column if not exists seller_confirmed_at timestamptz,
  add column if not exists dispute_reason text;

alter table public.escrow_cases
  drop constraint if exists escrow_cases_funds_status_check;
alter table public.escrow_cases
  add constraint escrow_cases_funds_status_check
  check (funds_status in ('not_applicable','held','released','refunded'));

alter table public.escrow_cases
  drop constraint if exists escrow_cases_amount_karma_check;
alter table public.escrow_cases
  add constraint escrow_cases_amount_karma_check
  check (amount_karma is null or amount_karma > 0);

alter table public.escrow_cases
  drop constraint if exists escrow_cases_parties_check;
alter table public.escrow_cases
  add constraint escrow_cases_parties_check
  check (
    funds_status = 'not_applicable'
    or (
      buyer_id is not null and seller_id is not null
      and buyer_id = requester_id and buyer_id <> seller_id
      and amount_karma is not null and region_id is not null
    )
  );

alter table public.escrow_cases
  drop constraint if exists escrow_cases_status_check;
alter table public.escrow_cases
  add constraint escrow_cases_status_check
  check (status in ('pending','released','disputed','cancelled','refunded'));

alter table public.ledger_entries
  drop constraint if exists ledger_entries_entry_kind_check;
alter table public.ledger_entries
  add constraint ledger_entries_entry_kind_check
  check (entry_kind in (
    'mint','transfer','demurrage','activity',
    'escrow_hold','escrow_release','escrow_refund'
  ));

create table if not exists public.escrow_resolution_votes (
  id bigint generated always as identity primary key,
  escrow_id text not null references public.escrow_cases(id) on delete cascade,
  moderator_id text not null references public.profiles(user_id),
  decision text not null check (decision in ('release','refund')),
  note text not null default '',
  created_at timestamptz not null default now(),
  unique (escrow_id, moderator_id)
);
create index if not exists escrow_resolution_votes_case_idx
  on public.escrow_resolution_votes(escrow_id);
alter table public.escrow_resolution_votes enable row level security;
revoke all on table public.escrow_resolution_votes from public;
do $permissions$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on table public.escrow_resolution_votes from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on table public.escrow_resolution_votes from authenticated';
  end if;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    execute 'revoke all on table public.escrow_resolution_votes from service_role';
  end if;
end;
$permissions$;
