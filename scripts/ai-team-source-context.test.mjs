import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildSafeProjectContext,
  buildSourceContext,
  hasNonEmptySourceExcerpt,
  decodeSourceFile,
  hasUsablePrimaryContext,
  resolveProjectBranch,
  MAX_SOURCE_CONTEXT_CHARS,
  MAX_SOURCE_FILE_CHARS,
  selectSourcePaths,
  redactSensitiveText,
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

test("KI-Arbeitsplatz selects only its bounded roadmap and offline worker sources", () => {
  const selected = selectSourcePaths([
    "MASTERWERK-ROADMAP.md",
    "Offline-Modus/Lib/Common.ps1",
    "Offline-Modus/Lib/LocalAI.ps1",
    "Offline-Modus/Worker.ps1",
    ".env",
    "Council/BUDGET-APPROVAL.json",
  ], undefined, "KI-ARBEITSPLATZ");
  assert.deepEqual(selected, [
    "MASTERWERK-ROADMAP.md",
    "Offline-Modus/Lib/Common.ps1",
    "Offline-Modus/Lib/LocalAI.ps1",
    "Offline-Modus/Worker.ps1",
  ]);
  assert.equal(selected.length, 4);
});

test("portfolio project allowlists take priority over generic shared paths", () => {
  const inseratPaths = [
    "public/sw.js", "package.json",
    "src/app/studio.tsx", "src/app/api/ai/analyze/route.ts",
    "src/app/api/ai/status/route.ts", "src/lib/listing-core.js",
  ];
  assert.deepEqual(selectSourcePaths(inseratPaths), [
    "src/app/studio.tsx", "src/app/api/ai/analyze/route.ts",
    "src/app/api/ai/status/route.ts", "src/lib/listing-core.js",
  ]);

  const bookYourCookPaths = [
    "package.json", "src/lib/db.ts",
    "book-your-cook-produkt/README-DE.md",
    "book-your-cook-produkt/docs/TAX-PRICE-MODELL-UND-FREIGABE.md",
    "book-your-cook-produkt/supabase/functions/_shared/pricing.js",
    "book-your-cook-produkt/supabase/functions/stripe-webhook/index.ts",
  ];
  assert.deepEqual(selectSourcePaths(bookYourCookPaths), [
    "book-your-cook-produkt/README-DE.md",
    "book-your-cook-produkt/docs/TAX-PRICE-MODELL-UND-FREIGABE.md",
    "book-your-cook-produkt/supabase/functions/_shared/pricing.js",
    "book-your-cook-produkt/supabase/functions/stripe-webhook/index.ts",
  ]);

  assert.deepEqual(selectSourcePaths([
    "package.json", "public/app.js", "Quiz_Neu_verbessert.html", "scripts/check-quiz.mjs",
  ]), ["Quiz_Neu_verbessert.html", "scripts/check-quiz.mjs", "public/app.js", "package.json"]);
});


test("KI-Arbeitsplatz prefers its roadmap and offline worker sources", () => {
  const paths = [
    "docs/PROJECT-COORDINATION.md",
    ".github/AI-COLLABORATION.md",
    "AI_TEAM_SETUP.md",
    "src/lib/db.ts",
    "MASTERWERK-ROADMAP.md",
    "Offline-Modus/Lib/Common.ps1",
    "Offline-Modus/Lib/LocalAI.ps1",
    "Offline-Modus/Worker.ps1",
  ];
  assert.deepEqual(
    selectSourcePaths(paths, undefined, "KI-ARBEITSPLATZ"),
    [
      "MASTERWERK-ROADMAP.md",
      "Offline-Modus/Lib/Common.ps1",
      "Offline-Modus/Lib/LocalAI.ps1",
      "Offline-Modus/Worker.ps1",
    ],
  );
});

test("project branch override is validated and defaults to the repository branch", () => {
  assert.equal(resolveProjectBranch("main", ""), "main");
  assert.equal(resolveProjectBranch("main", "release/offline-masterwerk-v0.2.1"), "release/offline-masterwerk-v0.2.1");
  assert.throws(() => resolveProjectBranch("main", "../main"), /Unsafe project branch/);
  assert.throws(() => resolveProjectBranch("main", "bad branch"), /Unsafe project branch/);
  assert.throws(() => resolveProjectBranch("main", "release//main"), /Unsafe project branch/);
});

