import { copyFile, mkdir, readdir, stat } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";

const root = process.cwd();
const require = createRequire(import.meta.url);
const entry = require.resolve("@electric-sql/pglite");
const packageDir = dirname(entry);
const candidates = [join(packageDir, "release"), packageDir];
let releaseDir;

for (const candidate of candidates) {
  try {
    await stat(join(candidate, "pglite.data"));
    releaseDir = candidate;
    break;
  } catch {
    // Try the next package layout.
  }
}

if (!releaseDir) {
  throw new Error("PGlite runtime payload not found (expected pglite.data beside the package release files).");
}

const assetNames = ["pglite.data", "pglite.wasm", "initdb.wasm"];
for (const name of assetNames) {
  await stat(join(releaseDir, name));
}

const functionsDir = resolve(root, ".vercel/output/functions");
const functionEntries = await readdir(functionsDir, { withFileTypes: true });
const targets = [];

for (const entry of functionEntries) {
  if (!entry.isDirectory() || !entry.name.endsWith(".func")) continue;
  const libsDir = join(functionsDir, entry.name, "_libs");
  try {
    await stat(join(libsDir, "electric-sql__pglite.mjs"));
    targets.push(libsDir);
  } catch {
    // This function does not bundle PGlite.
  }
}

if (targets.length === 0) {
  throw new Error("Could not find the Vercel function _libs directory containing electric-sql__pglite.mjs.");
}

for (const target of targets) {
  await mkdir(target, { recursive: true });
  for (const name of assetNames) {
    await copyFile(join(releaseDir, name), join(target, name));
  }
  console.log(`[pglite-assets] Copied runtime payload to ${target}`);
}
