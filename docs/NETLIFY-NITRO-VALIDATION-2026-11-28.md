# Netlify Nitro – isolated hosting validation

**Date:** 28 November 2026  
**Base commit:** `8d90ae2b540c03a316d6b9ae39051c22605f736a` (`main`)  
**Validation branch:** `infra/netlify-nitro-validation-2026-11-28`  
**Current validated code head:** `7bc40b0ee285bcbe86bcb49f66890c9ba01b9469`  
**Status:** Final branch-scoped CI run #22 passed all checks with the pinned Nitro RC and PostgreSQL fail-closed guards. No Netlify site or deployment has been created.

## Decision

Use the existing Nitro Netlify preset as the first Netlify integration, rather than adding the separate Netlify TanStack Start adapter. This is the least invasive path because KREISLAUF already registers its platform PWA middleware through Nitro's `serverDir: "./server"`.

The alternative official `@netlify/vite-plugin-tanstack-start` is suitable for TanStack Start but would replace the existing Nitro build path. Activating both adapters together would create competing server runtimes and is intentionally avoided.

## Implemented on this branch

- `npm run build:netlify` creates a Netlify-targeted build using the Nitro preset.
- The build target is isolated to the build subprocess via `KREISLAUF_DEPLOY_TARGET=netlify`. Without it, `vite.config.ts` continues to use the existing Vercel preset.
- `serverDir: "./server"` remains enabled, preserving the existing Nitro middleware registration.
- `netlify.toml` selects `dist` as the static directory and Node.js 24.
- The Netlify build wrapper runs the same `scripts/migrate.mjs` migration step as the existing production build. It fails before the build if `DATABASE_URL` is absent, unless the explicit `KREISLAUF_NETLIFY_ALLOW_DBLESS_BUILD=1` test-only override is supplied. The GitHub validation workflow supplies that override; it is not set in `netlify.toml` or the Netlify site configuration.
- `package.json` and `package-lock.json` pin `nitro@3.0.261103-rc` exactly. The older `3.0.260610-beta` generated a legacy `.netlify/functions-internal` directory; the RC produces the current Frameworks API output at `.netlify/v1/functions`.
- `vercel.json` disables automatic Vercel deployments only for this validation branch. Vercel's normal behavior on `main` and other branches is unchanged.
- The Netlify validation workflow is path-filtered to code, package, migration, PWA, and hosting configuration files, avoiding full test/build reruns for documentation-only updates.
- The existing `build` script remains unchanged. No database URL, Netlify token, OAuth secret, or other credential is committed.

## Verified CI results

GitHub Actions Run #22 validated the current implementation after a clean checkout and `npm ci`. The workflow runs only when code, package, migration, PWA, or hosting configuration paths change; docs-only updates skip the full build matrix:

| Check | Result |
|---|---|
| Clean `npm ci` from the committed RC lockfile | Passed |
| Nitro version resolved from lockfile | `3.0.261103-rc` |
| TypeScript with RC | Passed |
| Automated test suite with RC and database guards | Passed: 222 script tests + 79 TypeScript tests |
| ESLint with RC | Passed |
| Existing Vercel default build with RC (`npm run build:dev`) | Passed |
| Netlify Nitro build with RC (`npm run build:netlify`) | Passed |
| Current Frameworks API output | `.netlify/v1/functions/server/server.mjs` present |
| PWA manifest middleware in server bundle | Found |
| Generated Function request smoke test | Passed |

The Function smoke test imports the generated Netlify server module and sends real Web `Request` objects to it. It verifies:
- `/__grok/manifest.webmanifest` returns HTTP 200 with a manifest content type, standalone display, and an icon.
- `/?install=1&platform=ios` returns HTTP 200 HTML with rendered app name and URL placeholders.

This confirms the Nitro function entry point and those two PWA middleware responses. It is not a full browser-render test of SSR, OAuth, account operations, or the database.

## Important runtime requirement: PostgreSQL

