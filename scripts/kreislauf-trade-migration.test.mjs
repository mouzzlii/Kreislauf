import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { test } from "node:test";

const migration = readFileSync(
  new URL("../migrations/0004_direct_combined_trade.sql", import.meta.url),
  "utf8",
);

test("KREISLAUF trade migration preserves existing wallets and enforces exchange constraints", async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create table regions (id text primary key);
      create table profiles (
        user_id text primary key,
        region_id text not null references regions(id),
        karma_balance integer not null default 0
      );
      create table listings (
        id text primary key,
        user_id text not null references profiles(user_id),
        region_id text not null references regions(id),
        category text not null,
        offer_type text not null,
        price_karma integer not null default 0,
        status text not null default 'active',
        constraint listings_offer_type_check check (offer_type in ('sell','search','gift'))
      );
      insert into regions values ('yspertal-b36');
      insert into profiles values
        ('owner', 'yspertal-b36', 120),
        ('requester', 'yspertal-b36', 80),
        ('other', 'yspertal-b36', 40);
      insert into listings (id,user_id,region_id,category,offer_type,price_karma)
        values ('legacy-sell','owner','yspertal-b36','goods','sell',15);
    `);

    await db.exec(migration);

    const legacy = await db.query(
      "select price_karma from listings where id = 'legacy-sell'",
    );
    assert.equal(legacy.rows[0].price_karma, 15);

    const walletsBefore = await db.query(
      "select user_id, karma_balance from profiles order by user_id",
    );

    await db.exec(`
      insert into listings (
        id,user_id,region_id,category,offer_type,price_karma,exchange_terms,karma_adjustment
      ) values
        ('direct','owner','yspertal-b36','goods','barter',0,'Werkzeug gegen Brennholz',0),
        ('combined','owner','yspertal-b36','service','combined',0,'Fensterhilfe gegen Gartenarbeit',20);
    `);

    await assert.rejects(
      db.exec(`insert into listings (id,user_id,region_id,category,offer_type,exchange_terms,karma_adjustment)
        values ('bad-karma','owner','yspertal-b36','goods','barter','Gegenleistung beschreiben',1)`),
    );
    await assert.rejects(
      db.exec(`insert into listings (id,user_id,region_id,category,offer_type,exchange_terms)
        values ('bad-category','owner','yspertal-b36','sharing','barter','Gegenleistung beschreiben')`),
    );
    await assert.rejects(
      db.exec(`insert into listings (id,user_id,region_id,category,offer_type,exchange_terms)
        values ('bad-terms','owner','yspertal-b36','goods','combined','kurz')`),
    );
    await assert.rejects(
      db.exec(`insert into trade_requests (
        id,listing_id,region_id,requester_id,owner_id,offered_description,karma_amount
      ) values ('self-trade','direct','yspertal-b36','owner','owner','Gegenleistung beschreiben',0)`),
    );
    await assert.rejects(
      db.exec(`insert into trade_requests (
        id,listing_id,region_id,requester_id,owner_id,offered_description,karma_amount
      ) values ('negative-karma','direct','yspertal-b36','requester','owner','Gegenleistung beschreiben',-1)`),
    );

    await db.exec(`
      insert into trade_requests (
        id,listing_id,region_id,requester_id,owner_id,offered_description,karma_amount
      ) values ('first-request','direct','yspertal-b36','requester','owner','Gegenleistung beschreiben',0);
    `);
    await assert.rejects(
      db.exec(`insert into trade_requests (
        id,listing_id,region_id,requester_id,owner_id,offered_description,karma_amount
      ) values ('parallel-request','direct','yspertal-b36','other','owner','Weitere Gegenleistung',0)`),
    );
    await db.exec("update trade_requests set status = 'rejected' where id = 'first-request'");
    await db.exec(`
      insert into trade_requests (
        id,listing_id,region_id,requester_id,owner_id,offered_description,karma_amount
      ) values ('second-request','direct','yspertal-b36','other','owner','Weitere Gegenleistung',0);
    `);

    const walletsAfter = await db.query(
      "select user_id, karma_balance from profiles order by user_id",
    );
    assert.deepEqual(walletsAfter.rows, walletsBefore.rows);

    const combined = await db.query(
      "select karma_adjustment from listings where id = 'combined'",
    );
    assert.equal(combined.rows[0].karma_adjustment, 20);

    const direct = await db.query(
      "select karma_adjustment from listings where id = 'direct'",
    );
    assert.equal(direct.rows[0].karma_adjustment, 0);
  } finally {
    await db.close();
  }
});
