import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  getMissingProviderConfiguration,
  isSecureLlamaEndpoint,
} from "./ai-team-providers.mjs";

const parseCommand = (body) => {
  const match = body.match(/^\/ai-team\s+debate\s+(KREISLAUF|TRAKUNA|SCAN-PROFIT|CHRONOS)\s*:\s*([\s\S]+)$/i);
  if (!match) return null;
  const request = match[2].trim();
  if (!request) return null;
  return { project: match[1].toUpperCase(), request };
};

assert.deepEqual(parseCommand("/ai-team debate SCAN-PROFIT: Prüfe den Scan-Lock"), {
  project: "SCAN-PROFIT",
  request: "Prüfe den Scan-Lock",
});
assert.deepEqual(parseCommand("/ai-team debate chronos: Prüfe Room-Migrationen"), {
  project: "CHRONOS",
  request: "Prüfe Room-Migrationen",
});
assert.equal(parseCommand("@ai-team debate [CHRONOS]"), null);
assert.equal(parseCommand("/ai-team debate UNKNOWN: Test"), null);
assert.equal(parseCommand("/ai-team debate TRAKUNA:   "), null);
console.log("AI team command parser tests passed.");

const relaySource = await readFile(new URL("./ai-team-relay.mjs", import.meta.url), "utf8");
const workflowSource = await readFile(new URL("../.github/workflows/ai-team-communication.yml", import.meta.url), "utf8");
const setup = await readFile(new URL("../AI_TEAM_SETUP.md", import.meta.url), "utf8");
assert.ok(relaySource.includes('TRAKUNA: process.env.PROJECT_REPO_TRAKUNA || "mouzzlii/multi-carrier-gateway"'));
assert.ok(relaySource.includes('TRAKUNA: [process.env.PROJECT_REPO_TRAKUNA_ANDROID?.trim() || "mouzzlii/Fuck"]'));
assert.ok(relaySource.includes("repositories: contexts.map"));
assert.ok(relaySource.includes("contexts.flatMap"));
assert.ok(relaySource.includes('"SCAN-PROFIT": process.env.PROJECT_REPO_SCAN_PROFIT || "mouzzlii/SCAN-PROFIT"'));
assert.ok(relaySource.includes('const OPENAI_MODEL = process.env.OPENAI_MODEL?.trim() || ""'));
assert.ok(relaySource.includes('const CLAUDE_MODEL = process.env.CLAUDE_MODEL?.trim() || ""'));
assert.ok(relaySource.includes('const LLAMA_MODEL = process.env.LLAMA_MODEL?.trim() || ""'));
assert.ok(relaySource.includes("getMissingProviderConfiguration"));
assert.ok(relaySource.includes("askClaude"));
assert.ok(relaySource.includes("askLlama"));
assert.doesNotMatch(relaySource, /GEMINI_API_KEY|XAI_API_KEY|GEMINI_MODEL|XAI_MODEL|askGemini|askGrok/);
assert.ok(workflowSource.includes("ANTHROPIC_API_KEY"));
assert.ok(workflowSource.includes("LLAMA_API_KEY"));
assert.ok(workflowSource.includes("LLAMA_API_BASE_URL"));
assert.ok(setup.includes("Claude"));
assert.ok(setup.includes("Llama"));
assert.ok(setup.includes("Meta Model API"));
assert.ok(setup.includes("AI_TEAM_REPO_READ_TOKEN"));
assert.equal((relaySource.match(/AI_TEAM_BUDGET_CONFIRMED !== "true"/g) || []).length, 1);
assert.ok(relaySource.includes("const MAX_DAILY_DEBATES = 2;"));
assert.ok(relaySource.includes("reserveDailyDebate(comment.id)"));
assert.ok(relaySource.includes("Fehlerphase: ${phase}"));
assert.ok(relaySource.includes("Tageskontingent bleibt verbraucht"));
assert.equal(isSecureLlamaEndpoint("https://llama.example.com/v1/chat/completions"), true);
assert.equal(isSecureLlamaEndpoint("http://llama.example.com/v1/chat/completions"), false);
assert.deepEqual(getMissingProviderConfiguration({
  OPENAI_API_KEY:"openai",
  ANTHROPIC_API_KEY:"claude",
  LLAMA_API_KEY:"llama",
  LLAMA_API_BASE_URL:"https://llama.example.com/v1/chat/completions",
  AI_TEAM_REPO_READ_TOKEN:"read-only",
  OPENAI_MODEL:"gpt",
  CLAUDE_MODEL:"claude",
  LLAMA_MODEL:"llama",
}), { missingSecrets:[], missingModels:[] });
console.log("AI team routing, provider credentials, secure endpoint and budget-gate tests passed.");
