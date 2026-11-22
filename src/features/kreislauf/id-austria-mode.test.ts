import test from "node:test";
import assert from "node:assert/strict";
import { canUseIdAustriaMock } from "./id-austria-mode.ts";

test("allows the mock in Vercel Preview even though NODE_ENV is production", () => {
  assert.equal(canUseIdAustriaMock({
    mockMode: true,
    nodeEnv: "production",
    vercelEnv: "preview",
  }), true);
});

test("allows the mock during local development when explicitly enabled", () => {
  assert.equal(canUseIdAustriaMock({
    mockMode: true,
    nodeEnv: "development",
  }), true);
});

test("blocks the mock in Vercel Production", () => {
  assert.equal(canUseIdAustriaMock({
    mockMode: true,
    nodeEnv: "production",
    vercelEnv: "production",
  }), false);
});

test("blocks production hosts outside Vercel", () => {
  assert.equal(canUseIdAustriaMock({
    mockMode: true,
    nodeEnv: "production",
  }), false);
});

test("blocks the mock unless the explicit demo flag is enabled", () => {
  assert.equal(canUseIdAustriaMock({
    mockMode: false,
    nodeEnv: "development",
  }), false);
});
