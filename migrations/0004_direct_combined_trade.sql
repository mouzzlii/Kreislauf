-- KREISLAUF: direct barter and combined exchange offers.
-- Positive karma_adjustment is paid by the requesting member to the listing owner.
-- No wallet or legacy booking rows are modified by this migration.

alter table listings
  add column if not exists exchange_terms text,
  add column if not exists karma_adjustment integer not null default 0
    check (karma_adjustment between 0 and 500);

alter table listings drop constraint if exists listings_offer_type_check;
alter table listings add constraint listings_offer_type_check
  check (offer_type in ('sell', 'search', 'gift', 'barter', 'combined'));

alter table listings drop constraint if exists listings_exchange_category_check;
alter table listings add constraint listings_exchange_category_check
  check (offer_type not in ('barter', 'combined') or category in ('goods', 'service'));

alter table listings drop constraint if exists listings_exchange_terms_check;
alter table listings add constraint listings_exchange_terms_check
  check (
    offer_type not in ('barter', 'combined')
    or (exchange_terms is not null and length(btrim(exchange_terms)) between 8 and 400)
  );

alter table listings drop constraint if exists listings_direct_barter_no_karma_check;
alter table listings add constraint listings_direct_barter_no_karma_check
  check (offer_type <> 'barter' or karma_adjustment = 0);

create table if not exists trade_requests (
  id text primary key,
  listing_id text not null references listings(id),
  region_id text not null references regions(id),
  requester_id text not null references profiles(user_id),
  owner_id text not null references profiles(user_id),
  offered_description text not null check (length(btrim(offered_description)) between 8 and 400),
  karma_amount integer not null default 0 check (karma_amount between 0 and 500),
  status text not null default 'requested'
    check (status in ('requested', 'accepted', 'rejected', 'cancelled', 'completed', 'disputed')),
  requester_confirmed boolean not null default false,
  owner_confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  check (requester_id <> owner_id)
);

-- A listing can have only one live proposal at a time. Rejected/cancelled proposals
-- remain in the audit history but do not block a later proposal.
create unique index if not exists trade_requests_one_open_per_listing_idx
  on trade_requests(listing_id)
  where status in ('requested', 'accepted', 'disputed');

create index if not exists trade_requests_requester_idx
  on trade_requests(requester_id, status, created_at desc);
create index if not exists trade_requests_owner_idx
  on trade_requests(owner_id, status, created_at desc);
