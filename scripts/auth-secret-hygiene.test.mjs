import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const previewPath = new URL("../src/lib/auth/preview.ts", import.meta.url);
const serverPath = new URL("../src/lib/auth/server.ts", import.meta.url);
const emailPasswordPath = new URL("../src/lib/auth/email-password.ts", import.meta.url);

test("preview OAuth client secret is never stored in source", async () => {
  const preview = await readFile(previewPath, "utf8");
  assert.doesNotMatch(preview, /PREVIEW_CLIENT_SECRET/);
  assert.doesNotMatch(preview, /clientSecret\s*[:=]\s*["'`]/);
});

test("OAuth federation requires a protected runtime secret", async () => {
  const server = await readFile(serverPath, "utf8");
  assert.match(server, /env\(["']GROK_AUTH_CLIENT_SECRET["']\)/);
  assert.doesNotMatch(server, /PREVIEW_CLIENT_SECRET/);
  assert.match(server, /Boolean\(grokClientId\s*&&\s*grokClientSecret\)/);
  assert.match(server, /const grokOAuthPlugin = authConfigured/);
});

test("personal email/password accounts remain disabled in the demo", async () => {
  const config = await readFile(emailPasswordPath, "utf8");
  assert.match(config, /export const emailAndPasswordEnabled = false;/);
});
