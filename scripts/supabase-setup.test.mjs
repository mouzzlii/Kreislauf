import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const sql = await readFile(new URL("../SUPABASE-SETUP.sql", import.meta.url), "utf8");

test("Supabase production setup includes all current application migrations", () => {
  for (const name of [
    "0001_auth.sql",
    "0002_kreislauf.sql",
    "0003_kreislauf_v2.sql",
    "0004_messages_escrow.sql",
    "0005_escrow_atomicity.sql",
    "0006_escrow_cancellation.sql",
    "0007_harden_function_search_path.sql",
    "0009_lock_down_legacy_tables.sql",
    "0010_lock_down_default_privileges.sql",
    "0011_limit_listing_message_rate.sql",
    "0012_atomic_listing_message_rate_limits.sql",
  ]) {
    assert.ok(sql.includes(name), `missing migration ${name}`);
  }
});

test("clean setup excludes the optional legacy-only migration block", () => {
  assert.doesNotMatch(sql, /process_gwp_transaction|do\s+\$\$/i);
  assert.ok(sql.includes("Optional legacy migration 0008 is intentionally excluded"));
});

test("Supabase production setup does not create demo members or demo listings", () => {
  assert.doesNotMatch(sql, /seed-anna|seed-markus|lst-ebike|bkg-anhaenger/i);
  assert.doesNotMatch(sql, /insert into profiles\s*\(/i);
  assert.doesNotMatch(sql, /insert into listings\s*\(/i);
});

test("Supabase production setup locks KREISLAUF tables behind server-side access", () => {
  for (const table of [
    "regions", "profiles", "listings", "bookings", "reviews",
    "ledger_entries", "item_history", "escrow_cases",
    "listing_conversations", "listing_messages", "escrow_moderators",
    "escrow_votes", '"user"', '"session"', '"account"', '"verification"',
  ]) {
    assert.ok(sql.includes(`alter table public.${table} enable row level security`), `RLS missing for ${table}`);
  }
  assert.match(sql, /revoke all on table[\s\S]*?from anon, authenticated/);
  assert.match(sql, /revoke all on function public\.apply_demurrage\(\) from public/);
});

test("Supabase setup includes escrow cancellation and the final four-vote policy", () => {
  assert.match(sql, /0006_escrow_cancellation\.sql/);
  assert.match(sql, /check \(status in \('pending', 'released', 'disputed', 'cancelled'\)\)/);
  assert.match(sql, /v_required := 4;/);
  assert.match(sql, /limit greatest\(0, 7 - \(select count\(\*\) from escrow_moderators/);
});

test("legacy prototype tables are locked down by the upgrade migration", async () => {
  const legacy = await readFile(new URL("../migrations/0009_lock_down_legacy_tables.sql", import.meta.url), "utf8");
  assert.match(legacy, /drop policy/i);
  assert.match(legacy, /enable row level security/i);
  assert.match(legacy, /revoke all on table/i);
});

test("future public-schema objects are not granted to browser roles by default", () => {
  assert.match(sql, /alter default privileges for role postgres in schema public[\s\S]*?revoke all on tables from anon, authenticated, service_role/i);
  assert.match(sql, /revoke execute on functions from public, anon, authenticated, service_role/i);
});

test("Supabase migration bookkeeping is protected by RLS", () => {
  assert.match(sql, /alter table public\._migrations enable row level security/);
  assert.match(sql, /public\._migrations[\s\S]*?from anon, authenticated/);
});

test("listing chat has database-enforced per-account anti-spam limits", async () => {
  const migration = await readFile(new URL("../migrations/0011_limit_listing_message_rate.sql", import.meta.url), "utf8");
  assert.match(migration, /pg_advisory_xact_lock/);
  assert.match(migration, /v_minute_count >= 12/);
  assert.match(migration, /v_hour_count >= 80/);
  assert.match(migration, /before insert on public\.listing_messages/i);
  assert.match(migration, /message_kind <> 'user'/);
});

test("chat throttling uses atomic per-user counters and private rate-limit storage", async () => {
  const migration = await readFile(new URL("../migrations/0012_atomic_listing_message_rate_limits.sql", import.meta.url), "utf8");
  assert.match(migration, /on conflict \(sender_id\) do update/i);
  assert.match(migration, /minute_count between 0 and 12/i);
  assert.match(migration, /hour_count between 0 and 80/i);
  assert.match(migration, /enable row level security/i);
  assert.match(migration, /revoke all on table/i);
  assert.match(migration, /returning sender_id into v_sender/i);
});
