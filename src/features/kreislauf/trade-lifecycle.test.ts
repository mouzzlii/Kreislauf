import assert from "node:assert/strict";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { CREATE_TRADE_REQUEST_SQL, TRANSITION_TRADE_REQUEST_SQL, CONFIRM_TRADE_REQUEST_SQL } from "./trade-queries.ts";
import { readFile } from "node:fs/promises";

type TestDatabase = InstanceType<typeof PGlite>;

const migration = await readFile(new URL("../../../migrations/0004_direct_combined_trade.sql", import.meta.url), "utf8");
const messagingMigration = await readFile(new URL("../../../migrations/0005_listing_conversations_messages.sql", import.meta.url), "utf8");
const moderationMigration = await readFile(new URL("../../../migrations/0006_trade_dispute_moderation_quorum.sql", import.meta.url), "utf8");

async function fixture(): Promise<TestDatabase> {
  const db = new PGlite();
  await db.exec(`
    create table regions (id text primary key);
    create table profiles (
      user_id text primary key,
      region_id text not null references regions(id),
      karma_balance integer not null default 0 check (karma_balance >= 0),
      last_activity_at timestamptz not null default now(),
      is_verified boolean not null default false,
      moderator_rank integer not null default 0,
      last_active_at timestamptz not null default now()
    );
    create table listings (
      id text primary key,
      user_id text not null references profiles(user_id),
      region_id text not null references regions(id),
      category text not null,
      offer_type text not null,
      price_karma integer not null default 0,
      status text not null default 'active',
      item_uuid text not null,
      place_label text not null default 'In der Region',
      hands_count integer not null default 0
    );
    insert into regions values ('yspertal-b36'), ('donautal-sued');
    insert into profiles (user_id,region_id,karma_balance) values
      ('owner','yspertal-b36',100),
      ('requester','yspertal-b36',80),
      ('other','yspertal-b36',100),
      ('outsider','donautal-sued',100),
      ('mod-01','yspertal-b36',100),
      ('mod-02','yspertal-b36',100),
      ('mod-03','yspertal-b36',100),
      ('mod-04','yspertal-b36',100),
      ('mod-05','yspertal-b36',100),
      ('mod-06','yspertal-b36',100),
      ('mod-07','yspertal-b36',100);
    update profiles set is_verified=true, moderator_rank=1, last_active_at=now()
      where user_id like 'mod-%';
  `);
  await db.exec(migration);
  await db.exec(messagingMigration);
  await db.exec(moderationMigration);
  await db.exec(`
    insert into listings (
      id,user_id,region_id,category,offer_type,item_uuid,place_label,exchange_terms,karma_adjustment
    ) values
      ('combined','owner','yspertal-b36','goods','combined','item-combined','Hof am Hang','Gartenhilfe gegen Reparatur',25),
      ('direct','owner','yspertal-b36','goods','barter','item-direct','Werkstatt','Werkzeug gegen Brennholz',0),
      ('dispute','owner','yspertal-b36','service','barter','item-dispute','Yspertal','Werkzeug gegen Brennholz',0),
      ('cancel','owner','yspertal-b36','goods','barter','item-cancel','Yspertal','Werkzeug gegen Brennholz',0);
    create table ledger_entries (
      id bigint generated always as identity primary key,
      region_id text not null,
      sender_id text,
      receiver_id text,
      listing_id text,
      amount_karma integer not null,
      entry_kind text not null,
      message text not null
    );
    create table item_history (
      id bigint generated always as identity primary key,
      item_uuid text not null,
      listing_id text not null,
      owner_id text,
      place_label text not null,
      event_kind text not null
    );
  `);
  return db;
}

