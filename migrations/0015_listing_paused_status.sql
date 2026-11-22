-- Keep temporary owner pauses separate from the existing maintenance state.
-- Existing rows remain unchanged; this migration only expands the allowed values.
alter table public.listings
  drop constraint if exists listings_status_check;

alter table public.listings
  add constraint listings_status_check
  check (status in ('active', 'booked', 'completed', 'maintenance', 'paused'));
