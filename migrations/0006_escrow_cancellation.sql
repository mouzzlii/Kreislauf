-- Allow a pending escrow to be explicitly closed when its booking is cancelled
-- or returned before the community vote has resolved it.
alter table public.escrow_cases
  drop constraint if exists escrow_cases_status_check;

alter table public.escrow_cases
  add constraint escrow_cases_status_check
  check (status in ('pending', 'released', 'disputed', 'cancelled'));

-- Keep the listing-linked conversation in sync with booking state changes.
create or replace function public.kreislauf_booking_status_message()
returns trigger
language plpgsql
as $fn$
declare
  v_body text;
begin
  if NEW.status is not distinct from OLD.status then
    return NEW;
  end if;

  v_body := case NEW.status
    when 'handed_over' then 'Übergabe bestätigt: Der Tauschvorgang wurde gestartet.'
    when 'returned' then 'Rückgabe bestätigt: Der Vorgang wurde abgeschlossen.'
    when 'cancelled' then 'Reservierung storniert: Die Buchung wurde beendet.'
    else null
  end;

  if v_body is not null then
    perform public.kreislauf_system_message(
      NEW.listing_id, NEW.renter_id, NEW.owner_id, v_body
    );
  end if;
  return NEW;
end;
$fn$;

drop trigger if exists bookings_status_message_updated on public.bookings;
create trigger bookings_status_message_updated
after update of status on public.bookings
for each row
execute function public.kreislauf_booking_status_message();

revoke all on function public.kreislauf_booking_status_message() from public;