async function create(db: TestDatabase, listingId: string, requesterId = "requester", requestId = "req-1") {
  return db.query<{ id: string }>(CREATE_TRADE_REQUEST_SQL, [listingId, requesterId, requestId, "Ich biete zwei Stunden Gartenhilfe."]);
}
async function transition(db: TestDatabase, requestId: string, actor: string, action: string, reason = "Die Übergabe weicht von der Vereinbarung ab.") {
  return db.query<{ status: string }>(TRANSITION_TRADE_REQUEST_SQL, [requestId, actor, action, reason]);
}
async function voteDispute(db: TestDatabase, requestId: string, moderatorId: string, decision: "complete" | "cancel", note = "Prüfung der dokumentierten Übergabe.") {
  return db.query<{ status: string; votes: number; complete_votes: number; cancel_votes: number; assigned: number; required: number }>(
    "select * from kreislauf_vote_trade_dispute($1,$2,$3,$4)",
    [requestId, moderatorId, decision, note],
  );
}
async function confirm(db: TestDatabase, requestId: string, actor: string) {
  return db.query<{ id: string; status: string }>(CONFIRM_TRADE_REQUEST_SQL, [requestId, actor]);
}
async function balances(db: TestDatabase): Promise<Record<string, number>> {
  const r=await db.query<{ user_id: string; karma_balance: number }>("select user_id,karma_balance from profiles order by user_id");
  return Object.fromEntries(r.rows.map(x=>[x.user_id,Number(x.karma_balance)]));
}
async function requestRow(db: TestDatabase, id: string) {
  const r=await db.query<{ status: string; requester_confirmed: boolean; owner_confirmed: boolean; karma_amount: number }>("select status, requester_confirmed, owner_confirmed, karma_amount from trade_requests where id=$1",[id]);
  return r.rows[0];
}

test("combined trade requires both confirmations before one directional Karma transfer", async () => {
  const db=await fixture();
  try {
    const before=await balances(db);
    const made=await create(db,"combined");
    assert.equal(made.rows[0].id,"req-1");
    const conversation = await db.query<{ id: string }>(
      "select id from listing_conversations where listing_id='combined' and requester_id='requester'",
    );
    assert.equal(conversation.rows.length, 1);
    const initialMessage = await db.query<{ body: string; message_kind: string }>(
      "select body,message_kind from listing_messages where conversation_id=$1 order by id limit 1",
      [conversation.rows[0].id],
    );
    assert.equal(initialMessage.rows[0].message_kind, "system");
    assert.match(initialMessage.rows[0].body, /Neuer Tauschvorschlag/);
    assert.equal((await db.query<{ status: string }>("select status from listings where id='combined'")).rows[0].status,"booked");
    await transition(db,"req-1","owner","accept");

    await confirm(db,"req-1","owner");
    assert.deepEqual(await balances(db),before);
    let row=await requestRow(db,"req-1");
    assert.equal(row.owner_confirmed,true);
    assert.equal(row.requester_confirmed,false);
    assert.equal(row.status,"accepted");

    await confirm(db,"req-1","requester");
    const after=await balances(db);
    assert.equal(after.requester,55);
    assert.equal(after.owner,125);
    assert.equal(after.other,before.other);
    row=await requestRow(db,"req-1");
    assert.equal(row.status,"completed");
    const ledger=await db.query<{ sender_id: string; receiver_id: string; amount_karma: number; entry_kind: string }>("select sender_id,receiver_id,amount_karma,entry_kind from ledger_entries");
    assert.equal(ledger.rows.length,1);
    assert.deepEqual(ledger.rows[0],{sender_id:"requester",receiver_id:"owner",amount_karma:25,entry_kind:"transfer"});
    assert.equal((await db.query<{ status: string }>("select status from listings where id='combined'")).rows[0].status,"completed");
    assert.equal((await db.query<{ event_kind: string; owner_id: string }>("select event_kind,owner_id from item_history")).rows[0].owner_id,"requester");
    const repeated=await confirm(db,"req-1","requester");
    assert.equal(repeated.rows.length,0);
    assert.equal((await db.query<{ n: number }>("select count(*)::int as n from ledger_entries")).rows[0].n,1);
    assert.equal((await db.query<{ n: number }>(
      "select count(*)::int as n from listing_messages where conversation_id=$1 and message_kind='system'",
      [conversation.rows[0].id],
    )).rows[0].n,4);
  } finally { await db.close(); }
});

test("direct barter completes without a Karma balance change or ledger transfer", async () => {
  const db=await fixture();
  try {
    const before=await balances(db);
    await create(db,"direct");
    await transition(db,"req-1","owner","accept");
    await confirm(db,"req-1","requester");
    assert.deepEqual(await balances(db),before);
    await confirm(db,"req-1","owner");
    assert.deepEqual(await balances(db),before);
    assert.equal((await requestRow(db,"req-1")).status,"completed");
    assert.equal((await db.query<{ n: number }>("select count(*)::int as n from ledger_entries")).rows[0].n,0);
  } finally { await db.close(); }
});

