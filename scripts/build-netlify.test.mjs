import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

test("Netlify build fails closed when DATABASE_URL is missing", () => {
  const result = spawnSync(
    process.execPath,
    [new URL("./build-netlify.mjs", import.meta.url).pathname],
    {
      cwd: new URL("..", import.meta.url),
      encoding: "utf8",
      env: {
        ...process.env,
        DATABASE_URL: "   ",
        KREISLAUF_NETLIFY_ALLOW_DBLESS_BUILD: "",
      },
    },
  );

  assert.equal(result.error, undefined);
  assert.equal(result.signal, null);
  assert.equal(result.status, 1);
  assert.match(
    `${result.stdout ?? ""}${result.stderr ?? ""}`,
    /DATABASE_URL is required for a real Netlify build/,
  );
});
