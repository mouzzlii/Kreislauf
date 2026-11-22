-- 0017_allow_activity_ledger_entries.sql
-- Activity rewards are real Karma ledger movements, just like ordinary transfers.
-- Earlier application code already emitted this kind, but the original schema
-- constraint rejected it and rolled back otherwise valid exchanges.
alter table public.ledger_entries
  drop constraint if exists ledger_entries_entry_kind_check;

alter table public.ledger_entries
  add constraint ledger_entries_entry_kind_check
  check (entry_kind in ('mint', 'transfer', 'demurrage', 'activity'));
