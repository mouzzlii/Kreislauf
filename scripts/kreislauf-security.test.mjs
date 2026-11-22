import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const api = await readFile(new URL("../src/features/kreislauf/api.ts", import.meta.url), "utf8");
const listingMedia = await readFile(new URL("../src/features/kreislauf/media.ts", import.meta.url), "utf8");
const escrowSql = await readFile(new URL("../migrations/0005_escrow_atomicity.sql", import.meta.url), "utf8");
const coreSql = await readFile(new URL("../migrations/0003_kreislauf_v2.sql", import.meta.url), "utf8");
const moderatorSql = await readFile(new URL("../migrations/0004_messages_escrow.sql", import.meta.url), "utf8");
const cancellationSql = await readFile(new URL("../migrations/0006_escrow_cancellation.sql", import.meta.url), "utf8");
const legacySql = await readFile(new URL("../migrations/0009_lock_down_legacy_tables.sql", import.meta.url), "utf8");
const setupSql = await readFile(new URL("../SUPABASE-SETUP.sql", import.meta.url), "utf8");
const messagingSql = await readFile(new URL("../migrations/0004_messages_escrow.sql", import.meta.url), "utf8");
const escrowPanel = await readFile(new URL("../src/components/escrow-panel.tsx", import.meta.url), "utf8");
const vercelConfig = await readFile(new URL("../vercel.json", import.meta.url), "utf8");
const authClient = await readFile(new URL("../src/lib/auth/client.ts", import.meta.url), "utf8");
const authPopup = await readFile(new URL("../src/lib/auth/popup.server.ts", import.meta.url), "utf8");
const videoUploadRoute = await readFile(new URL("../src/routes/api/upload.ts", import.meta.url), "utf8");
const videoUploadValidation = await readFile(new URL("../src/features/kreislauf/video-upload.ts", import.meta.url), "utf8");
const videoMigration = await readFile(new URL("../migrations/0013_listing_video_urls.sql", import.meta.url), "utf8");
const pausedMigration = await readFile(new URL("../migrations/0015_listing_paused_status.sql", import.meta.url), "utf8");
const marketRoute = await readFile(new URL("../src/routes/index.tsx", import.meta.url), "utf8");
const mapRoute = await readFile(new URL("../src/routes/karte.tsx", import.meta.url), "utf8");
const shell = await readFile(new URL("../src/components/shell.tsx", import.meta.url), "utf8");
const listingDetail = await readFile(new URL("../src/routes/inserat/$listingId.tsx", import.meta.url), "utf8");
const listingTypes = await readFile(new URL("../src/features/kreislauf/types.ts", import.meta.url), "utf8");
const listingConversation = await readFile(new URL("../src/components/listing-conversation.tsx", import.meta.url), "utf8");
const accountRoute = await readFile(new URL("../src/routes/konto.tsx", import.meta.url), "utf8");

function serverFunction(name) {
  const start = api.indexOf(`export const ${name} = createServerFn`);
  assert.notEqual(start, -1, `server function ${name} exists`);
  const next = api.indexOf("\nexport const ", start + 20);
  return api.slice(start, next === -1 ? api.length : next);
}

test("private KREISLAUF actions require verified server-side identity middleware", () => {
  for (const name of [
    "createListing", "tradeListing", "reserveListing", "transitionBooking",
    "addReview", "getMeetingPoint", "getListingBooking", "getListingMessages",
    "sendListingMessage", "getListingThreads", "getEscrowSummary", "voteEscrow",
  ]) {
    assert.match(serverFunction(name), /\.middleware\(\[authMiddleware\]\)/, `${name} must require authMiddleware`);
  }
});

