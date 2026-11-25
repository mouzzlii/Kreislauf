import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const route = await readFile(new URL("../src/routes/inserat/$listingId.tsx", import.meta.url), "utf8");
const gallery = await readFile(new URL("../src/components/listing-card.tsx", import.meta.url), "utf8");

test("listing detail always derives initial data from the currently matched route", () => {
  assert.match(route, /const \[detailState, setDetailState\]/);
  assert.match(route, /detailState\.listingId === listingId && detailState\.source === initial/);
  assert.match(route, /setDetailState\(\{ listingId, source: initial, value \}\)/);
});

test("listing route changes clear stale trade and meeting-point context", () => {
  assert.match(route, /setTradeRequests\(\[\]\);\s*let cancel = false;\s*getTradeRequests/);
  assert.match(route, /setMeetingPointUrl\(null\);\s*if \(!userId\) return;/);
  assert.match(route, /<ListingGallery key=\{listing\.id\}/);
});

test("listing photo gallery clamps its selected image index after image changes", () => {
  assert.match(gallery, /const safeIndex = Math\.min\(index, Math\.max\(images\.length - 1, 0\)\)/);
  assert.match(gallery, /const src = images\[safeIndex\]/);
});
