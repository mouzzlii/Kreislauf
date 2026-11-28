import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveDatabaseConfig } from "../src/lib/db-runtime-config.mjs";

test("local development keeps the PGLite fallback when DATABASE_URL is absent", () => {
  assert.deepEqual(resolveDatabaseConfig({}), {
    databaseUrl: undefined,
    dbSource: "pglite",
  });
});

test("blank DATABASE_URL is treated as unset locally", () => {
  assert.deepEqual(resolveDatabaseConfig({ DATABASE_URL: "   " }), {
    databaseUrl: undefined,
    dbSource: "pglite",
  });
});

test("Netlify Functions require DATABASE_URL instead of using ephemeral PGLite", () => {
  assert.throws(
    () => resolveDatabaseConfig({ SITE_ID: "site-123" }),
    /DATABASE_URL is required in Netlify Functions/,
  );
});

test("Netlify Functions reject whitespace-only DATABASE_URL", () => {
  assert.throws(
    () => resolveDatabaseConfig({ SITE_ID: "site-123", DATABASE_URL: "  " }),
    /DATABASE_URL is required in Netlify Functions/,
  );
});

test("Netlify Functions use PostgreSQL when DATABASE_URL is available", () => {
  assert.deepEqual(
    resolveDatabaseConfig({
      SITE_ID: "site-123",
      DATABASE_URL: "postgresql://db.example.test/app",
    }),
    {
      databaseUrl: "postgresql://db.example.test/app",
      dbSource: "neon",
    },
  );
});
