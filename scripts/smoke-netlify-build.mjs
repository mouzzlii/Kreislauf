#!/usr/bin/env node
/**
 * Exercise the generated Nitro Netlify function directly with Web Requests.
 * Supports both the legacy Nitro output directory and the current Frameworks
 * API directory. This intentionally covers PWA middleware responses that do
 * not need a database or external credentials.
 */
import assert from "node:assert/strict";
import { existsSync } from "node:fs";

const entrypoints = [
  new URL("../.netlify/v1/functions/server/server.mjs", import.meta.url),
  new URL("../.netlify/functions-internal/server/server.mjs", import.meta.url),
];
const entrypoint = entrypoints.find((candidate) => existsSync(candidate));

assert.ok(entrypoint, "Netlify's generated server entrypoint must exist");
const { default: handler } = await import(entrypoint.href);

assert.equal(
  typeof handler,
  "function",
  "Netlify's generated server entrypoint must export a request handler",
);

const host = "kreislauf-netlify-smoke.test";

const manifestResponse = await handler(
  new Request(`https://${host}/__grok/manifest.webmanifest`, {
    method: "GET",
    headers: { accept: "application/manifest+json" },
  }),
);

assert.equal(manifestResponse.status, 200, "manifest route must return HTTP 200");
assert.match(
  manifestResponse.headers.get("content-type") ?? "",
  /application\/manifest\+json/i,
  "manifest route must return the web manifest content type",
);

const manifest = await manifestResponse.json();
assert.equal(manifest.display, "standalone", "manifest must enable standalone display");
assert.ok(Array.isArray(manifest.icons) && manifest.icons.length > 0, "manifest must declare an app icon");

const installResponse = await handler(
  new Request(`https://${host}/?install=1&platform=ios`, {
    method: "GET",
    headers: { accept: "text/html" },
  }),
);

assert.equal(installResponse.status, 200, "iOS install tutorial must return HTTP 200");
assert.match(
  installResponse.headers.get("content-type") ?? "",
  /text\/html/i,
  "iOS install tutorial must return HTML",
);

const installHtml = await installResponse.text();
assert.match(installHtml, /Add Grok App to your Home Screen/);
assert.doesNotMatch(installHtml, /\{\{APP_(?:NAME|URL)\}\}/, "install template placeholders must be rendered");

console.log(`Netlify function request smoke test passed (${entrypoint.pathname}): manifest + iOS install page.`);
