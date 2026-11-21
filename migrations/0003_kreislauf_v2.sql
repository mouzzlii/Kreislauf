-- KREISLAUF v2: listing intent, privacy, item lifecycle, community trust and verification
alter table listings add column if not exists offer_type text not null default 'sell';
alter table listings drop constraint if exists listings_offer_type_check;
alter table listings add constraint listings_offer_type_check check (offer_type in ('sell','search','gift'));
alter table listings add column if not exists what3words_address text;
alter table listings add column if not exists item_uuid text;
alter table listings add column if not exists hands_count integer not null default 0 check (hands_count >= 0);
update listings set item_uuid = 'item-' || replace(id, 'lst-', '') where item_uuid is null;
drop index if exists listings_item_uuid_idx;
create index if not exists listings_item_uuid_idx on listings(item_uuid);

alter table profiles add column if not exists is_verified boolean not null default false;
alter table profiles add column if not exists moderator_rank integer not null default 0;
alter table profiles add column if not exists last_active_at timestamptz not null default now();

create table if not exists item_history (
  id bigint generated always as identity primary key,
  item_uuid text not null,
  listing_id text not null references listings(id),
  owner_id text references profiles(user_id),
  place_label text not null default 'In der Region',
  event_kind text not null default 'listed' check (event_kind in ('listed','transferred','gifted','loaned')),
  created_at timestamptz not null default now()
);
create index if not exists item_history_item_idx on item_history(item_uuid, created_at desc);

create table if not exists escrow_cases (
  id text primary key,
  listing_id text not null references listings(id),
  booking_id text references bookings(id),
  moderator_id text references profiles(user_id),
  status text not null default 'pending' check (status in ('pending','released','disputed')),
  reason text not null default 'Community-Treuhand',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
create index if not exists escrow_listing_idx on escrow_cases(listing_id, created_at desc);

-- Seeded sample accounts are not government-verified and are not moderators.

alter table ledger_entries drop constraint if exists ledger_entries_entry_kind_check;
alter table ledger_entries add constraint ledger_entries_entry_kind_check
  check (entry_kind in ('mint','transfer','demurrage','activity'));

insert into item_history (item_uuid, listing_id, owner_id, place_label, event_kind, created_at)
select l.item_uuid, l.id, l.user_id, l.place_label, 'listed', l.created_at
from listings l
where not exists (select 1 from item_history h where h.item_uuid = l.item_uuid);

alter table escrow_cases add column if not exists requester_id text references profiles(user_id);

create unique index if not exists escrow_one_pending_per_listing_idx
  on escrow_cases(listing_id) where status = 'pending';
