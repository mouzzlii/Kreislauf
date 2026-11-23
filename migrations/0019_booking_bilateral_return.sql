-- 0019_booking_bilateral_return.sql
-- Do not release a shared item back to the public pool until both parties
-- confirm that the item was returned and received.
alter table public.bookings
  add column if not exists renter_return_at timestamptz,
  add column if not exists owner_return_at timestamptz;

update public.bookings
set renter_return_at = coalesce(renter_return_at, created_at),
    owner_return_at = coalesce(owner_return_at, created_at)
where status = 'returned'
  and (renter_return_at is null or owner_return_at is null);

alter table public.bookings
  drop constraint if exists bookings_bilateral_return_check;

alter table public.bookings
  add constraint bookings_bilateral_return_check
  check (
    status <> 'returned'
    or (renter_return_at is not null and owner_return_at is not null)
  );
