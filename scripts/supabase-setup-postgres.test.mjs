import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("Supabase setup SQL executes against a clean PostgreSQL-compatible database", async () => {
  const sql = await readFile(new URL("../SUPABASE-SETUP.sql", import.meta.url), "utf8");
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon nologin;
      create role authenticated nologin;
      create role service_role nologin;
    `);
    await db.exec(sql);
    const result = await db.query(`
      select c.relname as table_name, c.relrowsecurity as rls_enabled
      from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind = 'r'
      order by c.relname
    `);
    const tables = new Map(result.rows.map((row) => [row.table_name, row.rls_enabled]));
    for (const table of [
      "regions", "profiles", "listings", "bookings", "reviews",
      "ledger_entries", "item_history", "escrow_cases",
      "listing_conversations", "listing_messages", "escrow_moderators",
      "escrow_votes", "user", "session", "account", "verification",
    ]) {
      assert.equal(tables.get(table), true, `RLS is not enabled for ${table}`);
    }
    const access = await db.query(`
      select
        has_table_privilege('anon', 'public.listings', 'select') as anon_can_read_listings,
        has_table_privilege('authenticated', 'public.profiles', 'update') as member_can_update_profiles,
        has_function_privilege('anon', 'public.apply_demurrage()', 'execute') as anon_can_run_demurrage,
        has_function_privilege('authenticated', 'public.kreislauf_cast_escrow_vote(text,text,text,text)', 'execute') as member_can_cast_arbitrary_vote,
        has_function_privilege('service_role', 'public.kreislauf_cast_escrow_vote(text,text,text,text)', 'execute') as server_can_cast_vote
    `);
    assert.equal(access.rows[0].anon_can_read_listings, false);
    assert.equal(access.rows[0].member_can_update_profiles, false);
    assert.equal(access.rows[0].anon_can_run_demurrage, false);
    assert.equal(access.rows[0].member_can_cast_arbitrary_vote, false);
    assert.equal(access.rows[0].server_can_cast_vote, true);

    const applied = await db.query("select name from _migrations order by name");
    assert.equal(applied.rows.length, 6);
  } finally {
    await db.close();
  }
});
