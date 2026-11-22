import test from "node:test";
import assert from "node:assert/strict";
import { approximatePublicCoordinates } from "./geo-privacy.ts";

test("public listing coordinates are never the exact private coordinates", () => {
  const privatePoint = { lat: 48.2, lng: 15.1 };
  const result = approximatePublicCoordinates({ lat: 48.2, lng: 15.1 }, privatePoint, "listing-123");
  assert.notDeepEqual(result, privatePoint);
  assert.ok(Math.abs(result.lat - privatePoint.lat) >= 0.003);
  assert.ok(Math.abs(result.lat - privatePoint.lat) <= 0.01);
  assert.ok(Math.abs(result.lng - privatePoint.lng) >= 0.003);
  assert.ok(Math.abs(result.lng - privatePoint.lng) <= 0.01);
});

test("public listing coordinates use the regional center if the candidate is out of region", () => {
  const center = { lat: 48.2, lng: 15.1 };
  const result = approximatePublicCoordinates(center, { lat: 47, lng: 14 }, "listing-456");
  assert.ok(Math.abs(result.lat - center.lat) <= 0.01);
  assert.ok(Math.abs(result.lng - center.lng) <= 0.01);
  assert.notDeepEqual(result, { lat: 47, lng: 14 });
});

test("the same listing seed yields stable approximate coordinates", () => {
  const center = { lat: 48.2, lng: 15.1 };
  const candidate = { lat: 48.21, lng: 15.12 };
  assert.deepEqual(
    approximatePublicCoordinates(center, candidate, "stable-listing"),
    approximatePublicCoordinates(center, candidate, "stable-listing"),
  );
});
