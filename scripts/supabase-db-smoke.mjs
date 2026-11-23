import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const rawConnectionString = process.env.SUPABASE_TEST_DATABASE_URL ?? "";
const connectionString = rawConnectionString.trim();
if (!connectionString) {
  throw new Error("SUPABASE_TEST_DATABASE_URL fehlt. Verwende ausschließlich eine separate, isolierte Supabase-Testdatenbank (eigenes Testprojekt), niemals die Produktionsdatenbank.");
}
const parsedConnection = new URL(connectionString);
const encodedPassword = parsedConnection.password;
let decodedPassword = "";
try {
  decodedPassword = decodeURIComponent(encodedPassword);
} catch {
  throw new Error("Das Passwort in SUPABASE_DATABASE_URL enthält eine ungültige URL-Kodierung.");
}
console.log("[supabase-smoke] Verbindungsziel (ohne Passwort):", {
  host: parsedConnection.hostname,
  port: parsedConnection.port || "(Standard)",
  database: parsedConnection.pathname.slice(1),
  user: decodeURIComponent(parsedConnection.username),
});
console.log("[supabase-smoke] Sichere Formatprüfung (keine Passwortausgabe):", {
  scheme: parsedConnection.protocol,
  secretHatAussenLeerzeichen: rawConnectionString !== rawConnectionString.trim(),
  secretBeginntMitAnfuehrungszeichen: /^[\\"']/.test(rawConnectionString),
  secretEnthaeltPrefixVariable: /^SUPABASE_DATABASE_URL\s*=/.test(rawConnectionString),
  passwortLaenge: decodedPassword.length,
  passwortHatLeerzeichenAmAnfangOderEnde: decodedPassword !== decodedPassword.trim(),
  passwortEnthaeltNichtAlphanumerischeZeichen: /[^a-zA-Z0-9]/.test(decodedPassword),
});

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const migrations = [
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
  "0013_listing_video_urls.sql",
  "0014_foreign_key_indexes.sql",
  "0015_listing_paused_status.sql",
  "0016_reconcile_demo_karma_ledger.sql",
  "0017_allow_activity_ledger_entries.sql",
  "0018_booking_bilateral_handover.sql",
  "0019_booking_bilateral_return.sql",
];
const client = new pg.Client({
  connectionString,
  connectionTimeoutMillis: 10_000,
  statement_timeout: 30_000,
  query_timeout: 35_000,
});

let transactionStarted = false;
try {
  await client.connect();
  const version = await client.query("select version() as version");
  console.log("[supabase-smoke] Verbindung erfolgreich:", version.rows[0].version);

  // Migrations deliberately target public.* objects. Run only against a
  // dedicated test Supabase project/database, never production. The complete
  // schema + seed + flow test is wrapped in one transaction and rolled back.
  await client.query("begin");
  transactionStarted = true;
  await client.query("set local lock_timeout = '5s'");

  for (const name of migrations) {
    const sql = await readFile(join(root, "migrations", name), "utf8");
    await client.query(sql);
    console.log(`[supabase-smoke] Migration OK: ${name}`);
  }

  const required = await client.query(`
    select
      to_regclass('regions') as regions,
      to_regclass('profiles') as profiles,
      to_regclass('listings') as listings,
      to_regclass('bookings') as bookings,
      to_regclass('escrow_cases') as escrow_cases,
      to_regclass('listing_conversations') as conversations,
      to_regclass('listing_messages') as messages,
      to_regclass('escrow_moderators') as escrow_moderators,
      to_regclass('escrow_votes') as escrow_votes,
      to_regprocedure('kreislauf_cast_escrow_vote(text,text,text,text)') as vote_function
  `);
  for (const [name, value] of Object.entries(required.rows[0])) {
    assert.ok(value, `Erwartetes Datenbankobjekt fehlt: ${name}`);
  }

  const people = [
    ["smoke-owner", "Smoke Owner", 0],
    ["smoke-renter", "Smoke Renter", 0],
    ["smoke-mod-1", "Smoke Moderator 1", 1],
    ["smoke-mod-2", "Smoke Moderator 2", 1],
    ["smoke-mod-3", "Smoke Moderator 3", 1],
    ["smoke-mod-4", "Smoke Moderator 4", 1],
  ];
  for (const [userId, username, rank] of people) {
    await client.query(
      `insert into profiles
        (user_id, username, region_id, karma_balance, is_verified, moderator_rank, last_active_at)
       values ($1, $2, 'yspertal-b36', 100, true, $3, now())`,
      [userId, username, rank],
    );
  }

  await client.query(
    `insert into listings
      (id, user_id, region_id, title, description, category, price_karma, status,
       images, lat, lng, place_label, offer_type)
     values
      ('smoke-listing', 'smoke-owner', 'yspertal-b36', 'Smoke Sharing', 'Nur temporärer Datenbanktest',
       'sharing', 12, 'active', '[]'::jsonb, 48.3, 15.06, 'Testort', 'sell')`,
  );

  const reservation = await client.query(
    `with target as (
       select l.id, l.user_id, l.price_karma, l.region_id
       from listings l
       join profiles renter on renter.user_id = $2 and renter.region_id = l.region_id
       where l.id = $1 and l.status = 'active' and l.category = 'sharing'
         and l.offer_type in ('sell','gift') and l.user_id <> $2
       for update of l
     ),
     ins as (
       insert into bookings
         (id, listing_id, renter_id, owner_id, starts_at, ends_at, status, amount_karma)
       select $3, t.id, $2, t.user_id, $4::timestamptz, $5::timestamptz, 'reserved',
         greatest(1, ceil(extract(epoch from ($5::timestamptz - $4::timestamptz)) / 86400.0)::int) * t.price_karma
       from target t returning id, listing_id
     ),
     reserved as (
       update listings l set status = 'booked'
       from ins i where l.id = i.listing_id and l.status = 'active'
       returning l.id, l.region_id, l.user_id, i.id as booking_id
     ),
     escrow as (
       insert into escrow_cases (id, listing_id, booking_id, requester_id, moderator_id, reason)
       select $6, r.id, r.booking_id, $2, moderator.user_id, 'Smoke-Test'
       from reserved r
       left join lateral (
         select p.user_id from profiles p
         where p.region_id = r.region_id and p.is_verified = true and p.moderator_rank > 0
           and p.last_active_at >= now() - interval '30 days'
           and p.user_id <> $2 and p.user_id <> r.user_id
         order by p.user_id limit 1
       ) moderator on true
       returning id
     )
     select id from escrow`,
    [
      "smoke-listing",
      "smoke-renter",
      "smoke-booking",
      "2030-01-01T10:00:00Z",
      "2030-01-02T10:00:00Z",
      "smoke-escrow",
    ],
  );
  assert.equal(reservation.rowCount, 1, "Reservierung/Treuhand muss gemeinsam entstehen");

  const state = await client.query(
    `select
       (select status from listings where id = 'smoke-listing') as listing_status,
       (select status from bookings where id = 'smoke-booking') as booking_status,
       (select requester_id from escrow_cases where id = 'smoke-escrow') as requester_id,
       (select count(*)::int from escrow_moderators
         where escrow_id = 'smoke-escrow') as moderator_count,
       (select count(*)::int from escrow_moderators
         where escrow_id = 'smoke-escrow' and moderator_id in ('smoke-owner','smoke-renter')) as party_as_moderator,
       (select count(*)::int from listing_messages m
         join listing_conversations c on c.id = m.conversation_id
         where c.listing_id = 'smoke-listing' and c.requester_id = 'smoke-renter'
           and m.message_kind = 'system') as system_messages`,
  );
  assert.equal(state.rows[0].listing_status, "booked");
  assert.equal(state.rows[0].booking_status, "reserved");
  assert.equal(state.rows[0].requester_id, "smoke-renter");
  assert.equal(state.rows[0].moderator_count, 4);
  assert.equal(state.rows[0].party_as_moderator, 0);
  assert.ok(state.rows[0].system_messages >= 2, "Buchung und Treuhand müssen Systemnachrichten erzeugen");
  console.log("[supabase-smoke] Reservierung, Treuhand, 4 Moderatoren und Systemnachrichten OK");

  for (let i = 1; i <= 4; i += 1) {
    const vote = await client.query(
      "select * from kreislauf_cast_escrow_vote($1, $2, 'approve', 'Smoke-Test')",
      ["smoke-listing", `smoke-mod-${i}`],
    );
    if (i < 4) assert.equal(vote.rows[0].status, "pending");
    else assert.equal(vote.rows[0].status, "released");
  }
  console.log("[supabase-smoke] Vier Stimmen und Zweidrittel-Entscheidung OK");

  // A single party must not be able to mark a handover as complete.
  await client.query("savepoint unilateral_handover");
  await assert.rejects(
    client.query(
      "update bookings set renter_handover_at = now(), status = 'handed_over' where id = 'smoke-booking'",
    ),
    (error) => error.code === "23514",
    "one-sided handover must violate the bilateral check",
  );
  await client.query("rollback to savepoint unilateral_handover");
  await client.query("release savepoint unilateral_handover");
  await client.query(
    `update bookings
     set renter_handover_at = now(), owner_handover_at = now(), status = 'handed_over'
     where id = 'smoke-booking'`,
  );

  // Likewise, one return confirmation cannot close the booking.
  await client.query("savepoint unilateral_return");
  await assert.rejects(
    client.query(
      "update bookings set renter_return_at = now(), status = 'returned' where id = 'smoke-booking'",
    ),
    (error) => error.code === "23514",
    "one-sided return must violate the bilateral check",
  );
  await client.query("rollback to savepoint unilateral_return");
  await client.query("release savepoint unilateral_return");
  await client.query(
    `update bookings
     set renter_return_at = now(), owner_return_at = now(), status = 'returned'
     where id = 'smoke-booking'`,
  );
  await client.query("update listings set status = 'active' where id = 'smoke-listing'");
  const completed = await client.query(
    `select b.status as booking_status, l.status as listing_status,
       b.renter_handover_at is not null and b.owner_handover_at is not null as both_handover,
       b.renter_return_at is not null and b.owner_return_at is not null as both_return
     from bookings b join listings l on l.id = b.listing_id
     where b.id = 'smoke-booking'`,
  );
  assert.equal(completed.rows[0].booking_status, "returned");
  assert.equal(completed.rows[0].listing_status, "active");
  assert.equal(completed.rows[0].both_handover, true);
  assert.equal(completed.rows[0].both_return, true);
  console.log("[supabase-smoke] Beidseitige Übergabe und Rückgabe inklusive Inseratfreigabe OK");

  const secondReservation = await client.query(
    `select count(*)::int as eligible from listings
     where id = 'smoke-listing' and status = 'active'`,
  );
  assert.equal(secondReservation.rows[0].eligible, 0, "Belegtes Inserat darf nicht erneut reservierbar sein");
  console.log("[supabase-smoke] Doppelreservierung verhindert");
} finally {
  if (transactionStarted) {
    try {
      await client.query("rollback");
      console.log("[supabase-smoke] ROLLBACK erfolgreich – Schema, Migrationen und Testdaten wurden nicht gespeichert.");
    } catch (error) {
      console.error("[supabase-smoke] WARNUNG: Rollback fehlgeschlagen:", error);
      process.exitCode = 1;
    }
  }
  await client.end().catch(() => undefined);
}