test("primary repository must itself provide a real source excerpt before Council calls", () => {
  const valid = {
    repository: "mouzzlii/KI-Arbeitsplatz",
    branch: "release/offline-masterwerk-v0.2.1",
    repositories: [{
      repository: "mouzzlii/KI-Arbeitsplatz",
      branch: "release/offline-masterwerk-v0.2.1",
      hasSourceExcerpt: true,
    }],
    source: "#### Offline-Modus/Lib/LocalAI.ps1\\nfunction Test-Example { return $true }",
  };
  assert.equal(hasUsablePrimaryContext(valid), true);

  const secondaryOnly = {
    ...valid,
    repositories: [
      { repository: "mouzzlii/KI-Arbeitsplatz", branch: "main", hasSourceExcerpt: false },
      { repository: "mouzzlii/Fuck", branch: "main", hasSourceExcerpt: true },
    ],
    // Secondary Android source may remain in the prompt but cannot satisfy
    // the canonical gateway repository's own source prerequisite.
    source: "#### mouzzlii/Fuck/app/src/main/java/MainActivity.kt\\nclass MainActivity",
  };
  assert.equal(hasUsablePrimaryContext(secondaryOnly), false);
  assert.equal(hasUsablePrimaryContext({
    ...valid,
    repositories: [{ repository: "mouzzlii/KI-Arbeitsplatz", branch: "main", hasSourceExcerpt: false }],
  }), false);
  assert.equal(hasUsablePrimaryContext({
    ...valid,
    repositories: [{ repository: "mouzzlii/KI-Arbeitsplatz", branch: "", hasSourceExcerpt: true }],
  }), false);
  assert.equal(hasUsablePrimaryContext({
    ...valid,
    repositories: [{ repository: "mouzzlii/Kreislauf", branch: "main", hasSourceExcerpt: true }],
  }), false);
  assert.equal(hasUsablePrimaryContext({ ...valid, repository: "" }), false);
});

test("source excerpt detection ignores empty file headings", () => {
  assert.equal(hasNonEmptySourceExcerpt("#### repo/file.ts\nexport const ok = true;"), true);
  assert.equal(hasNonEmptySourceExcerpt("#### repo/file.ts\n"), false);
  assert.equal(hasNonEmptySourceExcerpt("  \n  "), false);
  assert.equal(hasNonEmptySourceExcerpt(null), false);
});

test("sensitive tokens, inline secrets and private keys are redacted before context is built", () => {
  const hexSecret = "a".repeat(64);
  const stripeFake = ["sk", "live", "A".repeat(24)].join("_");
  const slackFake = ["xoxb", "1234567890", "A".repeat(20)].join("-");
  const githubPatFake = `github_pat_${"A".repeat(40)}`;
  const metaFake = `LLM_1234567890_${"B".repeat(24)}`;
  const gitlabFake = `glpat-${"C".repeat(30)}`;
  const huggingFaceFake = `hf_${"D".repeat(30)}`;
  const npmFake = `npm_${"E".repeat(30)}`;
  const supabaseFake = `sb_secret_${"F".repeat(30)}`;
  const awsSessionFake = `ASIA${"G".repeat(16)}`;
  const sample = [
    'const OPENAI_API_KEY = "sk-abcdefghijklmnopqrstuvwxyz123456";',
    'const XAI_TOKEN = "xai-abcdefghijklmnopqrstuvwxyz123456";',
    'const GOOGLE_API_KEY = "AIza012345678901234567890123456789012345";',
    'const GITHUB_TOKEN = "ghp_abcdefghijklmnopqrstuvwxyz1234567890";',
    'const client_secret = "very-private-client-secret-value";',
    `const STRIPE_KEY = "${stripeFake}";`,
    `const SLACK_TOKEN = "${slackFake}";`,
    githubPatFake,
    metaFake,
    gitlabFake,
    huggingFaceFake,
    npmFake,
    supabaseFake,
    awsSessionFake,
    `const PREVIEW_SHARED = "${hexSecret}";`,
    'Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signaturevalue";',
    "https://example.test/?access_token=very-private-token-value",
    "-----BEGIN PRIVATE KEY-----\nFAKE_PRIVATE_KEY_MATERIAL\n-----END PRIVATE KEY-----",
  ].join("\n");
  const redacted = redactSensitiveText(sample);
  for (const secret of [
    "sk-abcdefghijklmnopqrstuvwxyz123456",
    "xai-abcdefghijklmnopqrstuvwxyz123456",
    "AIza012345678901234567890123456789012345",
    "ghp_abcdefghijklmnopqrstuvwxyz1234567890",
    "very-private-client-secret-value",
    stripeFake,
    slackFake,
    githubPatFake,
    metaFake,
    gitlabFake,
    huggingFaceFake,
    npmFake,
    supabaseFake,
    awsSessionFake,
    hexSecret,
    "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signaturevalue",
    "very-private-token-value",
    "FAKE_PRIVATE_KEY_MATERIAL",
  ]) {
    assert.equal(redacted.includes(secret), false, `secret leaked: ${secret.slice(0, 8)}`);
  }
  assert.ok(redacted.includes("[REDACTED SECRET]"));
  assert.ok(redacted.includes("[REDACTED]"));
  assert.ok(redacted.includes("[REDACTED HIGH-ENTROPY HEX]"));
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
  const withSecret = buildSafeProjectContext({
    project: "KREISLAUF",
    repository: "mouzzlii/Kreislauf",
    branch: "main",
    issueNumber: 43,
    issueTitle: "No sensitive title",
    request: "Check this key sk-abcdefghijklmnopqrstuvwxyz123456",
  });
  assert.equal(withSecret.includes("sk-abcdefghijklmnopqrstuvwxyz123456"), false);
  const withHexSecret = buildSafeProjectContext({
    project: "KREISLAUF",
    repository: "mouzzlii/Kreislauf",
    branch: "main",
    issueNumber: 44,
    issueTitle: "No sensitive title",
    request: `Check this value ${"b".repeat(64)}`,
  });
  assert.equal(withHexSecret.includes("b".repeat(64)), false);
});
