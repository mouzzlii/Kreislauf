/**
 * Public identifier for the sandbox preview OAuth client.
 *
 * The matching client secret MUST be supplied through the protected
 * GROK_AUTH_CLIENT_SECRET runtime environment variable. No OAuth secret may
 * live in source code: repository history is public and cannot be made safe by
 * deleting a value in a later commit. If the secret was ever committed, revoke
 * and rotate it at the broker before enabling authentication.
 */
export const PREVIEW_CLIENT_ID = "grok_preview";

/** The shared auth broker issuer (OIDC discovery lives under it). */
export const GROK_ISSUER_DEFAULT = "https://auth.grok.me";

/**
 * Host patterns whose callbacks the preview client accepts. Better Auth derives
 * the live preview's real origin from the request host and validates it against
 * this list (wildcard-matched).
 */
export const PREVIEW_ALLOWED_HOSTS = ["*.grok-sandbox.com"] as const;