The build/preview test deliberately has no `DATABASE_URL`; only the explicit CI override allows it to exercise the generated Function without a real database, and no external database migration is performed. A real Netlify site must have the existing PostgreSQL connection configured in Netlify's secure environment-variable UI with both **Builds** and **Functions** scopes, because migrations run during the build and queries run in the Function. The runtime resolver in `src/lib/db-runtime-config.mjs` uses Netlify's read-only `SITE_ID` to detect the Function environment and refuses to select PGLite if `DATABASE_URL` is missing. The build wrapper also fails before Vite starts if the build-scoped database URL is absent. Better Auth and OAuth variables must likewise be added securely with the appropriate scopes. No such values are present in Git and no Netlify environment has been configured.

The build output currently bundles PGLite fallback assets even though a deployed app should use PostgreSQL:
- PGLite database data asset: about 6.3 MB
- PGLite WASM asset: about 10.1 MB
- init database WASM asset: about 0.4 MB
- additional PGLite JavaScript bundle: about 0.7 MB

That is approximately 17.5 MB of PGLite-related assets in the generated output. The new Netlify runtime guard prevents this fallback from being used on a deployed Function, but the assets are still bundled and increase deployment size. Before a production migration, consider a Netlify-specific build that excludes the PGLite fallback from the production function bundle. This optimization must not change local development or the current Vercel preview path.

Netlify Functions currently have these default limits:
- 1024 MB memory
- 60 seconds synchronous execution
- 6 MB buffered request/response payload
- 20 MB streamed response payload

These limits matter for the planned market media feature. Photo/video binaries should not be sent through a buffered server function. The preferred design is a short-lived, authenticated upload authorization followed by a direct browser-to-object-storage upload, with only validated metadata and object references passed through the KREISLAUF Function. The object-storage provider and its costs still need a separate comparison; no bucket, token, or service has been configured.

Still to verify with a real Netlify site:
- full SSR response and streamed PWA/OG head injection in a browser
- Better Auth session, OAuth callback, secure cookies and gate identity
- Neon/PostgreSQL connection behavior under warm/cold Function invocations
- all protected Netlify runtime variables
- cold-start times, actual Function usage and object-storage upload flow

## Cost and deployment guardrails

Netlify Free is currently described as 300 monthly credits with a hard usage limit. Production deploys use 15 credits each, compute 10 credits per GB-hour, bandwidth 20 credits per GB, and web requests 2 credits per 10,000 requests. At the limit, Free sites are paused. Deploy Previews and branch deploys do not consume deploy credits. This is not an unlimited production deployment plan; repeated production releases and media traffic can consume the allowance. No paid plan has been enabled and no Netlify site, team resource, domain, DNS entry, or deployment has been created.

The first validation commits were pushed before the branch-specific Vercel suppression had been added. They caused two Vercel preview records to reach `READY` and one to end `CANCELED`; their actual billing impact is not established. After `git.deploymentEnabled=false` was added for this branch, no further Vercel deployment records were created. The branch suppression remains scoped to this test branch only.

## Protection and release status

- `main` remains at `8d90ae2b540c03a316d6b9ae39051c22605f736a`.
- Pull request #67 remains a draft and has not been merged.
- No production Vercel settings, Vercel secrets, domains, DNS, Netlify credentials, database settings, or Cloudflare resources were changed.
- No real Netlify deployment has been attempted.
- The Nitro version is a release candidate, pinned only on this validation branch. It is not being promoted to `main` until a stable release and real Netlify deployment validation are available.

## References

- [Netlify: TanStack Start deployment](https://docs.netlify.com/build/frameworks/framework-setup-guides/tanstack-start/)
- [Nitro: Netlify provider](https://nitro.build/deploy/providers/netlify)
- [Nitro: migration guide and Netlify output directories](https://nitro.build/docs/migration)
- [Netlify: credit-based pricing](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/)
- [Netlify: Functions configuration](https://docs.netlify.com/build/functions/configuration/)
- [Vercel: Git deployment configuration](https://vercel.com/docs/project-configuration/git-configuration)

---
This document records a successful isolated build and generated Function smoke test, not a completed migration or verified production deployment.
