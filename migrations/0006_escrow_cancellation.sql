-- Allow a pending escrow to be explicitly closed when its booking is cancelled
-- or returned before the community vote has resolved it.
alter table public.escrow_cases
  drop constraint if exists escrow_cases_status_check;

alter table public.escrow_cases
  add constraint escrow_cases_status_check
  check (status in ('pending', 'released', 'disputed', 'cancelled'));
