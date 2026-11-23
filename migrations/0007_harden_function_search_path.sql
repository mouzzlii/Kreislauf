-- Harden function name resolution against search_path manipulation.
-- These functions are called by the server or by database triggers. Pinning the
-- path prevents an attacker-controlled schema from shadowing referenced objects.
alter function public.apply_demurrage() set search_path = pg_catalog, public, pg_temp;
alter function public.kreislauf_assign_escrow_moderators() set search_path = pg_catalog, public, pg_temp;
alter function public.kreislauf_booking_message() set search_path = pg_catalog, public, pg_temp;
alter function public.kreislauf_booking_status_message() set search_path = pg_catalog, public, pg_temp;
alter function public.kreislauf_cast_escrow_vote(text, text, text, text) set search_path = pg_catalog, public, pg_temp;
alter function public.kreislauf_escrow_message() set search_path = pg_catalog, public, pg_temp;
alter function public.kreislauf_forbid_ledger_change() set search_path = pg_catalog, public, pg_temp;
alter function public.kreislauf_system_message(text, text, text, text) set search_path = pg_catalog, public, pg_temp;
alter function public.kreislauf_transfer_message() set search_path = pg_catalog, public, pg_temp;
