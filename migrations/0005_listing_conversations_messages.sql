-- Listing-bound conversations for inquiries and trade workflows.
-- All client access goes through authenticated server functions.
create table if not exists listing_conversations (
  id text primary key,
  listing_id text not null references listings(id) on delete cascade,
  requester_id text not null references profiles(user_id) on delete cascade,
  owner_id text not null references profiles(user_id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (listing_id, requester_id),
  check (requester_id <> owner_id)
);

create index if not exists listing_conversations_owner_idx
  on listing_conversations(owner_id, updated_at desc);
create index if not exists listing_conversations_requester_idx
  on listing_conversations(requester_id, updated_at desc);

create table if not exists listing_messages (
  id bigint generated always as identity primary key,
  conversation_id text not null references listing_conversations(id) on delete cascade,
  sender_id text references profiles(user_id) on delete set null,
  body text not null check (length(body) between 1 and 2000),
  message_kind text not null default 'user' check (message_kind in ('user','system')),
  created_at timestamptz not null default now(),
  read_at timestamptz,
  check (message_kind <> 'user' or sender_id is not null)
);

create index if not exists listing_messages_conversation_idx
  on listing_messages(conversation_id, id);
create index if not exists listing_messages_unread_idx
  on listing_messages(conversation_id, created_at desc)
  where read_at is null;

-- Atomic per-account limits for user-authored messages. System events inserted
-- by trade transactions are exempt; one account cannot bypass limits by opening
-- many conversations or sending concurrent requests.
create table if not exists listing_message_rate_limits (
  sender_id text primary key references profiles(user_id) on delete cascade,
  minute_window_start timestamptz not null,
  minute_count integer not null check (minute_count between 0 and 12),
  hour_window_start timestamptz not null,
  hour_count integer not null check (hour_count between 0 and 80),
  updated_at timestamptz not null default now()
);

alter table listing_conversations enable row level security;
alter table listing_messages enable row level security;
alter table listing_message_rate_limits enable row level security;
revoke all on table listing_conversations, listing_messages, listing_message_rate_limits from public;

do $roles$
declare role_name text;
begin
  foreach role_name in array array['anon', 'authenticated', 'service_role'] loop
    if exists (select 1 from pg_roles where rolname = role_name) then
      execute format('revoke all on table listing_conversations, listing_messages, listing_message_rate_limits from %I', role_name);
    end if;
  end loop;
end;
$roles$;

create or replace function kreislauf_limit_listing_messages()
returns trigger
language plpgsql
set search_path = pg_catalog, public, pg_temp
as $fn$
declare
  v_now timestamptz := now();
  v_minute timestamptz;
  v_hour timestamptz;
  v_sender text;
begin
  if NEW.message_kind <> 'user' then return NEW; end if;
  if NEW.sender_id is null then
    raise exception 'User-Nachrichten benötigen ein Absenderkonto.' using errcode = '23514';
  end if;

  v_sender := NEW.sender_id::text;
  v_minute := date_trunc('minute', v_now);
  v_hour := date_trunc('hour', v_now);

  insert into public.listing_message_rate_limits
    (sender_id, minute_window_start, minute_count, hour_window_start, hour_count, updated_at)
  values (v_sender, v_minute, 1, v_hour, 1, v_now)
  on conflict (sender_id) do update
  set minute_count = case
        when public.listing_message_rate_limits.minute_window_start = excluded.minute_window_start
          then public.listing_message_rate_limits.minute_count + 1 else 1 end,
      minute_window_start = excluded.minute_window_start,
      hour_count = case
        when public.listing_message_rate_limits.hour_window_start = excluded.hour_window_start
          then public.listing_message_rate_limits.hour_count + 1 else 1 end,
      hour_window_start = excluded.hour_window_start,
      updated_at = excluded.updated_at
  where (case
          when public.listing_message_rate_limits.minute_window_start = excluded.minute_window_start
            then public.listing_message_rate_limits.minute_count else 0 end) < 12
    and (case
          when public.listing_message_rate_limits.hour_window_start = excluded.hour_window_start
            then public.listing_message_rate_limits.hour_count else 0 end) < 80
  returning sender_id into v_sender;

  if v_sender is null then
    raise exception 'Nachrichtenlimit erreicht. Bitte warte und versuche es später erneut.'
      using errcode = 'P0001';
  end if;
  return NEW;
end;
$fn$;

drop trigger if exists listing_messages_rate_limit on listing_messages;
create trigger listing_messages_rate_limit
before insert on listing_messages
for each row execute function kreislauf_limit_listing_messages();

revoke all on function kreislauf_limit_listing_messages() from public;
