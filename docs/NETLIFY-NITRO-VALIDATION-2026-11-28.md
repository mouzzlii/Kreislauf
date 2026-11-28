# Netlify Nitro – isolated hosting validation

**Date:** 28 November 2026  
**Base commit:** `8d90ae2b540c03a316d6b9ae39051c22605f736a` (`main`)  
**Validation branch:** `infra/netlify-nitro-validation-2026-11-28`  
**Current validated implementation:** `6425ea40849d5ca7118eaa743647c4b5324b867d` (docs-only updates may advance the branch head)  
**Status:** Branch-scoped CI run #40 passed all checks, including auth-schema migration handling, auth-enabled SSR-shell smoke testing and source-level PGLite bundle scanning. No Netlify site or deployment has been created.

## Decision

Use the existing Nitro Netlify preset as the first Netlify integration, rather than adding the separate Netlify TanStack Start adapter. This is the least invasive path because KREISLAUF already registers its platform PWA middleware through Nitro's `serverDir: "./server"`.

The alternative official `@netlify/vite-plugin-tanstack-start` is suitable for TanStack Start but would replace the existing Nitro build path. Activating both adapters together would create competing server runtimes and is intentionally avoided.

## Implemented on this branch

- `npm run build:netlify` creates a Netlify-targeted build using the Nitro preset.
- The build target is isolated to the build subprocess via `KREISLAUF_DEPLOY_TARGET=netlify`. Without it, `vite.config.ts` continues to use the existing Vercel preset.
- `vite.config.ts` sets the compile-time flag `__KREISLAUF_NETLIFY_BUILD__` only for this target. The declaration is isolated in `src/lib/deploy-flags.d.ts`.
- `serverDir: "./server"` remains enabled, preserving the existing Nitro middleware registration.
- `netlify.toml` selects `dist` as the static directory and Node.js 24.
- The Netlify build wrapper runs the same `scripts/migrate.mjs` migration step as the existing production build. It requires a valid build-scoped `DATABASE_URL`; only the isolated CI uses the explicit `KREISLAUF_NETLIFY_ALLOW_DBLESS_BUILD=1` override.
- `package.json` and `package-lock.json` pin `nitro@3.0.261103-rc` exactly. The older `3.0.260610-beta` generated a legacy `.netlify/functions-internal` directory; the RC produces the current Frameworks API output at `.netlify/v1/functions`.
- `src/lib/db.ts` and `src/lib/auth/server.ts` compile to PostgreSQL-only paths for Netlify, allowing Rollup to eliminate the unused PGLite fallback from the production Function.
- The central database resolver uses Netlify's read-only `SITE_ID` at runtime and refuses the PGLite fallback if `DATABASE_URL` is absent.
- `vercel.json` disables automatic Vercel deployments only for this validation branch. Vercel's normal behavior on `main` and other branches is unchanged.
- The Netlify validation workflow is path-filtered to code, package, migration, PWA, and hosting configuration files, avoiding full test/build reruns for documentation-only updates.
- The existing `build` script remains unchanged. No database URL, Netlify token, OAuth secret, or other credential is committed.
- Nitro v3 is still labelled a release candidate; the stable Nitro line remains v2. The RC is therefore restricted to this isolated validation branch and must not be promoted to production before a stable v3 release or an explicit migration decision.

## Verified CI results

GitHub Actions Run #40 validated the current implementation after a clean checkout and `npm ci`. The workflow runs only when code, package, migration, PWA, or hosting configuration paths change; docs-only updates skip the full build matrix:

| Check | Result |
|---|---|
| Clean `npm ci` from the committed RC lockfile | Passed |
| Nitro version resolved from lockfile | `3.0.261103-rc` |
| TypeScript with RC | Passed |
| Automated test suite with RC and database guards and bundle scanner | Passed: 231 script tests + 79 TypeScript tests |
| ESLint with RC | Passed |
| Existing Vercel default build with RC (`npm run build:dev`) | Passed |
| Netlify Nitro build with RC (`npm run build:netlify`) | Passed |
| Current Frameworks API output | `.netlify/v1/functions/server/server.mjs` present |
| PWA manifest middleware in server bundle | Found |
| PGLite runtime imports, constructors, factories, instance globals, WASM and `.data` assets | None found across 65 Function files; source-level CI scanner passed |
| Generated Function request smoke test | Passed: auth-enabled login SSR shell, PWA manifest and iOS install page |

The Function smoke test imports the generated Netlify server module and sends real Web `Request` objects to it. For the isolated Netlify build only, CI sets `VITE_AUTH_ENABLED=true` so the login route renders rather than taking the local development-user redirect. It verifies:
- `/login` returns HTTP 200 and server-renders the auth-enabled application shell.
- `/__grok/manifest.webmanifest` returns HTTP 200 with a manifest content type, standalone display, and an icon.
- `/?install=1&platform=ios` returns HTTP 200 HTML with rendered app name and URL placeholders.

