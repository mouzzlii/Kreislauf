-- Keep ledger transfer system messages in the canonical listing conversation.
-- The listing owner is always owner_id; the other transfer participant is requester_id.
create or replace function kreislauf_transfer_message() returns trigger language plpgsql as $fn$
declare
  v_owner_id text;
  v_requester_id text;
begin
  if NEW.entry_kind <> 'transfer' or NEW.listing_id is null or NEW.sender_id is null or NEW.receiver_id is null then
    return NEW;
  end if;

  select l.user_id into v_owner_id from listings l where l.id = NEW.listing_id;
  if v_owner_id is null then return NEW; end if;

  if NEW.sender_id = v_owner_id then
    v_requester_id := NEW.receiver_id;
  elsif NEW.receiver_id = v_owner_id then
    v_requester_id := NEW.sender_id;
  else
    return NEW;
  end if;

  perform kreislauf_system_message(NEW.listing_id, v_requester_id, v_owner_id,
    'Tauschvorgang aktualisiert: Die Karma-Buchung wurde erfasst.');
  return NEW;
end;
$fn$;

-- Recreate the trigger so clean installs and existing installations use the same function.
drop trigger if exists ledger_transfer_message on ledger_entries;
create trigger ledger_transfer_message after insert on ledger_entries
for each row execute function kreislauf_transfer_message();
