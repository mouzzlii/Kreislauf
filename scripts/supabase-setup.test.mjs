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
  ]) {
    assert.ok(sql.includes(name), `missing migration ${name}`);
  }
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

test("Supabase migration bookkeeping is protected by RLS", () => {
  assert.match(sql, /alter table public\._migrations enable row level security/);
  assert.match(sql, /public\._migrations[\s\S]*?from anon, authenticated/);
});
