#!/usr/bin/env node
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE_EXTENSIONS = new Set([".js", ".mjs", ".cjs", ".json"]);
const FORBIDDEN_ASSET = /pglite|\\.wasm$|\\.data$/i;
const FORBIDDEN_SOURCE = [
  { label: "PGLite package import", pattern: /@electric-sql\\/pglite/ },
  { label: "PGLite runtime constructor", pattern: /\\bnew\\s+PGlite\\s*\\(/ },
  { label: "PGLite runtime factory", pattern: /\\bcreatePgliteSql\\b/ },
  { label: "PGLite runtime instance", pattern: /__pgliteInstance__/ },
];

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

export async function inspectNetlifyBundle(directory) {
  const root = resolve(directory);
  const files = await walk(root);
  assert.ok(files.length > 0, "Netlify Function bundle is empty: " + root);

  const violations = [];
  for (const file of files) {
    const relativePath = file.slice(root.length + 1).replaceAll("\\\\", "/");
    if (FORBIDDEN_ASSET.test(relativePath)) {
      violations.push(relativePath + ": forbidden PGLite/WASM/data asset");
      continue;
    }
    if (!SOURCE_EXTENSIONS.has(extname(file).toLowerCase())) continue;

    const source = await readFile(file, "utf8");
    for (const item of FORBIDDEN_SOURCE) {
      if (item.pattern.test(source)) violations.push(relativePath + ": " + item.label);
    }
  }

  return { filesScanned: files.length, violations };
}

async function main() {
  const directory = process.argv[2] ?? ".netlify/v1/functions/server";
  const result = await inspectNetlifyBundle(directory);
  if (result.violations.length) {
    console.error("Forbidden PGLite runtime content found in Netlify Function bundle:");
    for (const violation of result.violations) console.error("- " + violation);
    process.exitCode = 1;
    return;
  }
  console.log(
    "Netlify Function bundle check passed (" + result.filesScanned +
      " files; no PGLite runtime imports or assets).",
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
