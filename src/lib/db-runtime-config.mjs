/**
 * Resolve the SQL backend from the server runtime environment.
 *
 * Local development and gated previews may use in-memory PGLite when no
 * DATABASE_URL is configured. A Netlify Function must use PostgreSQL: SITE_ID
 * is one of Netlify's read-only variables available in the function runtime.
 *
 * @typedef {"neon" | "pglite"} DbSource
 *
 * @param {Record<string, string | undefined>} runtimeEnv
 * @returns {{ databaseUrl: string | undefined, dbSource: DbSource }}
 */
export function resolveDatabaseConfig(runtimeEnv) {
  const rawDatabaseUrl = runtimeEnv.DATABASE_URL;
  const databaseUrl =
    typeof rawDatabaseUrl === "string" && rawDatabaseUrl.trim()
      ? rawDatabaseUrl
      : undefined;
  const isNetlifyRuntime =
    typeof runtimeEnv.SITE_ID === "string" && runtimeEnv.SITE_ID.trim().length > 0;

  if (isNetlifyRuntime && !databaseUrl) {
    throw new Error(
      "[db] DATABASE_URL is required in Netlify Functions. " +
        "Refusing to use ephemeral PGLite for persistent application data.",
    );
  }

  return {
    databaseUrl,
    dbSource: databaseUrl ? "neon" : "pglite",
  };
}
