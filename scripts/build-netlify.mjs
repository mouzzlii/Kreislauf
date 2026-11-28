#!/usr/bin/env node
/**
 * Build the existing Nitro/TanStack app for Netlify without running database
 * migrations. The normal "build" script remains the Vercel production build.
 */
import { spawn } from "node:child_process";
import { join } from "node:path";
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
const viteCli = join(root, "node_modules", "vite", "bin", "vite.js");

const child = spawn(process.execPath, [viteCli, "build"], {
  cwd: root,
  env,
  stdio: "inherit",
});

child.on("error", (error) => {
  console.error("[build:netlify] Could not start Vite:", error.message);
  process.exit(127);
});

child.on("exit", (code, signal) => {
  process.exit(exitStatusFromChild(code, signal));
});
