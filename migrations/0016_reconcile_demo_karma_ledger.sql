-- 0016_reconcile_demo_karma_ledger.sql
-- Reconcile the preloaded demo profiles with their append-only Karma journal.
-- The original sample balances did not match the net of their seeded entries.
-- Record the difference instead of silently changing profile balances.
-- Safe for existing databases and idempotent if manually re-run.

with demo_balances as (
  select p.user_id, p.region_id, p.karma_balance::bigint as profile_balance,
    coalesce(sum(case
      when e.receiver_id = p.user_id then e.amount_karma::bigint
      when e.sender_id = p.user_id then -e.amount_karma::bigint
      else 0::bigint
    end), 0::bigint) as ledger_balance
  from public.profiles p
  left join public.ledger_entries e
    on e.receiver_id = p.user_id or e.sender_id = p.user_id
  where p.user_id like 'seed-%'
  group by p.user_id, p.region_id, p.karma_balance
), adjustments as (
  select user_id, region_id, profile_balance - ledger_balance as difference
  from demo_balances
  where profile_balance <> ledger_balance
)
insert into public.ledger_entries (
  region_id, sender_id, receiver_id, amount_karma, entry_kind, message
)
select a.region_id,
  case when a.difference < 0 then a.user_id else null end,
  case when a.difference > 0 then a.user_id else null end,
  abs(a.difference)::integer,
  case when a.difference > 0 then 'mint' else 'demurrage' end,
  'Demo-Kontostand-Abgleich 0016'
from adjustments a
where not exists (
  select 1 from public.ledger_entries existing
  where existing.region_id = a.region_id
    and existing.message = 'Demo-Kontostand-Abgleich 0016'
    and (existing.sender_id = a.user_id or existing.receiver_id = a.user_id)
);
