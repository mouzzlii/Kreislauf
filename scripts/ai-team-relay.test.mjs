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
assert.match(relaySource, /TRAKUNA:\s*process\.env\.PROJECT_REPO_TRAKUNA\s*\|\|\s*"mouzzlii\/Fuck"/);
assert.match(relaySource, /AI_TEAM_BUDGET_CONFIRMED !== "true"/);
assert.match(relaySource, /PROJECT_REPO_SCAN_PROFIT\s*\|\|\s*""/);
console.log("AI team routing and budget-gate tests passed.");
