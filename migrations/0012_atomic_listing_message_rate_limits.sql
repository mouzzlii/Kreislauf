-- 0012_atomic_listing_message_rate_limits.sql
-- Replace count-based throttling with atomic per-account minute/hour buckets.
create table if not exists public.listing_message_rate_limits (
  sender_id text primary key references public.profiles(user_id) on delete cascade,
  minute_window_start timestamptz not null,
  minute_count integer not null check (minute_count between 0 and 12),
  hour_window_start timestamptz not null,
  hour_count integer not null check (hour_count between 0 and 80),
  updated_at timestamptz not null default now()
);
alter table public.listing_message_rate_limits enable row level security;
revoke all on table public.listing_message_rate_limits from public, anon, authenticated, service_role;

create or replace function public.kreislauf_limit_listing_messages()
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

drop trigger if exists listing_messages_rate_limit on public.listing_messages;
create trigger listing_messages_rate_limit
before insert on public.listing_messages
for each row execute function public.kreislauf_limit_listing_messages();
revoke all on function public.kreislauf_limit_listing_messages() from public;
