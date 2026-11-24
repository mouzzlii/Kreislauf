import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildSafeProjectContext,
  buildSourceContext,
  decodeSourceFile,
  MAX_SOURCE_CONTEXT_CHARS,
  MAX_SOURCE_FILE_CHARS,
  selectSourcePaths,
} from "./ai-team-source-context.mjs";

test("source selection prefers coordination, security and real application entry points", () => {
  const selected = selectSourcePaths([
    ".env",
    "README.md",
    "app/src/main/java/de/trakuna/app/MainActivity.kt",
    "src/lib/db.ts",
    "docs/PROJECT-COORDINATION.md",
    ".github/AI-COLLABORATION.md",
    "src/features/kreislauf/api.ts",
    "node_modules/pkg/index.js",
    "package-lock.json",
  ]);
  assert.deepEqual(selected, [
    "docs/PROJECT-COORDINATION.md",
    ".github/AI-COLLABORATION.md",
    "src/lib/db.ts",
    "src/features/kreislauf/api.ts",
  ]);
  assert.equal(selected.some((path) => path.includes(".env")), false);
  assert.equal(selected.some((path) => path.includes("node_modules")), false);
});

test("source selection never reads files outside the fixed allowlist", () => {
  assert.deepEqual(selectSourcePaths([".env", "secrets.json", "credentials.txt", "README.md"]), []);
});

test("GitHub base64 file content is decoded safely", () => {
  const content = Buffer.from("export const safe = true;", "utf8").toString("base64");
  assert.equal(decodeSourceFile({ encoding: "base64", content }), "export const safe = true;");
  assert.equal(decodeSourceFile({ encoding: "none", content }), "");
  assert.equal(decodeSourceFile(null), "");
});

test("source excerpts are bounded per file and per repository", () => {
  const context = buildSourceContext("example/repo", [
    { path: "a.ts", content: "A".repeat(MAX_SOURCE_FILE_CHARS + 500) },
    { path: "b.ts", content: "B".repeat(MAX_SOURCE_FILE_CHARS + 500) },
    { path: "c.ts", content: "C".repeat(MAX_SOURCE_FILE_CHARS + 500) },
    { path: "d.ts", content: "D".repeat(MAX_SOURCE_FILE_CHARS + 500) },
    { path: "e.ts", content: "E".repeat(MAX_SOURCE_FILE_CHARS + 500) },
  ]);
  assert.ok(context.length <= MAX_SOURCE_CONTEXT_CHARS);
  assert.ok(context.includes("example/repo/a.ts"));
  assert.ok(context.includes("example/repo/b.ts"));
  assert.ok(context.includes("example/repo/c.ts"));
  assert.ok(context.includes("example/repo/d.ts"));
  assert.ok(!context.includes("example/repo/e.ts"));
});

test("issue and user request remain present when repository context is oversized", () => {
  const context = buildSafeProjectContext({
    project: "KREISLAUF",
    repository: "mouzzlii/Kreislauf",
    branch: "main",
    issueNumber: 42,
    issueTitle: "Important task title",
    request: "USER_REQUEST_MUST_REMAIN",
    readme: "R".repeat(20_000),
    source: "S".repeat(20_000),
    paths: ["path-a", "path-b"],
  });
  assert.ok(context.length <= 18_000);
  assert.ok(context.includes("Important task title"));
  assert.ok(context.includes("USER_REQUEST_MUST_REMAIN"));
  assert.ok(context.includes("README-Auszüge"));
});
