import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const parseDebateCommand = (body) => {
  const match = body.match(/^\/ai-team\s+debate\s+(KREISLAUF|TRAKUNA|SCAN-PROFIT|CHRONOS|INSERAT-PROFI-AI|BOOK-YOUR-COOK|LARA-QUIZ|KI-ARBEITSPLATZ)\s*:\s*([\s\S]+)$/i);
  if (!match) return null;
  const request = match[2].trim();
  return request ? { project: match[1].toUpperCase(), request } : null;
};

test("debate command parser accepts supported projects and rejects malformed commands", () => {
  assert.deepEqual(parseDebateCommand("/ai-team debate SCAN-PROFIT: Prüfe den Scan-Lock"), {
    project: "SCAN-PROFIT",
    request: "Prüfe den Scan-Lock",
  });
  assert.deepEqual(parseDebateCommand("/ai-team debate chronos: Prüfe Room-Migrationen"), {
    project: "CHRONOS",
    request: "Prüfe Room-Migrationen",
  });
  assert.deepEqual(parseDebateCommand("/ai-team debate KI-ARBEITSPLATZ: Prüfe den Offline-Worker"), {
    project: "KI-ARBEITSPLATZ",
    request: "Prüfe den Offline-Worker",
  });
  assert.equal(parseDebateCommand("@ai-team debate [CHRONOS]"), null);
  assert.equal(parseDebateCommand("/ai-team debate UNKNOWN: Test"), null);
  assert.equal(parseDebateCommand("/ai-team debate TRAKUNA:   "), null);
});