test("high-value trades are reserved in community escrow before any settlement", () => {
  const trade = serverFunction("tradeListing");
  const highValue = trade.slice(trade.indexOf("if (highValue[0])"), trade.indexOf("const rows = await sql.query", trade.indexOf("if (highValue[0])")));
  assert.match(highValue, /moderators\.length < 4/);
  assert.match(highValue, /with target as \(select id from listings where id = \$1 and status = 'active' for update\)/);
  assert.match(highValue, /insert into escrow_cases/);
  assert.match(highValue, /update listings set status = 'booked'/);
  assert.doesNotMatch(highValue, /update profiles|insert into ledger_entries/);
  const settlement = escrowSql.slice(escrowSql.indexOf("if v_case.reason = 'Hochwertiges Tauschgeschäft'"), escrowSql.indexOf("elsif v_votes >= 4 and v_rejections"));
  assert.match(settlement, /Fail closed/);
  assert.match(settlement, /null;/);
  assert.doesNotMatch(settlement, /update profiles|insert into ledger_entries|set status = 'completed'/);
  assert.match(escrowPanel, /beide Tauschparteien die Übergabe und den Empfang bestätigen/);
  assert.match(coreSql, /create unique index if not exists escrow_one_pending_per_listing_idx[\s\S]*?where status = 'pending'/);
});

test("direct trades serialize listing and account locks before settlement", () => {
  const trade = serverFunction("tradeListing");
  assert.match(trade, /target as materialized[\s\S]*?for update of l/);
  assert.match(trade, /locked_profiles as materialized[\s\S]*?for update of p/);
  assert.match(trade, /select count\(\*\) from locked_profiles/);
  assert.match(trade, /karma_balance[\s\S]*?locked_profiles lp where lp.user_id = \$2/);
  assert.match(trade, /l\.status = 'active'/);
  assert.match(trade, /select count\(\*\) from moved/);
});

