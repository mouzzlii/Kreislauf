import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { ensurePgliteRoles } from "./db-roles.ts";

test("fresh PGlite demo database creates all Supabase compatibility roles", async () => {
  const pg = new PGlite();
  try {
    await pg.waitReady;
    await ensurePgliteRoles(pg);
    await ensurePgliteRoles(pg);
    const result = await pg.query<{ rolname: string }>(
      "select rolname from pg_roles where rolname in ('anon', 'authenticated', 'service_role') order by rolname",
    );
    assert.deepEqual(result.rows.map((row) => row.rolname), ["anon", "authenticated", "service_role"]);
    const migration = await readFile(new URL("../../migrations/0010_lock_down_default_privileges.sql", import.meta.url), "utf8");
    await pg.exec(migration);
  } finally {
    await pg.close();
  }
});
