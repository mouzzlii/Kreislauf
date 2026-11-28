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

  assert.ok(relaySource.includes("const RELAY_LIVE_ENABLED = false;"));
  const firstRoundStart = relaySource.indexOf("const independentAnalyses = await Promise.allSettled([");
  const synthesisStart = relaySource.indexOf("const synthesis = await runPhase", firstRoundStart);
  const firstRound = relaySource.slice(firstRoundStart, synthesisStart);
  assert.ok(firstRoundStart >= 0 && synthesisStart > firstRoundStart);
  for (const phase of ["GPT-Erstanalyse", "Claude-unabhängige Analyse", "Gemini-unabhängige Analyse", "Grok-unabhängige Analyse"]) {
    assert.ok(firstRound.includes(phase), `missing independent first-round phase: ${phase}`);
  }
  assert.ok(firstRound.includes("Promise.allSettled"), "independent first analyses must run concurrently and settle before synthesis");
  const mainStart = relaySource.indexOf("async function main()");
  const runtimeGate = relaySource.indexOf("if (!RELAY_LIVE_ENABLED)", mainStart);
  const envValidation = relaySource.indexOf("if (!GITHUB_TOKEN", mainStart);
  const eventRead = relaySource.indexOf("const event = JSON.parse", mainStart);
  assert.ok(mainStart >= 0 && runtimeGate > mainStart && envValidation > runtimeGate && eventRead > runtimeGate,
    "runtime hard gate must stop execution before environment processing and event reads");

  for (const model of ["gpt", "claude", "gemini", "grok"]) {
    assert.ok(providerSource.includes(`${model}: "vmc/council-${model}"`), `missing fixed ${model} alias`);
    assert.ok(relaySource.includes(`COUNCIL_MODELS.${model}`), `relay does not call ${model}`);
  }
  assert.ok(providerSource.includes("https://ai-gateway.vercel.sh/v1/chat/completions"));
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
  const privateWorkspaceGuard = relaySource.indexOf('if (project === "KI-ARBEITSPLATZ")');
  const repositoryLookup = relaySource.indexOf("const repository = PROJECT_REPOS[project]", privateWorkspaceGuard);
  const metadataRequest = relaySource.indexOf("api(`https://api.github.com/repos/${repo}`", privateWorkspaceGuard);
  assert.ok(privateWorkspaceGuard >= 0 && repositoryLookup > privateWorkspaceGuard && metadataRequest > repositoryLookup,
    "KI-Arbeitsplatz must be blocked before any GitHub repository metadata or content request");
  const excludedRepositoryGuard = relaySource.indexOf("repositories.some(isExcludedRepository)");
  const repositoryList = relaySource.indexOf("const repositories = taskEnvelope");
  assert.ok(relaySource.includes('"mouzzlii/ki-arbeitsplatz"'));
  assert.ok(repositoryList >= 0 && excludedRepositoryGuard > repositoryList && metadataRequest > excludedRepositoryGuard,
    "private KI-Arbeitsplatz repository mappings, including related repositories, must be blocked before metadata access");
  assert.ok(sourceContextSource.includes('primary.visibility === "public"'));
  assert.ok(interopSource.includes('["public", "synthetic", "anonymized"]'));
  const publicVisibilityGuard = relaySource.indexOf("if (!isPublicRepositoryMetadata(meta))");
  const readmeFetch = relaySource.indexOf("/readme?ref=", publicVisibilityGuard);
  const treeFetch = relaySource.indexOf("/git/trees/", publicVisibilityGuard);
  assert.ok(publicVisibilityGuard >= 0 && readmeFetch > publicVisibilityGuard && treeFetch > publicVisibilityGuard,
    "repository visibility must be checked before README/tree/source content is fetched");
  assert.ok(relaySource.includes('reserveDailyDebate(comment.id, taskEnvelope?.idempotencyKey || "")'));
  assert.ok(relaySource.includes("hasTrustedRelayMarker(existing, marker)"));
  assert.ok(relaySource.includes("inspectDailyBudgetPage(comments"));
  assert.ok(relaySource.includes("parseCouncilTaskComment(comment.body)"));
  assert.ok(relaySource.includes("resolveCouncilTaskProject(taskEnvelope, PROJECT_REPOS)"));
  assert.ok(relaySource.includes("taskEnvelope.payload.inputs.commitSha"));
  assert.ok(relaySource.includes("taskEnvelope.payload.constraints.allowedPaths"));

  const contextCheck = relaySource.indexOf("if (!hasUsablePrimaryContext(projectContext))");
  const reserve = relaySource.indexOf('const reservation = await reserveDailyDebate(comment.id, taskEnvelope?.idempotencyKey || "")');
  const firstModelCall = relaySource.indexOf("const independentAnalyses = await Promise.allSettled([");
  assert.ok(contextCheck >= 0 && reserve > contextCheck && firstModelCall > reserve,
    "source context and daily budget must be checked before the first model call");

  assert.doesNotMatch(relaySource, /api\.openai\.com|api\.anthropic\.com|askMeta|askLlama|META_MODEL_API_KEY|LLAMA_API_KEY/);
  assert.ok(relaySource.includes("parsePublicDebateRequest"));
  assert.ok(relaySource.includes('dataClassification = taskEnvelope.dataClassification'));
  assert.ok(relaySource.includes('request = "Datenklassifikation: " + dataClassification'));
  assert.ok(setup.includes("[public]"));
  assert.ok(workflowSource.includes("false &&"));
  assert.ok(setup.includes("unabhängige Runtime-Sperre"));
  assert.ok(setup.includes("AI_TEAM_BUDGET_CONFIRMED"));
  assert.ok(setup.includes("0 EUR"));
});