test("Karma balance mutations are paired with immutable ledger entries", () => {
  const trade = serverFunction("tradeListing");
  assert.match(trade, /moved as materialized|moved as \(/);
  assert.match(trade, /update profiles p[\s\S]*?karma_balance = p\.karma_balance[\s\S]*?returning p\.user_id/);
  assert.match(trade, /transfer_log as \([\s\S]*?insert into ledger_entries/);
  assert.match(trade, /bonus_log as \([\s\S]*?insert into ledger_entries/);

  const transition = serverFunction("transitionBooking");
  assert.match(transition, /update profiles p[\s\S]*?karma_balance = p\.karma_balance[\s\S]*?returning p\.user_id/);
  assert.match(transition, /transfer_log as \([\s\S]*?insert into ledger_entries/);
  assert.match(transition, /bonus_log as \([\s\S]*?insert into ledger_entries/);

  assert.match(coreSql, /update profiles[\s\S]*?set karma_balance = karma_balance - rec\.cut[\s\S]*?insert into ledger_entries/);
  assert.match(api, /with created_profile as \([\s\S]*?insert into ledger_entries/);
});

test("private meeting point is not exposed by public listing queries", () => {
  const queryStart = api.indexOf("const LISTING_SQL =");
  const queryEnd = api.indexOf("\n`;", queryStart);
  assert.notEqual(queryStart, -1);
  assert.notEqual(queryEnd, -1);
  const listingQuery = api.slice(queryStart, queryEnd);
  assert.doesNotMatch(listingQuery, /what3words_address/i);

  const meetingPoint = serverFunction("getMeetingPoint");
  assert.match(meetingPoint, /status in \('reserved','handed_over'\)/);
  assert.match(meetingPoint, /e\.status = 'released'/);
  assert.doesNotMatch(meetingPoint, /e\.status in \('pending','released'\)/);
});

test("community escrow assigns up to seven moderators and decides after four votes", () => {
  assert.match(moderatorSql, /limit greatest\(0, 7 - \(select count\(\*\) from escrow_moderators/);
  assert.match(moderatorSql, /p\.is_verified = true and p\.moderator_rank > 0/);
  assert.match(escrowSql, /v_required := 4;/);
  assert.match(escrowSql, /if v_votes >= 4 and v_approvals >= ceil\(v_votes \* 2\.0 \/ 3\.0\) then/);
  assert.match(escrowSql, /elsif v_votes >= 4 and v_rejections >= ceil\(v_votes \* 2\.0 \/ 3\.0\) then/);
  assert.doesNotMatch(escrowSql, /v_required := greatest/);
});

test("cancelling or returning a booking closes its unresolved escrow", () => {
  const transition = serverFunction("transitionBooking");
  assert.match(transition, /update escrow_cases set status = 'cancelled', resolved_at = now\(\)/);
  assert.match(transition, /where booking_id = \$1 and status = 'pending'/);
  assert.match(cancellationSql, /'pending', 'released', 'disputed', 'cancelled'/);
});

test("a disputed sharing escrow cannot be bypassed by cancelling or returning its booking", () => {
  const transition = serverFunction("transitionBooking");
  const cancel = transition.slice(transition.indexOf('if (data.action === "cancel")'), transition.indexOf('if (data.action === "return")'));
  const returnStart = transition.indexOf('if (data.action === "return")');
  const returning = transition.slice(returnStart, transition.indexOf("Rückgabe nicht möglich.", returnStart));
  for (const action of [cancel, returning]) {
    assert.match(action, /escrow_guard as materialized/);
    assert.match(action, /where booking_id = \$1\s+for update/);
    assert.match(action, /not exists \(select 1 from escrow_guard where status = 'disputed'\)/);
    assert.match(action, /update listings set status = 'active'[\s\S]*?where id = \(select listing_id from upd\)/);
  }
});

test("sharing handover is blocked until its escrow has been released", () => {
  const transition = serverFunction("transitionBooking");
  const handover = transition.slice(transition.indexOf('const rows = await sql.query(', transition.indexOf('if (data.action === "return")')));
  assert.match(handover, /not exists \(select 1 from escrow_cases e where e\.booking_id = bookings\.id\)/);
  assert.match(handover, /exists \(select 1 from escrow_cases e where e\.booking_id = bookings\.id and e\.status = 'released'\)/);
  assert.match(transition, /Treuhandfreigabe und Karma/);
});

test("cancelled escrow is represented separately in the API and user interface", () => {
  assert.match(api, /status: "pending" \| "released" \| "disputed" \| "cancelled" \| null/);
  assert.match(api, /status: "pending" \| "released" \| "disputed" \| "cancelled";/);
  assert.match(api, /as "pending" \| "released" \| "disputed" \| "cancelled"/);
  assert.match(escrowPanel, /summary\.status === "cancelled"/);
  assert.doesNotMatch(escrowPanel, /summary\.status === "cancelled"[\s\S]*?Treuhand wurde abgelehnt/);
});

test("listing requests and trade events create system messages in the linked conversation", () => {
  assert.match(messagingSql, /create trigger bookings_message_created after insert on bookings/);
  assert.match(messagingSql, /create trigger escrow_message_created after insert on escrow_cases/);
  assert.match(messagingSql, /create trigger ledger_transfer_message after insert on ledger_entries/);
  assert.match(messagingSql, /message_kind\)\s*values \(v_conversation_id, null, left\(p_body, 2000\), 'system'\)/);
});

test("region changes cannot move a member's karma balance across regional ledgers", () => {
  const changeRegion = serverFunction("setRegion");
  assert.match(changeRegion, /select region_id from profiles where user_id = \$1 for update/);
  assert.match(changeRegion, /current\[0\]\.region_id !== data\.regionId/);
  assert.match(changeRegion, /Regionswechsel ist derzeit gesperrt/);
  assert.doesNotMatch(changeRegion, /update profiles set region_id/);
});

test("global demurrage stays blocked unless the caller administers every enabled region", () => {
  const demurrage = serverFunction("runDemurrage");
  assert.match(demurrage, /count\(\*\) filter \(where admin_user_id = \$1\)/);
  assert.match(demurrage, /administeredRegions !== enabledRegions/);
  assert.match(demurrage, /Umlaufprämie ist gesperrt/);
});

test("listing messages are restricted to the owner and the selected requester", () => {
  const threads = serverFunction("getListingThreads");
  const messages = serverFunction("getListingMessages");
  const send = serverFunction("sendListingMessage");
  assert.match(threads, /c\.listing_id = \$1 and \(c\.owner_id = \$2 or c\.requester_id = \$2\)/);
  assert.match(messages, /c\.listing_id = \$1 and c\.requester_id = \$2 and c\.owner_id = \$3/);
  assert.match(messages, /c\.requester_id = \$4 or c\.owner_id = \$4/);
  assert.match(messages, /update listing_messages set read_at = now\(\)[\s\S]*?listing_id = \$1 and requester_id = \$2 and owner_id = \$3[\s\S]*?requester_id = \$4 or owner_id = \$4/);
  assert.match(send, /context\.userId === ownerId/);
  assert.match(send, /Du kannst erst antworten, wenn das andere Mitglied eine Unterhaltung begonnen hat/);
  // A requester cannot select another member's conversation by forging requesterId.
  assert.match(send, /context\.userId === ownerId \? data\.requesterId : context\.userId/);
  // Owners may only reply to an already-created conversation for this listing.
  assert.match(send, /select id from listing_conversations where listing_id = \$1 and requester_id = \$2 and owner_id = \$3/);
  // Read receipts are scoped to the same listing, requester, owner, and participant.
  assert.match(messages, /update listing_messages set read_at = now\(\)[\s\S]*?listing_id = \$1 and requester_id = \$2 and owner_id = \$3[\s\S]*?requester_id = \$4 or owner_id = \$4/);
});

test("Supabase setup bundle mirrors the booking status notification migration", () => {
  for (const source of [cancellationSql, setupSql]) {
    assert.match(source, /create trigger bookings_status_message_updated/);
    assert.match(source, /after update of status on public\.bookings/);
    assert.match(source, /Reservierung storniert: Die Buchung wurde beendet/);
    assert.match(source, /Rückgabe bestätigt: Der Vorgang wurde abgeschlossen/);
  }
});


test("retired prototype tables have no permissive browser policies", () => {
  assert.match(legacySql, /drop policy/i);
  assert.match(legacySql, /enable row level security/i);
  assert.match(legacySql, /revoke all on table/i);
  assert.match(legacySql, /users/);
  assert.match(legacySql, /transactions/);
  assert.match(legacySql, /marketplace_items/);
});


test("deployment sends baseline browser security headers", () => {
  const config = JSON.parse(vercelConfig);
  const headers = config.headers.find((entry) => entry.source === "/(.*)")?.headers ?? [];
  const values = Object.fromEntries(headers.map(({ key, value }) => [key.toLowerCase(), value]));
  assert.match(values["strict-transport-security"] ?? "", /max-age=31536000/);
  assert.equal(values["x-content-type-options"], "nosniff");
  assert.equal(values["referrer-policy"], "strict-origin-when-cross-origin");
});


test("every mutating or private server function enforces verified identity", () => {
  const declarations = [...api.matchAll(/export const (\w+) = createServerFn\(\{ method: "(GET|POST)" \}\)/g)];
  const publicReads = new Set(["getBoard", "getListing", "getProviderListings"]);
  declarations.forEach((match, index) => {
    const end = declarations[index + 1]?.index ?? api.length;
    const source = api.slice(match.index, end);
    if (match[2] === "POST" || !publicReads.has(match[1])) {
      assert.match(source, /\.middleware\(\[authMiddleware\]\)/, match[1] + " must require verified identity");
    }
  });
});


test("Better Auth generic OAuth uses the patched 1.7 social sign-in API", () => {
  assert.doesNotMatch(authClient, /genericOAuthClient|signIn\.oauth2/);
  assert.match(authClient, /authClient\.signIn\.social\(\{\s*provider: providerId/);
  assert.doesNotMatch(authPopup, /signInWithOAuth2/);
  assert.match(authPopup, /auth\.api\.signInSocial/);
  assert.match(authPopup, /GROK_PROVIDERS\.find/);
  assert.match(authPopup, /Unknown provider/);
});


test("listing creation validates image payloads and atomically writes ownership history", () => {
  const create = serverFunction("createListing");
  assert.ok(create.includes("data:image"));
  assert.ok(create.includes("imageDataUrls.reduce"));
  assert.ok(create.includes("1_000_000"));
  assert.ok(create.includes("with created_listing as"));
  assert.ok(create.includes("insert into item_history"));
  assert.ok(!create.includes("await sql.query(`insert into item_history"));
});


test("listing video upload requires a real signed-in member and constrained Blob tokens", () => {
  assert.match(videoUploadRoute, /Video-Uploads sind vorübergehend gesperrt/);
  assert.match(videoUploadRoute, /status: 503/);
  assert.match(videoUploadRoute, /serverseitig/);
  assert.match(videoUploadValidation, /pathname\.startsWith\(prefix\)/);
  assert.match(videoUploadValidation, /duration > 60/);
  assert.match(videoUploadValidation, /listings\/\$\{encodeURIComponent\(userId\)\}/);

});

test("ID Austria mock verification cannot be enabled in production", () => {
  assert.match(api, /process\.env\.NODE_ENV === "production" \|\| !mockMode/);
  assert.match(api, /Eine Demo-Verifikation ist dort gesperrt/);
});

test("listing creation rejects video references until server-side media inspection exists", () => {
  const create = serverFunction("createListing");
  assert.match(create, /rawVideoUrls\.length > 0/);
  assert.match(create, /Video-Uploads sind noch gesperrt/);
  assert.doesNotMatch(create, /validateListingVideoSet/);
  assert.match(create, /assertOwnedListingImageUrl\(imageUrl, context\.userId\)/);
  assert.match(listingMedia, /\.public\.blob\.vercel-storage\.com/);
  assert.match(listingMedia, /\/listings\/\$\{encodeURIComponent\(userId\)\}\//);
  assert.match(create, /video_urls/);
  assert.match(videoMigration, /add column if not exists video_urls jsonb/);
  assert.match(videoMigration, /jsonb_array_length\(video_urls\) <= 4/);
});


test("listing owners can pause and resume only their own active or paused listings", () => {
  const availability = serverFunction("setListingAvailability");
  assert.match(availability, /\.middleware\(\[authMiddleware\]\)/);
  assert.match(availability, /action !== "pause" && action !== "resume"/);
  assert.match(availability, /where id = \$1 and user_id = \$2 and status = \$4/);
  assert.match(availability, /data\.action === "pause" \? "active" : "paused"/);
  assert.match(availability, /data\.action === "pause" \? "paused" : "active"/);
  assert.match(availability, /returning id/);
  assert.match(availability, /Das Inserat ist nicht mehr verfügbar oder gehört nicht zu deinem Konto/);
});


test("paused listings stay out of the public market feed", () => {
  assert.match(marketRoute, /listing\.status === "maintenance" \|\| listing\.status === "paused"\) return false/);
});


test("high-value escrow copy does not promise automatic settlement after moderator votes", () => {
  assert.match(listingDetail, /Die Moderation allein überträgt noch kein Karma/);
  assert.match(listingDetail, /Beide Tauschparteien müssen die Übergabe und den Empfang bestätigen/);
  assert.match(listingDetail, /Nach dem Mehrheitsbeschluss bleibt der Vorgang gesperrt/);
  assert.doesNotMatch(listingDetail, /Karma wird erst nach mindestens vier Stimmen und einer Zweidrittelmehrheit übertragen/);
});

test("paused listing details are hidden publicly while owners can manage their own listings", () => {
  assert.match(serverFunction("getListing"), /l\.status not in \(\x27maintenance\x27, \x27paused\x27\)/);
  assert.match(serverFunction("getMyListings"), /\.middleware\(\[authMiddleware\]\)/);
  assert.match(serverFunction("getMyListings"), /where l\.user_id = \$1/);
  assert.match(serverFunction("getMyListings"), /l\.status in \(\x27active\x27, \x27paused\x27, \x27completed\x27, \x27booked\x27\)/);
  assert.match(accountRoute, /Meine Inserate/);
  assert.match(accountRoute, /changeListingStatus\(listing\.id\)/);
  assert.match(accountRoute, /setListingAvailability\(\{ data: \{ id, action: "resume" \} \}\)/);
});
test("paused listings stay out of both market and map views", () => {
  assert.match(marketRoute, /listing\.status === "maintenance" \|\| listing\.status === "paused"\) return false/);
  assert.match(mapRoute, /!\["completed", "maintenance", "paused"\]\.includes\(listing\.status\)/);
  assert.match(serverFunction("getBoard"), /l\.status not in \(\x27maintenance\x27, \x27paused\x27\)/);
});

test("maintenance and user-paused listings remain distinct database states", () => {
  assert.match(pausedMigration, /drop constraint if exists listings_status_check/);
  assert.match(pausedMigration, /'maintenance', 'paused'/);
  assert.match(setupSql, /'maintenance', 'paused'/);
  assert.match(api, /data\.action === "pause" \? "active" : "paused"/);
  assert.match(api, /data\.action === "pause" \? "paused" : "active"/);
});


test("unread listing notifications open the exact conversation, including multiple requesters per listing", () => {
  const notifications = serverFunction("getUnreadListingNotifications");
  assert.match(notifications, /c\.requester_id as "requesterId"/);
  assert.match(notifications, /requesterId: asString\(row\.requesterId\)/);
  assert.match(shell, /item\.listingId\}:\$\{item\.requesterId/);
  assert.match(shell, /search=\{\{ conversation: item\.requesterId \}\}/);
  assert.match(listingDetail, /validateSearch:[\s\S]*conversation\?: string/);
  assert.match(listingDetail, /typeof search\.conversation === "string" \? \{ conversation: search\.conversation \} : \{\}/);
  assert.match(listingDetail, /Route\.useSearch\(\)/);
  assert.match(listingDetail, /initialRequesterId=\{requestedConversationId\}/);
  assert.match(listingConversation, /initialRequesterId\?: string/);
  assert.match(listingConversation, /initialRequesterId \|\| current \|\| items\[0\]\?\.requesterId/);
});


test("disputed escrow remains visible on the listing detail instead of disappearing", () => {
  assert.match(api, /from escrow_cases where listing_id = \$1 and status in \('pending', 'disputed'\)/);
  assert.match(api, /escrowVisible: escrowRows.length > 0/);
  assert.match(listingDetail, /detail\.escrowVisible/);
  assert.match(listingTypes, /escrowVisible: boolean/);
  assert.match(escrowPanel, /summary\.status === "disputed"/);
  assert.match(escrowPanel, /Das Inserat bleibt gesperrt/);
});


test("profile creation and regional welcome Karma mint are atomic", () => {
  const ensure = serverFunction("ensureProfile");
  assert.match(ensure, /with created_profile as/);
  assert.match(ensure, /on conflict \(user_id\) do nothing/);
  assert.match(ensure, /insert into ledger_entries[\s\S]*?select region_id, null, user_id, \$3, 'mint'/);
  assert.doesNotMatch(ensure, /if \(created\.length > 0\)/);
  assert.match(ensure, /await sql\.query\(\s*`with created_profile as[\s\S]*?insert into ledger_entries/);
});