test("disputed trade remains locked and can never transfer Karma", async () => {
  const db=await fixture();
  try {
    const before=await balances(db);
    await create(db,"dispute");
    await transition(db,"req-1","owner","accept");
    await transition(db,"req-1","requester","dispute");
    assert.equal((await requestRow(db,"req-1")).status,"disputed");
    assert.equal((await db.query<{ status: string }>("select status from listings where id='dispute'")).rows[0].status,"booked");
    assert.equal((await confirm(db,"req-1","owner")).rows.length,0);
    assert.deepEqual(await balances(db),before);
    assert.equal((await db.query<{ n: number }>("select count(*)::int as n from ledger_entries")).rows[0].n,0);
  } finally { await db.close(); }
});

test("rejection restores the listing and allows a fresh proposal", async () => {
  const db=await fixture();
  try {
    await create(db,"cancel");
    await transition(db,"req-1","owner","reject");
    assert.equal((await db.query<{ status: string }>("select status from listings where id='cancel'")).rows[0].status,"active");
    const second=await db.query<{ id: string }>(CREATE_TRADE_REQUEST_SQL,["cancel","other","req-2","Ich biete eine andere Gegenleistung."]);
    assert.equal(second.rows.length,1);
  } finally { await db.close(); }
});

test("request cannot be created across regions or by the listing owner", async () => {
  const db=await fixture();
  try {
    assert.equal((await create(db,"direct","owner","self")).rows.length,0);
    assert.equal((await create(db,"direct","outsider","cross-region")).rows.length,0);
  } finally { await db.close(); }
});

test("insufficient Karma at second confirmation blocks settlement and preserves the first confirmation", async () => {
  const db=await fixture();
  try {
    await create(db,"combined");
    await transition(db,"req-1","owner","accept");
    await confirm(db,"req-1","owner");
    await db.exec("update profiles set karma_balance=10 where user_id='requester'");
    const failure=await confirm(db,"req-1","requester");
    assert.equal(failure.rows.length,0);
    assert.equal((await requestRow(db,"req-1")).status,"accepted");
    assert.deepEqual(await balances(db),{owner:100,requester:10,other:100,outsider:100});
    await db.exec("update profiles set karma_balance=30 where user_id='requester'");
    await confirm(db,"req-1","requester");
    assert.equal((await requestRow(db,"req-1")).status,"completed");
    assert.equal((await balances(db)).requester,5);
  } finally { await db.close(); }
});

test("user messages share the listing conversation and are atomically rate limited", async () => {
  const db=await fixture();
  try {
    await create(db,"direct");
    const conversation=await db.query<{id:string}>(
      "select id from listing_conversations where listing_id='direct' and requester_id='requester'",
    );
    for(let i=0;i<12;i++){
      await db.query(
        "insert into listing_messages(conversation_id,sender_id,body,message_kind) values($1,'requester',$2,'user')",
        [conversation.rows[0].id,`Nachricht ${i+1}`],
      );
    }
    await assert.rejects(
      db.query(
        "insert into listing_messages(conversation_id,sender_id,body,message_kind) values($1,'requester','Zu viele Nachrichten','user')",
        [conversation.rows[0].id],
      ),
      /Nachrichtenlimit/,
    );
    const stored=await db.query<{n:number}>(
      "select count(*)::int as n from listing_messages where conversation_id=$1 and message_kind='user'",
      [conversation.rows[0].id],
    );
    assert.equal(stored.rows[0].n,12);
  } finally { await db.close(); }
});

test("every user and system message advances inbox conversation activity", async () => {
  const db=await fixture();
  try {
    await create(db,"direct");
    const conversation=await db.query<{id:string}>(
      "select id from listing_conversations where listing_id='direct' and requester_id='requester'",
    );
    await db.exec("update listing_conversations set updated_at='2000-01-01T00:00:00Z' where id='conv-' || md5('direct:requester')");
    await db.query(
      "insert into listing_messages(conversation_id,sender_id,body,message_kind) values($1,'requester','Neue Nachricht im Chat','user')",
      [conversation.rows[0].id],
    );
    const updated=await db.query<{updated_at:string}>(
      "select updated_at::text as updated_at from listing_conversations where id=$1",
      [conversation.rows[0].id],
    );
    assert.ok(new Date(updated.rows[0].updated_at).getTime() > new Date("2000-01-01T00:00:00Z").getTime());
  } finally { await db.close(); }
});
