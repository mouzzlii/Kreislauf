import test from "node:test";
import assert from "node:assert/strict";
import { checkVideoDurations, VIDEO_PRESETS } from "./video-rules.ts";

test("video presets match the requested three alternatives", () => {
  assert.deepEqual(VIDEO_PRESETS.single, { label: "1 Video bis 60 Sekunden", maxFiles: 1, maxEachSeconds: 60 });
  assert.deepEqual(VIDEO_PRESETS.pair, { label: "2 Videos bis je 30 Sekunden", maxFiles: 2, maxEachSeconds: 30 });
  assert.deepEqual(VIDEO_PRESETS.quad, { label: "4 Videos bis je 20 Sekunden", maxFiles: 4, maxEachSeconds: 20 });
});

test("accepts the maximum duration for each preset", () => {
  assert.deepEqual(checkVideoDurations("single", [60]), { ok: true, totalSeconds: 60 });
  assert.deepEqual(checkVideoDurations("pair", [30, 30]), { ok: true, totalSeconds: 60 });
  assert.deepEqual(checkVideoDurations("quad", [15, 15, 15, 15]), { ok: true, totalSeconds: 60 });
});

test("rejects too many clips and clips above their preset duration", () => {
  assert.equal(checkVideoDurations("single", [30, 20]).ok, false);
  assert.equal(checkVideoDurations("pair", [31]).ok, false);
  assert.equal(checkVideoDurations("quad", [21]).ok, false);
});

test("rejects combined duration above 60 seconds", () => {
  assert.equal(checkVideoDurations("pair", [30, 30.1]).ok, false);
  assert.equal(checkVideoDurations("quad", [16, 16, 16, 16]).ok, false);
});

test("rejects empty, zero, negative, and non-finite durations", () => {
  assert.equal(checkVideoDurations("single", []).ok, false);
  assert.equal(checkVideoDurations("single", [0]).ok, false);
  assert.equal(checkVideoDurations("single", [-1]).ok, false);
  assert.equal(checkVideoDurations("single", [Number.NaN]).ok, false);
});
