-- KREISLAUF: listing conversations and quorum-based community escrow.
create table if not exists listing_conversations (
  id text primary key,
  listing_id text not null references listings(id),
  requester_id text not null references profiles(user_id),
  owner_id text not null references profiles(user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (listing_id, requester_id),
  check (requester_id <> owner_id)
);
create index if not exists listing_conversations_owner_idx on listing_conversations(owner_id, updated_at desc);
create index if not exists listing_conversations_requester_idx on listing_conversations(requester_id, updated_at desc);

create table if not exists listing_messages (
  id bigint generated always as identity primary key,
  conversation_id text not null references listing_conversations(id),
  sender_id text references profiles(user_id),
  body text not null,
  message_kind text not null default 'user' check (message_kind in ('user','system')),
  created_at timestamptz not null default now(),
  read_at timestamptz,
  check (length(body) between 1 and 2000)
);
create index if not exists listing_messages_conversation_idx on listing_messages(conversation_id, id);

create table if not exists escrow_moderators (
  escrow_id text not null references escrow_cases(id) on delete cascade,
  moderator_id text not null references profiles(user_id),
  assigned_at timestamptz not null default now(),
  primary key (escrow_id, moderator_id)
);
create table if not exists escrow_votes (
  id bigint generated always as identity primary key,
  escrow_id text not null references escrow_cases(id) on delete cascade,
  moderator_id text not null references profiles(user_id),
  vote text not null check (vote in ('approve','reject')),
  note text not null default '',
  created_at timestamptz not null default now(),
  unique (escrow_id, moderator_id)
);
create index if not exists escrow_votes_case_idx on escrow_votes(escrow_id);

-- A conversation is created automatically when a booking, escrow request or
-- completed direct exchange is recorded. User messages stay tied to that listing.
create or replace function kreislauf_system_message(
  p_listing_id text, p_requester_id text, p_owner_id text, p_body text
) returns void language plpgsql as $fn$
declare v_conversation_id text;
begin
  if p_requester_id is null or p_owner_id is null or p_requester_id = p_owner_id then return; end if;
  insert into listing_conversations(id, listing_id, requester_id, owner_id)
  values ('conv-' || md5(p_listing_id || ':' || p_requester_id), p_listing_id, p_requester_id, p_owner_id)
  on conflict (listing_id, requester_id) do update set updated_at = now()
  returning id into v_conversation_id;
  insert into listing_messages(conversation_id, sender_id, body, message_kind)
  values (v_conversation_id, null, left(p_body, 2000), 'system');
end;
$fn$;

create or replace function kreislauf_booking_message() returns trigger language plpgsql as $fn$
begin
  perform kreislauf_system_message(NEW.listing_id, NEW.renter_id, NEW.owner_id,
    'Neue Tauschanfrage: Reservierung wurde angelegt.');
  return NEW;
end;
$fn$;
drop trigger if exists bookings_message_created on bookings;
create trigger bookings_message_created after insert on bookings
for each row execute function kreislauf_booking_message();

create or replace function kreislauf_escrow_message() returns trigger language plpgsql as $fn$
declare v_owner text;
begin
  select user_id into v_owner from listings where id = NEW.listing_id;
  perform kreislauf_system_message(NEW.listing_id, NEW.requester_id, v_owner,
    'Treuhandvorgang eröffnet: Die Community-Moderation wurde angefordert.');
  return NEW;
end;
$fn$;
drop trigger if exists escrow_message_created on escrow_cases;
create trigger escrow_message_created after insert on escrow_cases
for each row execute function kreislauf_escrow_message();

create or replace function kreislauf_transfer_message() returns trigger language plpgsql as $fn$
begin
  if NEW.entry_kind = 'transfer' and NEW.listing_id is not null and NEW.sender_id is not null and NEW.receiver_id is not null then
    perform kreislauf_system_message(NEW.listing_id, NEW.sender_id, NEW.receiver_id,
      'Tauschvorgang aktualisiert: Die Karma-Buchung wurde erfasst.');
  end if;
  return NEW;
end;
$fn$;
drop trigger if exists ledger_transfer_message on ledger_entries;
create trigger ledger_transfer_message after insert on ledger_entries
for each row execute function kreislauf_transfer_message();

-- Assign up to seven recently active, verified regional moderators. At least
-- four votes are required before a decision can be made.
create or replace function kreislauf_assign_escrow_moderators() returns trigger language plpgsql as $fn$
declare v_region text; v_owner text;
begin
  select region_id, user_id into v_region, v_owner from listings where id = NEW.listing_id;
  if NEW.moderator_id is not null then
    insert into escrow_moderators(escrow_id, moderator_id)
    values (NEW.id, NEW.moderator_id) on conflict do nothing;
  end if;
  insert into escrow_moderators(escrow_id, moderator_id)
  select NEW.id, p.user_id
  from profiles p
  where p.region_id = v_region and p.user_id <> coalesce(NEW.requester_id, '')
    and p.user_id <> coalesce(v_owner, '')
    and p.is_verified = true and p.moderator_rank > 0
    and p.last_active_at >= now() - interval '30 days'
  order by random()
  limit greatest(0, 7 - (select count(*) from escrow_moderators em where em.escrow_id = NEW.id))
  on conflict do nothing;
  return NEW;
end;
$fn$;
drop trigger if exists escrow_assign_moderators on escrow_cases;
create trigger escrow_assign_moderators after insert on escrow_cases
for each row execute function kreislauf_assign_escrow_moderators();

-- Backfill assignments for open cases created before this migration.
insert into escrow_moderators(escrow_id, moderator_id)
select id, moderator_id from escrow_cases
where moderator_id is not null
on conflict do nothing;
