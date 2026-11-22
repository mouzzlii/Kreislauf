import test from "node:test";
import assert from "node:assert/strict";
import { approximatePublicCoordinates } from "./geo-privacy.ts";

test("public coordinates are generated from the region center, not a private GPS point", () => {
  const center = { lat: 48.2, lng: 15.1 };
  const privatePoint = { lat: 48.211234, lng: 15.123456 };
  const result = approximatePublicCoordinates(center, privatePoint, "listing-123");
  assert.notDeepEqual(result, privatePoint);
  assert.ok(Math.abs(result.lat - center.lat) >= 0.003);
  assert.ok(Math.abs(result.lat - center.lat) <= 0.01);
  assert.ok(Math.abs(result.lng - center.lng) >= 0.003);
  assert.ok(Math.abs(result.lng - center.lng) <= 0.01);
});

test("changing a private candidate never changes the public map point", () => {
  const center = { lat: 48.2, lng: 15.1 };
  const first = approximatePublicCoordinates(center, { lat: 48.21, lng: 15.12 }, "same-listing");
  const second = approximatePublicCoordinates(center, { lat: 48.23, lng: 15.18 }, "same-listing");
  assert.deepEqual(first, second);
});

test("the same listing seed yields stable approximate regional coordinates", () => {
  const center = { lat: 48.2, lng: 15.1 };
  assert.deepEqual(
    approximatePublicCoordinates(center, null, "stable-listing"),
    approximatePublicCoordinates(center, null, "stable-listing"),
  );
});

test("invalid regional centers fall back to a safe coordinate", () => {
  const result = approximatePublicCoordinates({ lat: Number.NaN, lng: 999 }, null, "bad-center");
  assert.ok(Number.isFinite(result.lat) && Number.isFinite(result.lng));
  assert.ok(result.lat >= 48.19 && result.lat <= 48.21);
  assert.ok(result.lng >= 15.09 && result.lng <= 15.11);
});
