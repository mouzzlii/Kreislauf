import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../src/lib/auth/", import.meta.url);

test("the live-preview OAuth client secret is never embedded in source", async () => {
  const [preview, server] = await Promise.all([
    readFile(new URL("preview.ts", root), "utf8"),
    readFile(new URL("server.ts", root), "utf8"),
  ]);

  assert.match(preview, /export const PREVIEW_CLIENT_ID = "grok_preview"/);
  assert.doesNotMatch(preview, /PREVIEW_CLIENT_SECRET|GROK_PREVIEW_CLIENT_SECRET|[a-f0-9]{64}/i);
  assert.match(server, /const grokClientSecret = env\("GROK_AUTH_CLIENT_SECRET"\);/);
  assert.doesNotMatch(server, /PREVIEW_CLIENT_SECRET|[a-f0-9]{64}/i);
});
