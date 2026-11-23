import assert from "node:assert/strict";

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
