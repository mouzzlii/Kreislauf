import test from "node:test";
import assert from "node:assert/strict";
import { approximatePublicCoordinates } from "./geo-privacy.ts";

test("public listing coordinates are offset from the private GPS point", () => {
  const privatePoint = { lat: 48.2, lng: 15.1 };
  const result = approximatePublicCoordinates(privatePoint, privatePoint, "listing-123");
  assert.notDeepEqual(result, privatePoint);
  assert.ok(Math.abs(result.lat - privatePoint.lat) >= 0.008);
  assert.ok(Math.abs(result.lat - privatePoint.lat) <= 0.021);
  assert.ok(Math.abs(result.lng - privatePoint.lng) >= 0.008);
  assert.ok(Math.abs(result.lng - privatePoint.lng) <= 0.021);
});

test("public coordinates do not use an out-of-region private point", () => {
  const center = { lat: 48.2, lng: 15.1 };
  const result = approximatePublicCoordinates(center, { lat: 47, lng: 14 }, "listing-456");
  assert.ok(Math.abs(result.lat - center.lat) >= 0.008);
  assert.ok(Math.abs(result.lat - center.lat) <= 0.021);
  assert.ok(Math.abs(result.lng - center.lng) >= 0.008);
  assert.ok(Math.abs(result.lng - center.lng) <= 0.021);
});

test("the public offset is not predictable from a listing identifier", () => {
  const center = { lat: 48.2, lng: 15.1 };
  const first = approximatePublicCoordinates(center, center, "same-listing");
  const second = approximatePublicCoordinates(center, center, "same-listing");
  assert.notDeepEqual(first, second);
});

test("invalid regional centers fall back to a safe coordinate", () => {
  const result = approximatePublicCoordinates({ lat: Number.NaN, lng: 999 }, null, "bad-center");
  assert.ok(Number.isFinite(result.lat) && Number.isFinite(result.lng));
  assert.ok(result.lat >= 48.179 && result.lat <= 48.221);
  assert.ok(result.lng >= 15.079 && result.lng <= 15.121);
});
