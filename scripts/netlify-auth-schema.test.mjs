import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { prepareNetlifyAuthMigration } from "./netlify-auth-schema.mjs";

async function withMigrations(run) {
  const root = await mkdtemp(join(tmpdir(), "kreislauf-netlify-auth-"));
  const source = join(root, "migrations", "auth", "0001_auth.sql");
  const target = join(root, "migrations", "0001_auth.sql");
  await mkdir(join(root, "migrations", "auth"), { recursive: true });
  await writeFile(source, "create table auth_users (id text primary key);\n");
  try {
    await run({ root, source, target });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test("auth-disabled Netlify build does not create an auth migration copy", async () => {
  await withMigrations(async ({ root, target }) => {
    const prepared = await prepareNetlifyAuthMigration(root, false);
    assert.equal(prepared.created, false);
    await assert.rejects(readFile(target, "utf8"), { code: "ENOENT" });
    await prepared.cleanup();
  });
});

test("auth-enabled Netlify build creates a byte-identical temporary root migration", async () => {
  await withMigrations(async ({ root, source, target }) => {
    const prepared = await prepareNetlifyAuthMigration(root, true);
    assert.equal(prepared.created, true);
    assert.equal(await readFile(target, "utf8"), await readFile(source, "utf8"));
    await prepared.cleanup();
    await assert.rejects(readFile(target, "utf8"), { code: "ENOENT" });
  });
});

test("an existing identical auth migration is preserved", async () => {
  await withMigrations(async ({ root, source, target }) => {
    await writeFile(target, await readFile(source, "utf8"));
    const prepared = await prepareNetlifyAuthMigration(root, true);
    assert.equal(prepared.created, false);
    await prepared.cleanup();
    assert.equal(await readFile(target, "utf8"), await readFile(source, "utf8"));
  });
});

test("a divergent auth migration fails closed", async () => {
  await withMigrations(async ({ root, target }) => {
    await writeFile(target, "create table auth_users (id integer primary key);\n");
    await assert.rejects(
      prepareNetlifyAuthMigration(root, true),
      /differs from migrations\/auth\/0001_auth\.sql/,
    );
  });
});

test("a missing auth schema source fails closed", async () => {
  await withMigrations(async ({ root, source }) => {
    await rm(source);
    await assert.rejects(prepareNetlifyAuthMigration(root, true), { code: "ENOENT" });
  });
});
