import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const api = await readFile(new URL("../src/features/kreislauf/api.ts", import.meta.url), "utf8");
const escrowSql = await readFile(new URL("../migrations/0005_escrow_atomicity.sql", import.meta.url), "utf8");
const moderatorSql = await readFile(new URL("../migrations/0004_messages_escrow.sql", import.meta.url), "utf8");
const cancellationSql = await readFile(new URL("../migrations/0006_escrow_cancellation.sql", import.meta.url), "utf8");

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
