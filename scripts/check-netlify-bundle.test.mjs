import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { inspectNetlifyBundle } from "./check-netlify-bundle.mjs";

async function withBundle(run) {
  const root = await mkdtemp(join(tmpdir(), "kreislauf-netlify-bundle-"));
  try {
    await mkdir(join(root, "_ssr"), { recursive: true });
    await run(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test("bundle checker allows PostgreSQL runtime and PGLite explanatory comments", async () => {
  await withBundle(async (root) => {
    await writeFile(
      join(root, "server.mjs"),
      'const db = "postgres"; // Local development may use PGLite, but not this bundle.',
    );
    const result = await inspectNetlifyBundle(root);
    assert.deepEqual(result.violations, []);
    assert.equal(result.filesScanned, 1);
  });
});

test("bundle checker rejects a PGLite package import", async () => {
  await withBundle(async (root) => {
    await writeFile(
      join(root, "_ssr", "db.mjs"),
      'const db = await import("@electric-sql/pglite");',
    );
    const result = await inspectNetlifyBundle(root);
    assert.match(result.violations.join("\n"), /PGLite package import/);
  });
});

test("bundle checker rejects PGLite runtime construction", async () => {
  await withBundle(async (root) => {
    await writeFile(join(root, "db.mjs"), "const db = new PGlite();");
    const result = await inspectNetlifyBundle(root);
    assert.match(result.violations.join("\n"), /PGLite runtime constructor/);
  });
});

test("bundle checker rejects PGLite/WASM/data assets", async () => {
  await withBundle(async (root) => {
    await writeFile(join(root, "pglite.data"), "data");
    await writeFile(join(root, "initdb.wasm"), "wasm");
    const result = await inspectNetlifyBundle(root);
    assert.equal(result.violations.length, 2);
    assert.match(result.violations.join("\n"), /pglite\.data/);
    assert.match(result.violations.join("\n"), /initdb\.wasm/);
  });
});
