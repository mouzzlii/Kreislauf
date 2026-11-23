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

const validProduction = {
  VERCEL_ENV: "production",
  DATABASE_URL: "postgresql://app:placeholder@db.example.invalid:5432/app",
  VITE_AUTH_ENABLED: "true",
  BETTER_AUTH_SECRET: "x".repeat(48),
  BETTER_AUTH_URL: "https://kreislauf.example.at",
  GROK_AUTH_ISSUER: "https://auth.example.at",
  GROK_AUTH_CLIENT_ID: "kreislauf-production",
  GROK_AUTH_CLIENT_SECRET: "y".repeat(48),
  GROK_AUTH_SECRET_ROTATION_CONFIRMED: "true",
  BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_placeholder",
  ID_AUSTRIA_MOCK_MODE: "false",
  KREISLAUF_MEDIA_STORAGE_READY: "true",
  ID_AUSTRIA_PROVIDER_READY: "true",
};

describe("production release guard", () => {
  it("keeps preview builds available without production secrets", () => {
    const result = run({
      VERCEL_ENV: "preview",
      DATABASE_URL: "",
      VITE_AUTH_ENABLED: "false",
      BETTER_AUTH_SECRET: "",
      BETTER_AUTH_URL: "",
      GROK_AUTH_ISSUER: "",
      GROK_AUTH_CLIENT_ID: "",
      GROK_AUTH_CLIENT_SECRET: "",
      GROK_AUTH_SECRET_ROTATION_CONFIRMED: "false",
      BLOB_READ_WRITE_TOKEN: "",
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /checks skipped/);
  });

  it("blocks production while database, auth, broker client and media storage are missing", () => {
    const result = run({
      ...validProduction,
      DATABASE_URL: "",
      VITE_AUTH_ENABLED: "false",
      BETTER_AUTH_SECRET: "",
      BETTER_AUTH_URL: "",
      GROK_AUTH_ISSUER: "",
      GROK_AUTH_CLIENT_ID: "",
      GROK_AUTH_CLIENT_SECRET: "",
      GROK_AUTH_SECRET_ROTATION_CONFIRMED: "false",
      BLOB_READ_WRITE_TOKEN: "",
      KREISLAUF_MEDIA_STORAGE_READY: "false",
      ID_AUSTRIA_PROVIDER_READY: "false",
    });
    assert.equal(result.status, 1);
    for (const variable of ["DATABASE_URL", "VITE_AUTH_ENABLED=true", "BETTER_AUTH_SECRET", "BETTER_AUTH_URL", "GROK_AUTH_ISSUER", "GROK_AUTH_CLIENT_ID", "GROK_AUTH_CLIENT_SECRET", "GROK_AUTH_SECRET_ROTATION_CONFIRMED", "BLOB_READ_WRITE_TOKEN", "KREISLAUF_MEDIA_STORAGE_READY", "ID_AUSTRIA_PROVIDER_READY"]) {
      assert.match(result.stderr, new RegExp(variable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
  });

  it("rejects a non-PostgreSQL database URL", () => {
    const result = run({ ...validProduction, DATABASE_URL: "https://db.example.invalid" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /DATABASE_URL/);
  });

  it("rejects missing production-specific OAuth broker credentials", () => {
    const result = run({
      ...validProduction,
      GROK_AUTH_ISSUER: "",
      GROK_AUTH_CLIENT_ID: "",
      GROK_AUTH_CLIENT_SECRET: "",
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /GROK_AUTH_ISSUER/);
    assert.match(result.stderr, /GROK_AUTH_CLIENT_ID/);
    assert.match(result.stderr, /GROK_AUTH_CLIENT_SECRET/);
  });

  it("blocks production until the historical preview OAuth secret rotation is explicitly confirmed", () => {
    const result = run({ ...validProduction, GROK_AUTH_SECRET_ROTATION_CONFIRMED: "false" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /GROK_AUTH_SECRET_ROTATION_CONFIRMED/);
  });

  it("rejects an insecure OAuth broker URL", () => {
    const result = run({ ...validProduction, GROK_AUTH_ISSUER: "http://auth.example.at" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /GROK_AUTH_ISSUER/);
  });

  it("allows production only with PostgreSQL, dedicated auth broker and media storage", () => {
    const result = run(validProduction);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /eigene OAuth-Anmeldung/);
  });

  it("blocks production until real media storage and ID Austria integrations are verified", () => {
    const result = run({
      ...validProduction,
      KREISLAUF_MEDIA_STORAGE_READY: "false",
      ID_AUSTRIA_PROVIDER_READY: "false",
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /KREISLAUF_MEDIA_STORAGE_READY/);
    assert.match(result.stderr, /ID_AUSTRIA_PROVIDER_READY/);
  });

  it("blocks production when the ID Austria mock is enabled", () => {
    const result = run({ ...validProduction, ID_AUSTRIA_MOCK_MODE: "true" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /ID_AUSTRIA_MOCK_MODE/);
  });
});
