type RoleDatabase = {
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<{ rows: T[] }>;
  exec(text: string): Promise<unknown>;
};

/**
 * Supabase migrations reference platform roles even in the local PGlite
 * preview. Real Supabase provides these roles; a fresh PGlite instance does not.
 */
export async function ensurePgliteRoles(pg: RoleDatabase): Promise<void> {
  const roles = ["anon", "authenticated", "service_role"] as const;
  for (const role of roles) {
    const existing = await pg.query<{ rolname: string }>(
      "select rolname from pg_roles where rolname = $1",
      [role],
    );
    if (existing.rows.length === 0) {
      await pg.exec("create role " + role + " nologin");
    }
  }
}
