import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
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
  "0018_booking_bilateral_handover.sql",
  "0019_booking_bilateral_return.sql",
  "0020_escrow_moderator_quorum.sql",
  "0021_high_value_escrow_funds.sql",
  "0022_high_value_escrow_confirmation_and_disputes.sql",
];

async function createHeldEscrow(db, listingId, escrowId, buyerId, sellerId, moderatorId) {
  await db.query(
    `insert into listings
       (id,user_id,region_id,title,description,category,price_karma,status,images,lat,lng,place_label,offer_type,item_uuid)
     values ($1,$2,'yspertal-b36','Treuhandtest','Testartikel','goods',100,'active','[]'::jsonb,48.3,15.06,'Testort','sell',$3)`,
    [listingId,sellerId,`item-${listingId}`],
  );
  const result = await db.query(
    `with target as materialized (
       select l.id,l.user_id as seller_id,l.region_id,l.price_karma,l.title
       from listings l
       join profiles buyer on buyer.user_id = $3 and buyer.region_id = l.region_id
       where l.id = $1 and l.status = 'active' and l.category in ('goods','service')
         and l.offer_type = 'sell' and l.price_karma >= 100 and l.user_id <> $3
       for update of l
     ),
     locked_profiles as materialized (
       select p.user_id,p.karma_balance
       from profiles p join target t on p.user_id = $3 or p.user_id = t.seller_id
       order by p.user_id for update of p
     ),
     eligible as materialized (
       select t.* from target t
       where (select count(*) from locked_profiles) = 2
         and (select karma_balance from locked_profiles where user_id = $3) >= t.price_karma
     ),
     escrow as (
       insert into escrow_cases
         (id,listing_id,requester_id,moderator_id,reason,buyer_id,seller_id,region_id,amount_karma,funds_status)
       select $2,e.id,$3,$4,'Hochwertiges Tauschgeschäft',$3,e.seller_id,e.region_id,e.price_karma,'held'
       from eligible e
       returning id,listing_id,buyer_id,region_id,amount_karma
     ),
     debited as (
       update profiles p set karma_balance = p.karma_balance - e.amount_karma,last_activity_at = now()
       from escrow e where p.user_id = e.buyer_id and p.karma_balance >= e.amount_karma
       returning p.user_id
     ),
     hold_log as (
       insert into ledger_entries(region_id,sender_id,listing_id,amount_karma,entry_kind,message)
       select e.region_id,e.buyer_id,e.listing_id,e.amount_karma,'escrow_hold','Treuhand reserviert'
       from escrow e join debited d on d.user_id = e.buyer_id
       returning id
     ),
     reserved as (
       update listings l set status = 'booked'
       from escrow e,hold_log h where l.id = e.listing_id and l.status = 'active'
       returning l.id
     )
     select id from reserved`,
    [listingId,escrowId,buyerId,moderatorId],
  );
  assert.equal(result.rows.length,1,"a funded escrow must reserve its listing");
}

