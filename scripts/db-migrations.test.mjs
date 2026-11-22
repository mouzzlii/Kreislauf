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
  "0006_escrow_cancellation.sql",
  "0007_harden_function_search_path.sql",
  "0008_harden_legacy_function_search_path.sql",
  "0009_lock_down_legacy_tables.sql",
  "0010_lock_down_default_privileges.sql",
  "0011_limit_listing_message_rate.sql",
  "0012_atomic_listing_message_rate_limits.sql",
  "0013_listing_video_urls.sql",
  "0014_foreign_key_indexes.sql",
  "0015_listing_paused_status.sql",
  "0016_reconcile_demo_karma_ledger.sql",
  "0017_allow_activity_ledger_entries.sql",
];

test("all PostgreSQL migrations apply in the embedded PGlite demo and sharing reservation/escrow flow", async () => {
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

    const listingStatusConstraint = await db.query(
      "select pg_get_constraintdef(oid) as definition from pg_constraint where conrelid = 'public.listings'::regclass and conname = 'listings_status_check'",
    );
    assert.match(listingStatusConstraint.rows[0].definition, /'maintenance'/);
    assert.match(listingStatusConstraint.rows[0].definition, /'paused'/);
    const maintenanceRows = await db.query("select count(*)::int as count from listings where status = 'maintenance'");
    assert.ok(maintenanceRows.rows[0].count >= 1, "existing maintenance listings must retain their original state");

    const fkIndexes = await db.query(
      "select count(*)::int as count from pg_indexes where schemaname = 'public' and indexname like '%_fk_idx'",
    );
    assert.equal(fkIndexes.rows[0].count, 14, "all current-schema foreign-key indexes must be present");

    const mismatchedDemoBalances = await db.query(
      `select p.user_id, p.karma_balance,
         coalesce(sum(case
           when e.receiver_id = p.user_id then e.amount_karma
           when e.sender_id = p.user_id then -e.amount_karma
           else 0
         end), 0)::int as ledger_balance
       from profiles p
       left join ledger_entries e on e.receiver_id = p.user_id or e.sender_id = p.user_id
       where p.user_id like 'seed-%'
       group by p.user_id, p.karma_balance
       having p.karma_balance <> coalesce(sum(case
         when e.receiver_id = p.user_id then e.amount_karma
         when e.sender_id = p.user_id then -e.amount_karma
         else 0
       end), 0)`
    );
    assert.equal(
      mismatchedDemoBalances.rows.length,
      0,
      "every seeded demo balance must reconcile exactly with its append-only ledger",
    );

    const reconciliationCount = await db.query(
      `select count(*)::int as count from ledger_entries where message = 'Demo-Kontostand-Abgleich 0016'`,
    );
    assert.equal(reconciliationCount.rows[0].count, 6, "each mismatched demo account should receive one explicit journal adjustment");
    const reconciliationSql = await readFile(join(root, "migrations", "0016_reconcile_demo_karma_ledger.sql"), "utf8");
    await db.exec(reconciliationSql);
    const repeatedReconciliationCount = await db.query(
      `select count(*)::int as count from ledger_entries where message = 'Demo-Kontostand-Abgleich 0016'`,
    );
    assert.equal(repeatedReconciliationCount.rows[0].count, 6, "manual re-runs must not duplicate demo adjustments");

    const demurrage = await db.query("select affected_user, cut_amount from apply_demurrage()");
    const jonasCut = demurrage.rows.find((row) => row.affected_user === "seed-jonas");
    assert.ok(jonasCut, "a member idle for more than two full months should receive demurrage");
    assert.equal(jonasCut.cut_amount, 6, "0.5% per full idle month should be applied to the 640-Karma balance");
    const demurrageLedger = await db.query(
      "select amount_karma, receiver_id, entry_kind from ledger_entries where sender_id = 'seed-jonas' and entry_kind = 'demurrage'",
    );
    assert.equal(demurrageLedger.rows.length, 1);
    assert.equal(demurrageLedger.rows[0].amount_karma, 6);
    assert.equal(demurrageLedger.rows[0].receiver_id, null, "expired Karma must not be credited to another member");

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
    await db.query("update profiles set karma_balance = karma_balance + 1 where user_id = 'test-renter'");
    await db.query(
      `insert into ledger_entries(region_id, receiver_id, amount_karma, entry_kind, message)
       values ('yspertal-b36', 'test-renter', 1, 'activity', 'Regressionstest Aktivitätsbonus')`,
    );
    const activityEntry = await db.query(
      "select entry_kind from ledger_entries where receiver_id = 'test-renter' and message = 'Regressionstest Aktivitätsbonus'",
    );
    assert.equal(activityEntry.rows[0].entry_kind, "activity", "activity rewards must be accepted by the ledger constraint");

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
    assert.ok(result.assigned_moderator_count <= 7, "no escrow case may assign more than seven moderators");
    assert.ok(result.system_message_count >= 1, "booking should create an in-app system message");

    const notifications = await db.query(
      `select c.listing_id as "listingId", l.title as "listingTitle",
        coalesce(p.username, 'Mitglied') as "otherName",
        count(m.id)::int as "unreadCount",
        coalesce((select lm.body from listing_messages lm
          where lm.conversation_id = c.id order by lm.id desc limit 1), '') as "lastMessage",
        to_char(max(m.created_at) at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "updatedAt"
       from listing_conversations c
       join listings l on l.id = c.listing_id
       join profiles p on p.user_id = case when c.owner_id = $1 then c.requester_id else c.owner_id end
       join listing_messages m on m.conversation_id = c.id
         and m.read_at is null and m.sender_id is distinct from $1
       where c.owner_id = $1 or c.requester_id = $1
       group by c.id, l.title, p.username
       order by max(m.created_at) desc
       limit 8`,
      ["seed-leonie"],
    );
    assert.equal(notifications.rows.length, 1, "listing owner should see one unread conversation");
    assert.ok(notifications.rows[0].unreadCount >= 1, "booking should create an unread notification");
    assert.equal(notifications.rows[0].listingId, "test-sharing");

    await db.query(
      "update bookings set status = 'cancelled' where id = $1 and status = 'reserved'",
      [bookingId],
    );
    const cancellationMessage = await db.query(
      `select count(*)::int as count from listing_messages m
       join listing_conversations c on c.id = m.conversation_id
       where c.listing_id = 'test-sharing' and c.requester_id = 'test-renter'
         and m.message_kind = 'system'
         and m.body = 'Reservierung storniert: Die Buchung wurde beendet.'`,
    );
    assert.equal(cancellationMessage.rows[0].count, 1, "cancellation should create a linked system message");

    await db.query(
      "update escrow_cases set status = 'cancelled', resolved_at = now() where id = $1 and status = 'pending'",
      [escrowId],
    );
    const cancelled = await db.query(
      "select status from escrow_cases where id = $1",
      [escrowId],
    );
    assert.equal(cancelled.rows[0].status, "cancelled", "pending escrow may be closed when a booking ends");
    await assert.rejects(
      db.query(
        "select * from kreislauf_cast_escrow_vote($1, $2, $3, $4)",
        ["test-sharing", "test-moderator", "approve", "Abstimmung nach Stornierung"],
      ),
      /Keine offene Treuhand/,
      "a cancelled escrow must not accept further votes",
    );

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

    await db.query(
      `insert into listings(
         id, user_id, region_id, title, description, category, price_karma, status,
         images, lat, lng, place_label, offer_type, item_uuid
       ) values (
         'test-high-value', 'seed-leonie', 'yspertal-b36', 'Wertvoller Testartikel', 'Treuhand-Abstimmung testen',
         'goods', 100, 'booked', '[]'::jsonb, 48.3, 15.06, 'Testort', 'sell', 'item-test-high-value'
       )`,
    );
    await db.query(
      `insert into escrow_cases(id, listing_id, requester_id, moderator_id, reason)
       values ('test-high-value-escrow', 'test-high-value', 'test-renter', 'test-moderator', 'Hochwertiges Tauschgeschäft')`,
    );
    const balancesBefore = await db.query(
      `select user_id, karma_balance from profiles where user_id in ('test-renter', 'seed-leonie') order by user_id`,
    );
    const before = Object.fromEntries(balancesBefore.rows.map((row) => [row.user_id, row.karma_balance]));

    await db.query(
      "select * from kreislauf_cast_escrow_vote($1, $2, $3, $4)",
      ["test-high-value", "test-moderator", "approve", "Prüfung 1"],
    );
    await db.query(
      "select * from kreislauf_cast_escrow_vote($1, $2, $3, $4)",
      ["test-high-value", "test-moderator-2", "approve", "Prüfung 2"],
    );
    await db.query(
      "select * from kreislauf_cast_escrow_vote($1, $2, $3, $4)",
      ["test-high-value", "test-moderator-3", "approve", "Prüfung 3"],
    );
    const beforeQuorum = await db.query(
      "select status from escrow_cases where id = 'test-high-value-escrow'",
    );
    assert.equal(beforeQuorum.rows[0].status, "pending", "fewer than four votes must not release escrow");

    const finalVote = await db.query(
      "select * from kreislauf_cast_escrow_vote($1, $2, $3, $4)",
      ["test-high-value", "test-moderator-4", "reject", "Prüfung 4"],
    );
    assert.equal(finalVote.rows[0].votes, 4);
    assert.equal(finalVote.rows[0].approvals, 3);
    assert.equal(finalVote.rows[0].status, "pending", "moderator quorum must not settle high-value escrow before both parties confirm handover");

    const settled = await db.query(
      `select
         (select status from listings where id = 'test-high-value') as listing_status,
         (select status from escrow_cases where id = 'test-high-value-escrow') as escrow_status,
         (select karma_balance from profiles where user_id = 'test-renter') as buyer_balance,
         (select karma_balance from profiles where user_id = 'seed-leonie') as seller_balance,
         (select count(*)::int from ledger_entries where listing_id = 'test-high-value' and entry_kind = 'transfer') as transfer_count`,
    );
    assert.equal(settled.rows[0].listing_status, "booked", "high-value listing must remain reserved");
    assert.equal(settled.rows[0].escrow_status, "pending", "high-value escrow remains pending until bilateral handover");
    assert.equal(settled.rows[0].buyer_balance, before["test-renter"], "buyer points must not move before receipt confirmation");
    assert.equal(settled.rows[0].seller_balance, before["seed-leonie"], "seller points must not move before receipt confirmation");
    assert.equal(settled.rows[0].transfer_count, 0, "no ledger transfer may be written before receipt confirmation");

    await db.query(
      `insert into listings(
         id, user_id, region_id, title, description, category, price_karma, status,
         images, lat, lng, place_label, offer_type, item_uuid
       ) values (
         'test-high-value-tie-listing', 'seed-leonie', 'yspertal-b36', 'Weiterer Testartikel', 'Treuhand-Gleichstand testen',
         'goods', 100, 'booked', '[]'::jsonb, 48.3, 15.06, 'Testort', 'sell', 'item-test-high-value-tie'
       )`,
    );
    await db.query(
      "insert into escrow_cases(id, listing_id, requester_id, moderator_id, reason) values ('test-high-value-tie', 'test-high-value-tie-listing', 'test-renter', 'test-moderator', 'Hochwertiges Tauschgeschäft')",
    );
    await db.query("select * from kreislauf_cast_escrow_vote($1, $2, $3, $4)", ["test-high-value-tie-listing", "test-moderator", "approve", "Gleichstand 1"]);
    await db.query("select * from kreislauf_cast_escrow_vote($1, $2, $3, $4)", ["test-high-value-tie-listing", "test-moderator-2", "approve", "Gleichstand 2"]);
    await db.query("select * from kreislauf_cast_escrow_vote($1, $2, $3, $4)", ["test-high-value-tie-listing", "test-moderator-3", "reject", "Gleichstand 3"]);
    const tied = await db.query(
      "select * from kreislauf_cast_escrow_vote($1, $2, $3, $4)",
      ["test-high-value-tie-listing", "test-moderator-4", "reject", "Gleichstand 4"],
    );
    assert.equal(tied.rows[0].votes, 4);
    assert.equal(tied.rows[0].approvals, 2);
    assert.equal(tied.rows[0].rejections, 2);
    assert.equal(tied.rows[0].status, "pending", "a 2:2 tie must not release or reject escrow");

  } finally {
    await db.close();
  }
});