test("relay and workflow use the same fixed four-model Gateway contract", async () => {
  const relaySource = await readFile(new URL("./ai-team-relay.mjs", import.meta.url), "utf8");
  const providerSource = await readFile(new URL("./ai-team-providers.mjs", import.meta.url), "utf8");
  const sourceContextSource = await readFile(new URL("./ai-team-source-context.mjs", import.meta.url), "utf8");
  const interopSource = await readFile(new URL("./ai-team-interop.mjs", import.meta.url), "utf8");
  const workflowSource = await readFile(new URL("../.github/workflows/ai-team-communication.yml", import.meta.url), "utf8");
  const ciWorkflowSource = await readFile(new URL("../.github/workflows/ai-team-relay-ci.yml", import.meta.url), "utf8");
  const setup = await readFile(new URL("../AI_TEAM_SETUP.md", import.meta.url), "utf8");

  for (const model of ["gpt", "claude", "gemini", "grok"]) {
    assert.ok(providerSource.includes(`${model}: "vmc/council-${model}"`), `missing fixed ${model} alias`);
    assert.ok(relaySource.includes(`COUNCIL_MODELS.${model}`), `relay does not call ${model}`);
  }
  assert.ok(providerSource.includes("https://ai-gateway.vercel.sh/v1/chat/completions"));
  assert.ok(providerSource.includes("export function extractGatewayResponseMetadata"));
  assert.ok(relaySource.includes("modelAudit.push"));
  assert.ok(relaySource.includes("Technische Modellnachweise"));
  assert.ok(relaySource.includes("entry.usage.promptTokens"));
  assert.ok(relaySource.includes("entry.usage.completionTokens"));
  assert.ok(relaySource.includes("entry.usage.totalTokens"));
  assert.ok(relaySource.includes("Provider- und Kostenangaben werden nur als bestätigt ausgewiesen"));
  assert.ok(relaySource.includes("AI_GATEWAY_API_KEY"));
  assert.ok(workflowSource.includes("AI_GATEWAY_API_KEY: ${{ secrets.AI_GATEWAY_API_KEY }}"));
  assert.ok(workflowSource.includes("AI_TEAM_REPO_READ_TOKEN: ${{ secrets.AI_TEAM_REPO_READ_TOKEN }}"));
  for (const workflow of [workflowSource, ciWorkflowSource]) {
    assert.ok(workflow.includes("actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1"));
    assert.ok(workflow.includes("actions/setup-node@249970729cb0ef3589644e2896645e5dc5ba9c38"));
    assert.doesNotMatch(workflow, /actions\/(?:checkout|setup-node)@v[0-9]+/);
  }
  assert.ok(setup.includes("Vercel AI Gateway"));
  assert.ok(setup.includes("Gemini"));
  assert.ok(setup.includes("Grok"));
  assert.ok(setup.includes("Vercel AI Gateway"));
  assert.ok(setup.includes("AI_GATEWAY_API_KEY"));
  assert.ok(setup.includes("AI_TEAM_REPO_READ_TOKEN"));
  assert.doesNotMatch(setup, /OPENAI_API_KEY|ANTHROPIC_API_KEY|META_MODEL_API_KEY|LLAMA_API_KEY|AI_TEAM_THIRD_PROVIDER/);

  assert.ok(relaySource.includes("const MAX_DAILY_DEBATES = 2;"));
  assert.ok(relaySource.includes("AI_TEAM_BUDGET_CONFIRMED !== \"true\""));
  assert.ok(relaySource.includes("hasUsablePrimaryContext(projectContext)"));
  assert.ok(relaySource.includes("isPublicRepositoryMetadata(meta)"));
  assert.ok(sourceContextSource.includes('primary.visibility === "public"'));
  assert.ok(interopSource.includes('["public", "synthetic", "anonymized"]'));
  assert.ok(interopSource.includes("export function parsePublicDebateRequest(value)"));
  const publicVisibilityGuard = relaySource.indexOf("if (!isPublicRepositoryMetadata(meta))");
  const readmeFetch = relaySource.indexOf("/readme?ref=", publicVisibilityGuard);
  const treeFetch = relaySource.indexOf("/git/trees/", publicVisibilityGuard);
  assert.ok(publicVisibilityGuard >= 0 && readmeFetch > publicVisibilityGuard && treeFetch > publicVisibilityGuard,
    "repository visibility must be checked before README/tree/source content is fetched");
  assert.ok(relaySource.includes('reserveDailyDebate(comment.id, taskEnvelope?.idempotencyKey || "")'));
  assert.ok(relaySource.includes("hasTrustedRelayMarker(existing, marker)"));
  assert.ok(relaySource.includes("inspectDailyBudgetPage(comments"));
  assert.ok(relaySource.includes("parseCouncilTaskComment(comment.body)"));
  assert.ok(relaySource.includes("parsePublicDebateRequest(debateMatch[2])"));
  const classificationParse = relaySource.indexOf("parsePublicDebateRequest(debateMatch[2])");
  const classificationReject = relaySource.indexOf("if (!classifiedRequest.success)", classificationParse);
  const contextFetch = relaySource.indexOf("const projectContext = await fetchProjectContext");
  const budgetReservation = relaySource.indexOf("const reservation = await reserveDailyDebate");
  assert.ok(classificationParse >= 0 && classificationReject > classificationParse &&
    contextFetch > classificationReject && budgetReservation > classificationReject,
  "unclassified free debate requests must be rejected before context loading and budget reservation");
  assert.ok(relaySource.includes("resolveCouncilTaskProject(taskEnvelope, PROJECT_REPOS)"));
  assert.ok(relaySource.includes("taskEnvelope.payload.inputs.commitSha"));
  assert.ok(relaySource.includes("taskEnvelope.payload.constraints.allowedPaths"));

  const contextCheck = relaySource.indexOf("if (!hasUsablePrimaryContext(projectContext))");
  const reserve = relaySource.indexOf('const reservation = await reserveDailyDebate(comment.id, taskEnvelope?.idempotencyKey || "")');
  const firstModelCall = relaySource.indexOf("const initial = await runPhase");
  assert.ok(contextCheck >= 0 && reserve > contextCheck && firstModelCall > reserve,
    "source context and daily budget must be checked before the first model call");

  assert.doesNotMatch(relaySource, /api\.openai\.com|api\.anthropic\.com|askMeta|askLlama|META_MODEL_API_KEY|LLAMA_API_KEY/);
  assert.ok(workflowSource.includes("false &&"));
  assert.ok(relaySource.includes("const RELAY_LIVE_ENABLED = false;"));
  const mainEntry = relaySource.indexOf("async function main()");
  const runtimeGate = relaySource.indexOf("if (!RELAY_LIVE_ENABLED)", mainEntry);
  const eventRead = relaySource.indexOf("readFile(GITHUB_EVENT_PATH", mainEntry);
  assert.ok(mainEntry >= 0 && runtimeGate > mainEntry && eventRead > runtimeGate,
    "runtime hard-disable must return before reading the event or performing network work");
  assert.ok(setup.includes("AI_TEAM_BUDGET_CONFIRMED"));
  assert.ok(setup.includes("0 EUR"));
});


test("task envelope runtime and byte limits are enforced at relay boundaries", async () => {
  const relaySource = await readFile(new URL("./ai-team-relay.mjs", import.meta.url), "utf8");
  const interopSource = await readFile(new URL("./ai-team-interop.mjs", import.meta.url), "utf8");
  assert.ok(relaySource.includes("createTaskExecutionBudget("));
  assert.ok(relaySource.includes("taskExecutionBudget.deadlineAt"));
  assert.ok(relaySource.includes("taskExecutionBudget.maxInputBytes"));
  assert.ok(relaySource.includes("taskExecutionBudget.maxOutputBytes"));
  assert.ok(relaySource.includes("taskBudgeted: Boolean(taskExecutionBudget)"));
  assert.ok(relaySource.includes("AbortSignal.timeout(timeoutMs)"));
  assert.ok(interopSource.includes("workflowMaxRuntimeSeconds = 420"));
  assert.ok(relaySource.includes("const missingSourcePaths = sourceFiles.filter((file) => !file.content).map((file) => file.path);"));
  assert.ok(relaySource.includes("Council task source files could not all be loaded"));
  assert.ok(interopSource.includes("Buffer.byteLength(value, \"utf8\")"));
});
