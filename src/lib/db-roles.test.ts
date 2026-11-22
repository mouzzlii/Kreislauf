import test from "node:test";
import assert from "node:assert/strict";
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
    await pg.exec("alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated, service_role");
  } finally {
    await pg.close();
  }
});
