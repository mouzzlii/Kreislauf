import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const api = await readFile(new URL("../src/features/kreislauf/api.ts", import.meta.url), "utf8");

function serverFunction(name) {
  const start = api.indexOf(`export const ${name} = createServerFn`);
  assert.notEqual(start, -1, `server function ${name} exists`);
  const next = api.indexOf("\\nexport const ", start + 20);
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
  const queryEnd = api.indexOf("\\n`;", queryStart);
  assert.notEqual(queryStart, -1);
  assert.notEqual(queryEnd, -1);
  const listingQuery = api.slice(queryStart, queryEnd);
  assert.doesNotMatch(listingQuery, /what3words_address/i);

  const meetingPoint = serverFunction("getMeetingPoint");
  assert.match(meetingPoint, /status in \('reserved','handed_over'\)/);
  assert.match(meetingPoint, /e\.status = 'released'/);
  assert.doesNotMatch(meetingPoint, /e\.status in \('pending','released'\)/);
});