test("high-value escrow holds Karma, requires both confirmations, and supports moderator refund resolution", async () => {
  const db = new PGlite();
  try {
    await db.waitReady;
    for (const name of migrations) {
      const sql = await readFile(join(root,"migrations",name),"utf8");
      await db.exec(sql);
    }

    await db.query(
      `insert into profiles(user_id,username,region_id,karma_balance,is_verified,moderator_rank,last_active_at)
       values
        ('escrow-buyer','Escrow Buyer','yspertal-b36',100,true,0,now()),
        ('escrow-seller','Escrow Seller','yspertal-b36',0,true,0,now()),
        ('escrow-mod-1','Escrow Mod 1','yspertal-b36',10,true,1,now()),
        ('escrow-mod-2','Escrow Mod 2','yspertal-b36',10,true,1,now()),
        ('escrow-mod-3','Escrow Mod 3','yspertal-b36',10,true,1,now()),
        ('escrow-mod-4','Escrow Mod 4','yspertal-b36',10,true,1,now())`,
    );

    await createHeldEscrow(db,"escrow-listing-1","escrow-case-1","escrow-buyer","escrow-seller","escrow-mod-1");
    const held = await db.query(
      `select
        (select karma_balance from profiles where user_id='escrow-buyer') as buyer_balance,
        (select count(*)::int from ledger_entries where listing_id='escrow-listing-1' and entry_kind='escrow_hold') as holds,
        (select count(*)::int from escrow_moderators where escrow_id='escrow-case-1') as assigned`,
    );
    assert.equal(held.rows[0].buyer_balance,0,"buyer Karma is debited into escrow immediately");
    assert.equal(held.rows[0].holds,1,"the reserve is written to the immutable ledger");
    assert.ok(held.rows[0].assigned>=4,"four independent moderators must be assigned");

    await assert.rejects(
      db.query("select * from kreislauf_confirm_high_value_escrow($1,$2)",["escrow-listing-1","escrow-mod-1"]),
      /Nur die beiden Tauschparteien/,
      "a moderator cannot confirm receipt for either party",
    );

    for (const moderator of ["escrow-mod-1","escrow-mod-2","escrow-mod-3","escrow-mod-4"]) {
      await db.query("select * from kreislauf_cast_escrow_vote($1,$2,$3,$4)",
        ["escrow-listing-1",moderator,"approve","Freigabeprüfung"]);
    }
    const first = await db.query(
      "select * from kreislauf_confirm_high_value_escrow($1,$2)",
      ["escrow-listing-1","escrow-buyer"],
    );
    assert.equal(first.rows[0].status,"pending","one confirmation must not release funds");
    assert.equal(first.rows[0].buyer_confirmed,true);
    assert.equal(first.rows[0].seller_confirmed,false);
    const oneSided = await db.query(
      `select (select karma_balance from profiles where user_id='escrow-seller') as seller_balance,
         (select status from listings where id='escrow-listing-1') as listing_status`,
    );
    assert.equal(oneSided.rows[0].seller_balance,0);
    assert.equal(oneSided.rows[0].listing_status,"booked");

    const completed = await db.query(
      "select * from kreislauf_confirm_high_value_escrow($1,$2)",
      ["escrow-listing-1","escrow-seller"],
    );
    assert.equal(completed.rows[0].status,"released");
    const released = await db.query(
      `select
        (select karma_balance from profiles where user_id='escrow-buyer') as buyer_balance,
        (select karma_balance from profiles where user_id='escrow-seller') as seller_balance,
        (select status from listings where id='escrow-listing-1') as listing_status,
        (select funds_status from escrow_cases where id='escrow-case-1') as funds_status,
        (select count(*)::int from ledger_entries where listing_id='escrow-listing-1' and entry_kind='escrow_release') as releases`,
    );
    assert.equal(released.rows[0].buyer_balance,0);
    assert.equal(released.rows[0].seller_balance,100);
    assert.equal(released.rows[0].listing_status,"completed");
    assert.equal(released.rows[0].funds_status,"released");
    assert.equal(released.rows[0].releases,1);

    await db.query("update profiles set karma_balance=karma_balance+100 where user_id='escrow-buyer'");
    await db.query(
      "insert into ledger_entries(region_id,receiver_id,amount_karma,entry_kind,message) values ('yspertal-b36','escrow-buyer',100,'mint','Testguthaben für Erstattung')",
    );
    await createHeldEscrow(db,"escrow-listing-2","escrow-case-2","escrow-buyer","escrow-seller","escrow-mod-1");
    await db.query(
      "select kreislauf_open_high_value_dispute($1,$2,$3)",
      ["escrow-listing-2","escrow-buyer","Ware kam beschädigt an; bitte Belege prüfen."],
    );
    await assert.rejects(
      db.query("select * from kreislauf_vote_escrow_resolution($1,$2,$3,$4)",
        ["escrow-listing-2","escrow-buyer","refund","Unzulässige Käuferstimme"]),
      /Keine aktive Moderationszuordnung/,
      "a party cannot decide its own dispute",
    );
    for (const moderator of ["escrow-mod-1","escrow-mod-2","escrow-mod-3","escrow-mod-4"]) {
      await db.query("select * from kreislauf_vote_escrow_resolution($1,$2,$3,$4)",
        ["escrow-listing-2",moderator,"refund","Erstattung gerechtfertigt"]);
    }
    const refunded = await db.query(
      `select
        (select status from escrow_cases where id='escrow-case-2') as escrow_status,
        (select funds_status from escrow_cases where id='escrow-case-2') as funds_status,
        (select status from listings where id='escrow-listing-2') as listing_status,
        (select karma_balance from profiles where user_id='escrow-buyer') as buyer_balance,
        (select count(*)::int from ledger_entries where listing_id='escrow-listing-2' and entry_kind='escrow_refund') as refunds`,
    );
    assert.equal(refunded.rows[0].escrow_status,"refunded");
    assert.equal(refunded.rows[0].funds_status,"refunded");
    assert.equal(refunded.rows[0].listing_status,"active");
    assert.equal(refunded.rows[0].buyer_balance,100);
    assert.equal(refunded.rows[0].refunds,1);
  } finally {
    await db.close();
  }
});
