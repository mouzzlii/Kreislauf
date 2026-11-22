import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const api = await readFile(new URL("../src/features/kreislauf/api.ts", import.meta.url), "utf8");
const escrowSql = await readFile(new URL("../migrations/0005_escrow_atomicity.sql", import.meta.url), "utf8");
const moderatorSql = await readFile(new URL("../migrations/0004_messages_escrow.sql", import.meta.url), "utf8");
const cancellationSql = await readFile(new URL("../migrations/0006_escrow_cancellation.sql", import.meta.url), "utf8");
const legacySql = await readFile(new URL("../migrations/0009_lock_down_legacy_tables.sql", import.meta.url), "utf8");
const setupSql = await readFile(new URL("../SUPABASE-SETUP.sql", import.meta.url), "utf8");
const messagingSql = await readFile(new URL("../migrations/0004_messages_escrow.sql", import.meta.url), "utf8");
const escrowPanel = await readFile(new URL("../src/components/escrow-panel.tsx", import.meta.url), "utf8");
const vercelConfig = await readFile(new URL("../vercel.json", import.meta.url), "utf8");
const authClient = await readFile(new URL("../src/lib/auth/client.ts", import.meta.url), "utf8");
const authPopup = await readFile(new URL("../src/lib/auth/popup.server.ts", import.meta.url), "utf8");

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

test("direct trades serialize listing and account locks before settlement", () => {
  const trade = serverFunction("tradeListing");
  assert.match(trade, /target as materialized[\s\S]*?for update of l/);
  assert.match(trade, /locked_profiles as materialized[\s\S]*?for update of p/);
  assert.match(trade, /select count\(\*\) from locked_profiles/);
  assert.match(trade, /karma_balance[\s\S]*?locked_profiles lp where lp.user_id = \$2/);
  assert.match(trade, /l\.status = 'active'/);
  assert.match(trade, /select count\(\*\) from moved/);
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

test("cancelled escrow is represented separately in the API and user interface", () => {
  assert.match(api, /status: "pending" \| "released" \| "disputed" \| "cancelled" \| null/);
  assert.match(api, /status: "pending" \| "released" \| "disputed" \| "cancelled";/);
  assert.match(escrowPanel, /summary\.status === "cancelled"/);
  assert.doesNotMatch(escrowPanel, /summary\.status === "cancelled"[\s\S]*?Treuhand wurde abgelehnt/);
});

test("listing requests and trade events create system messages in the linked conversation", () => {
  assert.match(messagingSql, /create trigger bookings_message_created after insert on bookings/);
  assert.match(messagingSql, /create trigger escrow_message_created after insert on escrow_cases/);
  assert.match(messagingSql, /create trigger ledger_transfer_message after insert on ledger_entries/);
  assert.match(messagingSql, /message_kind\)\s*values \(v_conversation_id, null, left\(p_body, 2000\), 'system'\)/);
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
  assert.match(send, /context\.userId === ownerId/);
  assert.match(send, /Du kannst erst antworten, wenn das andere Mitglied eine Unterhaltung begonnen hat/);
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
  assert.match(create, /data:image/);
  assert.match(create, /imageDataUrls\\.reduce/);
  assert.match(create, /1_000_000/);
  assert.match(create, /with created_listing as/);
  assert.match(create, /insert into item_history/);
  assert.doesNotMatch(create, /await sql\\.query\\([\\s\\S]*?insert into listings[\\s\\S]*?\\);\\s*await sql\\.query\\([\\s\\S]*?insert into item_history/);
});
