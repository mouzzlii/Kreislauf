import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

const script = fileURLToPath(new URL("./assert-production-config.mjs", import.meta.url));

function run(env) {
  return spawnSync(process.execPath, [script], {
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
}

describe("production release guard", () => {
  it("keeps preview builds available without production secrets", () => {
    const result = run({
      VERCEL_ENV: "preview",
      DATABASE_URL: "",
      VITE_AUTH_ENABLED: "false",
      BETTER_AUTH_SECRET: "",
      BETTER_AUTH_URL: "",
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /checks skipped/);
  });

  it("blocks production while persistent database and real auth are missing", () => {
    const result = run({
      VERCEL_ENV: "production",
      DATABASE_URL: "",
      VITE_AUTH_ENABLED: "false",
      BETTER_AUTH_SECRET: "",
      BETTER_AUTH_URL: "",
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /DATABASE_URL/);
    assert.match(result.stderr, /VITE_AUTH_ENABLED=true/);
    assert.match(result.stderr, /BETTER_AUTH_SECRET/);
    assert.match(result.stderr, /BETTER_AUTH_URL/);
  });

  it("allows production only with a persistent DB and secure real-auth config", () => {
    const result = run({
      VERCEL_ENV: "production",
      DATABASE_URL: "postgresql://app:placeholder@db.example.invalid:5432/app",
      VITE_AUTH_ENABLED: "true",
      BETTER_AUTH_SECRET: "x".repeat(48),
      BETTER_AUTH_URL: "https://kreislauf.example.at",
      ID_AUSTRIA_MOCK_MODE: "false",
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Mindestkonfiguration/);
  });

  it("blocks production when the ID Austria mock is enabled", () => {
    const result = run({
      VERCEL_ENV: "production",
      DATABASE_URL: "postgresql://app:placeholder@db.example.invalid:5432/app",
      VITE_AUTH_ENABLED: "true",
      BETTER_AUTH_SECRET: "x".repeat(48),
      BETTER_AUTH_URL: "https://kreislauf.example.at",
      ID_AUSTRIA_MOCK_MODE: "true",
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /ID_AUSTRIA_MOCK_MODE/);
  });
});
