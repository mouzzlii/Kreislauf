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
      "listing_conversations", "listing_messages", "listing_message_rate_limits", "escrow_moderators",
      "escrow_votes", "escrow_resolution_votes", "user", "session", "account", "verification",
    ]) {
      assert.equal(tables.get(table), true, `RLS is not enabled for ${table}`);
    }
    const independentVoteGuard = await db.query(
      "select to_regprocedure('public.kreislauf_reject_party_escrow_resolution_vote()') as fn",
    );
    assert.ok(independentVoteGuard.rows[0].fn, "the Supabase setup must install the independent dispute-vote guard");
    const independentVoteTrigger = await db.query(
      "select count(*)::int as count from pg_trigger where tgname = 'escrow_resolution_vote_independent' and not tgisinternal",
    );
    assert.equal(independentVoteTrigger.rows[0].count, 1, "the independent dispute-vote trigger must be active");

    const access = await db.query(`
      select
        has_table_privilege('anon', 'public.listings', 'select') as anon_can_read_listings,
        has_table_privilege('authenticated', 'public.profiles', 'update') as member_can_update_profiles,
        has_table_privilege('anon', 'public.listing_messages', 'select') as anon_can_read_messages,
        has_function_privilege('anon', 'public.apply_demurrage()', 'execute') as anon_can_run_demurrage,
        has_function_privilege('anon', 'public.kreislauf_system_message(text,text,text,text)', 'execute') as anon_can_send_system_messages,
        has_function_privilege('authenticated', 'public.kreislauf_booking_status_message()', 'execute') as member_can_call_booking_trigger,
        has_function_privilege('authenticated', 'public.kreislauf_cast_escrow_vote(text,text,text,text)', 'execute') as member_can_cast_arbitrary_vote,
        has_function_privilege('service_role', 'public.kreislauf_cast_escrow_vote(text,text,text,text)', 'execute') as server_can_cast_vote
    `);
    assert.equal(access.rows[0].anon_can_read_listings, false);
    assert.equal(access.rows[0].member_can_update_profiles, false);
    assert.equal(access.rows[0].anon_can_read_messages, false);
    assert.equal(access.rows[0].anon_can_run_demurrage, false);
    assert.equal(access.rows[0].anon_can_send_system_messages, false);
    assert.equal(access.rows[0].member_can_call_booking_trigger, false);
    assert.equal(access.rows[0].member_can_cast_arbitrary_vote, false);
    assert.equal(access.rows[0].server_can_cast_vote, true);

    const defaultAcl = await db.query(
      "select coalesce(array_to_string(defaclacl, ','), '') as acl from pg_default_acl where defaclrole = (select oid from pg_roles where rolname = 'postgres') and defaclnamespace = 'public'::regnamespace and defaclobjtype = 'r'",
    );
    assert.doesNotMatch(defaultAcl.rows[0]?.acl ?? "", /anon=|authenticated=|service_role=/);

    const trigger = await db.query(
      "select exists (select 1 from pg_trigger where tgname = 'bookings_status_message_updated') as installed",
    );
    assert.equal(trigger.rows[0].installed, true, "booking state notifications must be installed");

    // A production clean install intentionally contains no demo users or bookings.
    // Create an isolated fixture here so the constraints are exercised against a real row.
    await db.query(
      `insert into profiles (user_id, username, region_id)
       values ('setup-test-owner', 'Setup Test Owner', 'yspertal-b36'),
              ('setup-test-renter', 'Setup Test Renter', 'yspertal-b36')`,
    );
    await db.query(
      `insert into listings
         (id, user_id, region_id, title, description, category, price_karma, status, images, lat, lng, place_label)
       values
         ('setup-test-listing', 'setup-test-owner', 'yspertal-b36', 'Setup Test', 'Nur für den Datenbanktest',
          'sharing', 10, 'booked', '[]'::jsonb, 48.3, 15.06, 'Testort')`,
    );
    await db.query(
      `insert into bookings
         (id, listing_id, renter_id, owner_id, starts_at, ends_at, status, amount_karma)
       values
         ('setup-test-booking', 'setup-test-listing', 'setup-test-renter', 'setup-test-owner',
          now(), now() + interval '1 day', 'reserved', 10)`,
    );

    // Escrow must fail closed if the assignment trigger cannot find four moderators.
    await db.query(
      `insert into profiles (user_id, username, region_id, is_verified, moderator_rank, last_active_at)
       values
         ('setup-test-mod-1', 'Moderator 1', 'yspertal-b36', true, 1, now()),
         ('setup-test-mod-2', 'Moderator 2', 'yspertal-b36', true, 1, now()),
         ('setup-test-mod-3', 'Moderator 3', 'yspertal-b36', true, 1, now())`,
    );
    await db.query(
      `insert into listings
         (id, user_id, region_id, title, description, category, price_karma, status, images, lat, lng, place_label)
       values
         ('setup-escrow-listing', 'setup-test-owner', 'yspertal-b36', 'Escrow quorum', 'Treuhand-Test', 'goods',
          100, 'booked', '[]'::jsonb, 48.3, 15.06, 'Testort')`,
    );
    await assert.rejects(
      db.query(
        `insert into escrow_cases (id, listing_id, requester_id, moderator_id, reason)
         values ('setup-escrow-insufficient', 'setup-escrow-listing', 'setup-test-renter',
                 'setup-test-mod-1', 'Hochwertiges Tauschgeschäft')`,
      ),
      (error) => error.code === "23514",
      "a new escrow case must roll back when fewer than four moderators can be assigned",
    );
    await db.query(
      `insert into profiles (user_id, username, region_id, is_verified, moderator_rank, last_active_at)
       values ('setup-test-mod-4', 'Moderator 4', 'yspertal-b36', true, 1, now())`,
    );
    await db.query(
      `insert into escrow_cases (id, listing_id, requester_id, moderator_id, reason)
       values ('setup-escrow-valid', 'setup-escrow-listing', 'setup-test-renter',
               'setup-test-mod-1', 'Hochwertiges Tauschgeschäft')`,
    );
    const assigned = await db.query(
      "select count(*)::int as count from escrow_moderators where escrow_id = 'setup-escrow-valid'",
    );
    assert.ok(assigned.rows[0].count >= 4, "a valid escrow case must have at least four assigned moderators");

    // The clean-install bundle must enforce both parties' confirmations.
    await assert.rejects(
      db.query("update bookings set status = 'handed_over', renter_handover_at = now() where id = 'setup-test-booking'"),
      (error) => error.code === "23514",
      "a one-sided handover must be rejected",
    );
    await db.query(
      "update bookings set status = 'handed_over', renter_handover_at = now(), owner_handover_at = now() where id = 'setup-test-booking'",
    );
    await assert.rejects(
      db.query("update bookings set status = 'returned', renter_return_at = now() where id = 'setup-test-booking'"),
      (error) => error.code === "23514",
      "a one-sided return must be rejected",
    );
    await db.query(
      "update bookings set status = 'returned', renter_return_at = now(), owner_return_at = now() where id = 'setup-test-booking'",
    );

    const applied = await db.query("select name from _migrations order by name");
    assert.equal(applied.rows.length, 22);
  } finally {
    await db.close();
  }
});