This confirms the Nitro function entry point, a basic auth-enabled SSR shell, and the two PWA middleware responses. It is not a full browser-render test of interactive auth, OAuth callbacks, account operations, or database-backed market SSR.

## Important runtime requirement: PostgreSQL

The build/preview test deliberately has no `DATABASE_URL`; only the explicit CI override allows it to exercise the generated Function without a real database, and no external database migration is performed. CI sets `VITE_AUTH_ENABLED=true` only for the Netlify build so the login route exercises the SSR shell; no Better Auth/OAuth secrets or real user session are supplied. A real Netlify site must have `DATABASE_URL` configured through Netlify's secure UI, CLI or API because migrations run during the build and queries run in the Function. On the Free plan, variables are available to all scopes by default (including Builds and Functions); explicit scope selection is a Pro/Enterprise feature. **Important Free-plan limitation:** the current pricing comparison does not include environment-variable scoping per deploy context on Free or Personal. Therefore do not rely on one Free site having a different secret `DATABASE_URL` for Production and Deploy Previews. Safest zero-cost setup: disable Deploy Previews and branch deploys on the production site and use GitHub CI for PR validation. If a live preview is required, use a separate staging site with its own site-level `DATABASE_URL` and a separate Neon branch; verify the account's site allowance first, and remember both sites share the team's 300-credit monthly cap. Never put credentials in `netlify.toml`. For public-repository fork previews, configure Netlify's untrusted-deploy policy to build without sensitive variables; this build intentionally fails closed when no safe preview database URL is available. The runtime resolver in `src/lib/db-runtime-config.mjs` uses Netlify's read-only `SITE_ID` to detect the Function environment and refuses to select PGLite if `DATABASE_URL` is missing. The build wrapper also fails before Vite starts if the build-scoped database URL is absent. Better Auth and OAuth variables must likewise be added securely. No such values are present in Git and no Netlify environment has been configured. See [Netlify environment-variable scopes and contexts](https://docs.netlify.com/build/environment-variables/overview/), [Netlify pricing and plan limits](https://www.netlify.com/pricing/), and [untrusted deploys](https://docs.netlify.com/build/environment-variables/get-started/).

When `VITE_AUTH_ENABLED` is not `false`, the Netlify build temporarily copies `migrations/auth/0001_auth.sql` to the root `migrations/` directory so the existing non-recursive migrator applies the Better Auth schema. The helper verifies byte identity, fails closed on drift, preserves an existing identical user-managed copy, and removes only a copy it created. CI confirms the temporary root file is absent after the build/migration step.

The final Netlify Function build no longer contains PGLite-related runtime code or assets. The compile-time target flag ensures the PostgreSQL-only database and Better Auth branches are selected for Netlify, and CI scans all generated Function files for PGLite package imports, runtime constructors/factories/instances and forbidden PGLite/WASM/data assets. The auth-enabled login SSR shell and PWA endpoints also pass direct Function smoke tests. This was confirmed by GitHub Actions Run #40. The existing PGLite fallback remains available for local development and the existing Vercel build path; the compile-time flag is false for those builds.

Netlify Functions currently have these default limits:
- 1024 MB memory
- 60 seconds synchronous execution
- 6 MB buffered request/response payload; binary uploads are Base64-encoded and effectively limited to about 4.5 MB
- 20 MB streamed response payload

These limits matter for the planned market media feature. Photo/video binaries should not be sent through a buffered server function. Because Base64 encoding reduces the practical binary request limit to about 4.5 MB, the preferred design is a short-lived, authenticated upload authorization followed by a direct browser-to-object-storage upload, with only validated metadata and object references passed through the KREISLAUF Function. See [Netlify Function payload limits](https://docs.netlify.com/build/functions/configuration/). The object-storage provider and its costs still need a separate comparison; no bucket, token, or service has been configured.

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
- [Nitro v3 release-candidate announcement](https://nitro.build/blog/v3-rc)
- [Nitro v3 package status on npm](https://www.npmjs.com/package/nitro)
- [Netlify: credit-based pricing](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/)
- [Netlify: Functions configuration](https://docs.netlify.com/build/functions/configuration/)
- [Vercel: Git deployment configuration](https://vercel.com/docs/project-configuration/git-configuration)

---
This document records a successful isolated build, generated Function smoke test, database fail-closed checks, temporary Better Auth schema handling, and PGLite-free Netlify bundle. It is not a completed migration or verified production deployment.
