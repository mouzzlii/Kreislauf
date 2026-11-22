import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const migrations = [
  "0002_kreislauf.sql",
  "0003_kreislauf_v2.sql",
  "0004_messages_escrow.sql",
  "0005_escrow_atomicity.sql",
];

test("PostgreSQL migrations and sharing reservation/escrow flow", async () => {
  const db = new PGlite();
  try {
    await db.waitReady;
    for (const migration of migrations) {
      const sql = await readFile(join(root, "migrations", migration), "utf8");
      await db.exec(sql);
    }

    const schema = await db.query(
      `select
        to_regclass('public.bookings') as bookings,
        to_regclass('public.escrow_cases') as escrow_cases,
        to_regclass('public.listing_conversations') as conversations,
        to_regclass('public.escrow_moderators') as escrow_moderators,
        to_regprocedure('public.kreislauf_cast_escrow_vote(text,text,text,text)') as vote_function`,
    );
    assert.ok(schema.rows[0].bookings);
    assert.ok(schema.rows[0].escrow_cases);
    assert.ok(schema.rows[0].conversations);
    assert.ok(schema.rows[0].escrow_moderators);
    assert.ok(schema.rows[0].vote_function);

    await db.query(
      `insert into profiles(user_id, username, region_id, karma_balance, is_verified, moderator_rank, last_active_at)
       values
        ('test-renter', 'Test Renter', 'yspertal-b36', 100, true, 0, now()),
        ('test-moderator', 'Test Moderator 1', 'yspertal-b36', 100, true, 1, now()),
        ('test-moderator-2', 'Test Moderator 2', 'yspertal-b36', 100, true, 1, now()),
        ('test-moderator-3', 'Test Moderator 3', 'yspertal-b36', 100, true, 1, now()),
        ('test-moderator-4', 'Test Moderator 4', 'yspertal-b36', 100, true, 1, now())
       on conflict (user_id) do update set
         is_verified = excluded.is_verified,
         moderator_rank = excluded.moderator_rank,
         last_active_at = now()`,
    );
    await db.query(
      `insert into listings(
         id, user_id, region_id, title, description, category, price_karma, status,
         images, lat, lng, place_label, offer_type
       ) values (
         'test-sharing', 'seed-leonie', 'yspertal-b36', 'Test-Flotte', 'Testreservierung',
         'sharing', 12, 'active', '[]'::jsonb, 48.3, 15.06, 'Testort', 'sell'
       )`,
    );

    const bookingId = "test-booking";
    const escrowId = "test-escrow";
    const reserved = await db.query(
      `with target as (
         select l.id, l.user_id, l.price_karma, l.region_id
         from listings l
         join profiles renter on renter.user_id = $2 and renter.region_id = l.region_id
         where l.id = $1
           and l.status = 'active'
           and l.category = 'sharing'
           and l.offer_type in ('sell','gift')
           and l.user_id <> $2
         for update of l
       ),
       ins as (
         insert into bookings (
           id, listing_id, renter_id, owner_id, starts_at, ends_at, status, amount_karma
         )
         select $3, t.id, $2, t.user_id, $4::timestamptz, $5::timestamptz, 'reserved',
           greatest(1, ceil(extract(epoch from ($5::timestamptz - $4::timestamptz)) / 86400.0)::int) * t.price_karma
         from target t
         returning id, listing_id
       ),
       reserved as (
         update listings l
         set status = 'booked'
         from ins i
         where l.id = i.listing_id and l.status = 'active'
         returning l.id, l.region_id, l.user_id as owner_id, i.id as booking_id
       ),
       escrow as (
         insert into escrow_cases (id, listing_id, booking_id, requester_id, moderator_id, reason)
         select $6, r.id, r.booking_id, $2, moderator.user_id, 'Treuhand für Sharing-Reservierung'
         from reserved r
         left join lateral (
           select p.user_id
           from profiles p
           where p.region_id = r.region_id
             and p.is_verified = true
             and p.moderator_rank > 0
             and p.last_active_at >= now() - interval '30 days'
             and p.user_id <> $2
             and p.user_id <> r.owner_id
           order by random()
           limit 1
         ) moderator on true
         returning id
       )
       select id from escrow`,
      [
        "test-sharing",
        "test-renter",
        bookingId,
        "2030-01-01T10:00:00Z",
        "2030-01-02T10:00:00Z",
        escrowId,
      ],
    );
    assert.equal(reserved.rows.length, 1, "reservation should create exactly one escrow case");

    const state = await db.query(
      `select
         (select status from listings where id = 'test-sharing') as listing_status,
         (select status from bookings where id = $1) as booking_status,
         (select requester_id from escrow_cases where id = $2) as requester_id,
         (select count(*)::int from escrow_moderators where escrow_id = $2 and moderator_id = 'test-renter') as renter_moderator_count,
         (select count(*)::int from escrow_moderators where escrow_id = $2 and moderator_id = 'seed-leonie') as owner_moderator_count,
         (select count(*)::int from escrow_moderators where escrow_id = $2) as assigned_moderator_count,
         (select count(*)::int from listing_messages m join listing_conversations c on c.id = m.conversation_id
           where c.listing_id = 'test-sharing' and c.requester_id = 'test-renter' and m.message_kind = 'system') as system_message_count`,
      [bookingId, escrowId],
    );
    const result = state.rows[0];
    assert.equal(result.listing_status, "booked");
    assert.equal(result.booking_status, "reserved");
    assert.equal(result.requester_id, "test-renter");
    assert.equal(result.renter_moderator_count, 0, "requester must never be assigned as moderator");
    assert.equal(result.owner_moderator_count, 0, "listing owner must never be assigned as moderator");
    assert.ok(result.assigned_moderator_count >= 4, "at least four eligible moderators should be assigned for quorum");
    assert.ok(result.system_message_count >= 1, "booking should create an in-app system message");

    const secondAttempt = await db.query(
      `with target as (
         select l.id, l.user_id, l.price_karma, l.region_id
         from listings l
         join profiles renter on renter.user_id = $2 and renter.region_id = l.region_id
         where l.id = $1 and l.status = 'active' and l.category = 'sharing'
           and l.offer_type in ('sell','gift') and l.user_id <> $2
         for update of l
       )
       select count(*)::int as eligible from target`,
      ["test-sharing", "test-renter"],
    );
    assert.equal(secondAttempt.rows[0].eligible, 0, "booked listing must not be reservable again");
  } finally {
    await db.close();
  }
});
