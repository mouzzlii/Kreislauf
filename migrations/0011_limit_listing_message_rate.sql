-- 0011_limit_listing_message_rate.sql
-- Prevent abusive bursts in listing-linked conversations. System messages
-- (sender_id IS NULL) are intentionally not rate limited.
create index if not exists listing_messages_sender_created_idx
  on public.listing_messages(sender_id, created_at desc)
  where message_kind = 'user' and sender_id is not null;

create or replace function public.kreislauf_limit_listing_messages()
returns trigger
language plpgsql
set search_path = pg_catalog, public, pg_temp
as $fn$
declare
  v_minute_count integer;
  v_hour_count integer;
begin
  if NEW.message_kind <> 'user' then
    return NEW;
  end if;

  if NEW.sender_id is null then
    raise exception 'User-Nachrichten benötigen ein Absenderkonto.'
      using errcode = '23514';
  end if;

  -- Serialize inserts from the same account to prevent concurrent requests
  -- from bypassing the count checks across multiple conversations.
  perform pg_advisory_xact_lock(hashtextextended(NEW.sender_id::text, 0));

  select count(*)::integer into v_minute_count
  from public.listing_messages
  where sender_id = NEW.sender_id
    and message_kind = 'user'
    and created_at > now() - interval '1 minute';

  if v_minute_count >= 12 then
    raise exception 'Zu viele Nachrichten. Bitte warte eine Minute.'
      using errcode = 'P0001';
  end if;

  select count(*)::integer into v_hour_count
  from public.listing_messages
  where sender_id = NEW.sender_id
    and message_kind = 'user'
    and created_at > now() - interval '1 hour';

  if v_hour_count >= 80 then
    raise exception 'Das stündliche Nachrichtenlimit ist erreicht. Bitte versuche es später erneut.'
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
