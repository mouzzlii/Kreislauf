/**
 * Local email/password sign-in (this app's Better Auth DB — not the broker).
 *
 * Disabled for the public demo: the current demo intentionally has no personal
 * accounts and uses the isolated demo identity. Enable only after a persistent
 * database, real auth configuration, registration UI and end-to-end tests exist.
 *
 * To enable later, set this to true and complete the production auth checklist.
 * Do NOT edit server.ts for this — it already consumes this feature flag.
 */
export const emailAndPasswordEnabled = false;
