-- 0018_booking_bilateral_handover.sql
-- A sharing handover must be confirmed independently by both booking parties.
-- Preserve already completed historical handovers when adding the new columns.
alter table public.bookings
  add column if not exists renter_handover_at timestamptz,
  add column if not exists owner_handover_at timestamptz;

update public.bookings
set renter_handover_at = coalesce(renter_handover_at, created_at),
    owner_handover_at = coalesce(owner_handover_at, created_at)
where status in ('handed_over', 'returned')
  and (renter_handover_at is null or owner_handover_at is null);

alter table public.bookings
  drop constraint if exists bookings_bilateral_handover_check;

alter table public.bookings
  add constraint bookings_bilateral_handover_check
  check (
    status not in ('handed_over', 'returned')
    or (renter_handover_at is not null and owner_handover_at is not null)
  );
