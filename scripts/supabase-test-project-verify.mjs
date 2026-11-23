import assert from "node:assert/strict";
import pg from "pg";

const connectionString = (process.env.SUPABASE_TEST_DATABASE_URL ?? "").trim();
if (!connectionString) {
  throw new Error("SUPABASE_TEST_DATABASE_URL fehlt. Es wird ausschließlich das separate KREISLAUF-Testprojekt geprüft.");
}

const parsed = new URL(connectionString);
if (!["postgres:", "postgresql:"].includes(parsed.protocol) || !parsed.hostname) {
  throw new Error("SUPABASE_TEST_DATABASE_URL ist keine gültige PostgreSQL-Verbindung.");
}

const client = new pg.Client({
  connectionString,
  connectionTimeoutMillis: 10_000,
  statement_timeout: 30_000,
  query_timeout: 35_000,
});

try {
  await client.connect();
  await client.query("begin read only");

  const migrationRows = await client.query(
    "select name from public._migrations where name in ($1, $2, $3) order by name",
    [
      "0024_independent_escrow_resolution.sql",
      "0025_archive_legacy_conflicted_escrow_votes.sql",
      "0026_complete_escrow_foreign_key_indexes.sql",
    ],
  );
  assert.deepEqual(
    migrationRows.rows.map((row) => row.name),
    [
      "0024_independent_escrow_resolution.sql",
      "0025_archive_legacy_conflicted_escrow_votes.sql",
      "0026_complete_escrow_foreign_key_indexes.sql",
    ],
    "Die drei letzten Sicherheits-/Indexmigrationen müssen registriert sein.",
  );

  const tables = await client.query(`
    select c.relname as name, c.relrowsecurity as rls
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r'
  `);
  assert.ok(tables.rows.length >= 20, "Das KREISLAUF-Schema ist unvollständig.");
  assert.ok(tables.rows.every((row) => row.rls), "Jede öffentliche Tabelle muss RLS aktiviert haben.");

  const browserGrants = await client.query(`
    select count(*)::int as count
    from information_schema.role_table_grants
    where table_schema = 'public'
      and grantee in ('anon', 'authenticated')
  `);
  assert.equal(browserGrants.rows[0].count, 0, "Browserrollen dürfen keine direkten Tabellenrechte besitzen.");

  const requiredIndexes = [
    "escrow_cases_buyer_id_fk_idx",
    "escrow_cases_region_id_fk_idx",
    "escrow_cases_seller_id_fk_idx",
    "escrow_resolution_votes_moderator_id_fk_idx",
  ];
  const indexes = await client.query(
    "select indexname from pg_indexes where schemaname = 'public' and indexname = any($1::text[]) order by indexname",
    [requiredIndexes],
  );
  assert.deepEqual(
    indexes.rows.map((row) => row.indexname),
    [...requiredIndexes].sort(),
    "Die vier vom Supabase-Advisor beanstandeten Fremdschlüssel-Indizes fehlen.",
  );

  const guards = await client.query(`
    select
      to_regprocedure('public.kreislauf_reject_party_escrow_resolution_vote()') is not null as function_exists,
      exists (
        select 1 from pg_trigger
        where tgname = 'escrow_approval_vote_independent'
          and not tgisinternal and tgenabled <> 'D'
      ) as approval_trigger_enabled,
      exists (
        select 1 from pg_trigger
        where tgname = 'escrow_resolution_vote_independent'
          and not tgisinternal and tgenabled <> 'D'
      ) as resolution_trigger_enabled,
      to_regclass('public.escrow_vote_conflict_archive') is not null as archive_exists
  `);
  const guard = guards.rows[0];
  assert.equal(guard.function_exists, true, "Die Treuhand-Sperrfunktion fehlt.");
  assert.equal(guard.approval_trigger_enabled, true, "Die Sperre für die erste Treuhandabstimmung fehlt.");
  assert.equal(guard.resolution_trigger_enabled, true, "Die Sperre für Streitfallentscheidungen fehlt.");
  assert.equal(guard.archive_exists, true, "Das private Archiv für unzulässige Altstimmen fehlt.");

  console.log("[supabase-test-verify] Testprojekt geprüft:", {
    host: parsed.hostname,
    publicTables: tables.rows.length,
    browserTableGrants: browserGrants.rows[0].count,
    requiredIndexes: indexes.rows.length,
    escrowGuards: "active",
    latestMigrations: migrationRows.rows.length,
  });
} finally {
  await client.query("rollback").catch(() => undefined);
  await client.end().catch(() => undefined);
}
