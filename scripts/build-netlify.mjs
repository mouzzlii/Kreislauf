#!/usr/bin/env node
/**
 * Build the existing Nitro/TanStack app for Netlify, then run the same
 * deploy-time database migration used by the normal Vercel build.
 *
 * The provider selection is process-local to this child environment; the
 * default Vercel build remains unchanged. No credentials are stored here.
 */
import { spawn } from "node:child_process";
import { join } from "node:path";
import { prepareNetlifyAuthMigration } from "./netlify-auth-schema.mjs";
import {
  exitStatusFromChild,
  mergeAppEnv,
  projectRoot,
  readAppEnv,
} from "./with-app-env.mjs";

const root = projectRoot();
const env = mergeAppEnv(readAppEnv(root), {
  ...process.env,
  KREISLAUF_DEPLOY_TARGET: "netlify",
});

const hasDatabaseUrl =
  typeof env.DATABASE_URL === "string" && env.DATABASE_URL.trim().length > 0;
const allowDatabaseLessBuild =
  env.KREISLAUF_NETLIFY_ALLOW_DBLESS_BUILD === "1";

if (!hasDatabaseUrl && !allowDatabaseLessBuild) {
  console.error(
    "[build:netlify] DATABASE_URL is required for a real Netlify build. " +
      "Configure it for both the Build and Functions scopes. " +
      "The database-less override is reserved for isolated CI validation.",
  );
  process.exit(1);
}
const viteCli = join(root, "node_modules", "vite", "bin", "vite.js");
const migrationScript = join(root, "scripts", "migrate.mjs");

function runNode(args, label) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, args, {
      cwd: root,
      env,
      stdio: "inherit",
    });

    child.once("error", (error) => {
      console.error(`[build:netlify] Could not start ${label}:`, error.message);
      resolve(127);
    });

    child.once("exit", (code, signal) => {
      resolve(exitStatusFromChild(code, signal));
    });
  });
}

let cleanupAuthMigration = async () => {};

try {
  const authEnabled = env.VITE_AUTH_ENABLED !== "false";
  const preparedAuthMigration = await prepareNetlifyAuthMigration(root, authEnabled);
  cleanupAuthMigration = preparedAuthMigration.cleanup;
  if (preparedAuthMigration.created) {
    console.log("[build:netlify] Prepared temporary Better Auth schema migration.");
  }

  const buildStatus = await runNode([viteCli, "build"], "Vite");
  if (buildStatus !== 0) {
    process.exitCode = buildStatus;
  } else {
    process.exitCode = await runNode([migrationScript], "database migrations");
  }
} finally {
  try {
    await cleanupAuthMigration();
  } catch (error) {
    console.error("[build:netlify] Could not clean up temporary auth migration:", error);
    process.exitCode = 1;
  }
}
