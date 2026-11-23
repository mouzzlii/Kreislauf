/**
 * Public client identifier for the sandbox LIVE-PREVIEW OAuth flow.
 * The corresponding client secret is never committed. It must be supplied as
 * the protected runtime variable GROK_AUTH_CLIENT_SECRET by the broker owner.
 * Without that secret, federated sign-in remains disabled (fail closed).
 */
export const PREVIEW_CLIENT_ID = "grok_preview";

/** The shared auth broker issuer (OIDC discovery lives under it). */
export const GROK_ISSUER_DEFAULT = "https://auth.grok.me";

/**
 * Host patterns whose callbacks the preview client accepts. Better Auth derives
 * the live preview's real origin from the request host and validates it against
 * this list (wildcard-matched), so the OAuth `redirect_uri` becomes the concrete
 * `https://<preview-host>/api/auth/oauth2/callback/...` the broker allows.
 */
export const PREVIEW_ALLOWED_HOSTS = ["*.grok-sandbox.com"] as const;
