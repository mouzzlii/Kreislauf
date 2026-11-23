import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

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
assert.ok(relaySource.includes('TRAKUNA: process.env.PROJECT_REPO_TRAKUNA || "mouzzlii/Fuck"'));
assert.ok(relaySource.includes('"SCAN-PROFIT": process.env.PROJECT_REPO_SCAN_PROFIT || "mouzzlii/SCAN-PROFIT"'));
assert.ok(relaySource.includes('const OPENAI_MODEL = process.env.OPENAI_MODEL?.trim() || ""'));
assert.ok(relaySource.includes('const GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() || ""'));
assert.ok(relaySource.includes('const XAI_MODEL = process.env.XAI_MODEL?.trim() || ""'));
assert.ok(relaySource.includes("missingModels.length"));
assert.ok(relaySource.includes('!AI_TEAM_REPO_READ_TOKEN && "AI_TEAM_REPO_READ_TOKEN"'));
assert.ok(relaySource.includes("Fine-grained GitHub-Token mit ausschließlich Contents: Read"));
const workflowSource = await readFile(new URL("../.github/workflows/ai-team-communication.yml", import.meta.url), "utf8");
assert.ok(workflowSource.includes("github.event.issue.number == 11"));
assert.equal((relaySource.match(/AI_TEAM_BUDGET_CONFIRMED !== "true"/g) || []).length, 1);
assert.doesNotMatch(relaySource, /gpt-6\\.2-astra|gemini-3\\.8-flash|grok-4\\.7/);
console.log("AI team routing, explicit-model, and budget-gate tests passed.");

