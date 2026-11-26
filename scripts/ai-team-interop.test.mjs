import assert from "node:assert/strict";
import { test } from "node:test";
import { parseCouncilTaskComment, resolveCouncilTaskProject, validateCouncilTaskEnvelope } from "./ai-team-interop.mjs";

const NOW = new Date("2026-11-26T10:30:00.000Z");

function validEnvelope() {
  return {
    protocol: "ki-interoperability",
    version: "1.0.0",
    messageId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    messageType: "task.request",
    createdAt: "2026-11-26T10:00:00.000Z",
    source: {
      systemId: "ki-arbeitsplatz",
      projectId: "KI-ARBEITSPLATZ",
      componentId: "offline-worker",
    },
    target: {
      systemId: "council-gateway",
      projectId: "KREISLAUF",
      componentId: "task-router",
    },
    correlationId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    idempotencyKey: "kia-" + "a".repeat(64),
    expiresAt: "2026-11-26T11:00:00.000Z",
    dataClassification: "internal",
    payload: {
      taskId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      taskType: "project.static_review",
      instruction: "Create a read-only inventory for the approved repository paths.",
      inputs: {
        projectId: "KI-ARBEITSPLATZ",
        repository: "mouzzlii/KI-Arbeitsplatz",
        commitSha: "a".repeat(40),
        originalQueueTaskId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa".replaceAll("-", ""),
      },
      constraints: {
        readOnly: true,
        allowedPaths: ["MASTERWERK-ROADMAP.md", "Offline-Modus/Lib/Common.ps1"],
        deniedOperations: [
          "modify_source",
          "delete_data",
          "read_secret",
          "network_write",
          "git_push",
          "git_merge",
          "deploy",
          "publish",
          "purchase",
          "send_external_message",
        ],
        maxRuntimeSeconds: 1800,
        maxInputBytes: 20971520,
        approvalGates: [
          "irreversible",
          "external_cost",
          "production_data",
          "legal_commitment",
          "personal_data_export",
        ],
      },
      expectedOutput: { format: "markdown", maxBytes: 10485760 },
    },
  };
}

test("accepts a valid, unexpired, read-only local task envelope", () => {
  const result = validateCouncilTaskEnvelope(validEnvelope(), { now: NOW });
  assert.equal(result.success, true);
  assert.equal(result.data.payload.taskType, "project.static_review");
});

test("rejects unknown envelope fields and unsupported protocol versions", () => {
  const extra = validEnvelope();
  extra.untrusted = true;
  assert.equal(validateCouncilTaskEnvelope(extra, { now: NOW }).success, false);

  const version = validEnvelope();
  version.version = "2.0.0";
  assert.equal(validateCouncilTaskEnvelope(version, { now: NOW }).success, false);
});

test("rejects tasks that are not strictly read-only", () => {
  const message = validEnvelope();
  message.payload.constraints.readOnly = false;
  assert.equal(validateCouncilTaskEnvelope(message, { now: NOW }).success, false);
});

test("requires every denied operation exactly once", () => {
  const missing = validEnvelope();
  missing.payload.constraints.deniedOperations.pop();
  assert.equal(validateCouncilTaskEnvelope(missing, { now: NOW }).success, false);

  const duplicate = validEnvelope();
  duplicate.payload.constraints.deniedOperations[9] = "modify_source";
  assert.equal(validateCouncilTaskEnvelope(duplicate, { now: NOW }).success, false);
});

test("rejects absolute, traversal, backslash and duplicate paths", () => {
  for (const path of ["../outside", "/etc/passwd", "C:/Users/name", "src\\secret.ps1", "src//file.js", "src/./file.js"]) {
    const message = validEnvelope();
    message.payload.constraints.allowedPaths = [path];
    assert.equal(validateCouncilTaskEnvelope(message, { now: NOW }).success, false, path);
  }

  const duplicate = validEnvelope();
  duplicate.payload.constraints.allowedPaths = ["src/file.js", "src/file.js"];
  assert.equal(validateCouncilTaskEnvelope(duplicate, { now: NOW }).success, false);
});

test("rejects expired envelopes and excessive validity windows", () => {
  const expired = validEnvelope();
  expired.expiresAt = "2026-11-26T10:20:00.000Z";
  assert.equal(validateCouncilTaskEnvelope(expired, { now: NOW }).success, false);

  const tooLong = validEnvelope();
  tooLong.expiresAt = "2026-11-28T10:00:00.000Z";
  assert.equal(validateCouncilTaskEnvelope(tooLong, { now: NOW }).success, false);
});

test("binds task type to its expected output format and local task ID", () => {
  const format = validEnvelope();
  format.payload.expectedOutput.format = "json";
  assert.equal(validateCouncilTaskEnvelope(format, { now: NOW }).success, false);

  const id = validEnvelope();
  id.payload.inputs.originalQueueTaskId = "f".repeat(32);
  assert.equal(validateCouncilTaskEnvelope(id, { now: NOW }).success, false);
});

test("rejects incorrect source or target identities and non-internal data", () => {
  const source = validEnvelope();
  source.source.projectId = "OTHER";
  assert.equal(validateCouncilTaskEnvelope(source, { now: NOW }).success, false);

  const target = validEnvelope();
  target.target.componentId = "other";
  assert.equal(validateCouncilTaskEnvelope(target, { now: NOW }).success, false);

  const classification = validEnvelope();
  classification.dataClassification = "confidential";
  assert.equal(validateCouncilTaskEnvelope(classification, { now: NOW }).success, false);
});

test("rejects task types outside the explicit read-only allowlist", () => {
  const message = validEnvelope();
  message.payload.taskType = "project.restore";
  assert.equal(validateCouncilTaskEnvelope(message, { now: NOW }).success, false);
});


test("parses a structured task comment and rejects malformed JSON", () => {
  const valid = validEnvelope();
  const parsed = parseCouncilTaskComment("/ai-team task: " + JSON.stringify(valid), { now: NOW });
  assert.equal(parsed.matched, true);
  assert.equal(parsed.success, true);

  const malformed = parseCouncilTaskComment("/ai-team task: {broken", { now: NOW });
  assert.equal(malformed.matched, true);
  assert.equal(malformed.success, false);

  assert.equal(parseCouncilTaskComment("/ai-team debate KREISLAUF: inspect this").matched, false);
  assert.equal(parseCouncilTaskComment("/ai-team task: " + "x".repeat(12001)).success, false);
});

test("binds task envelope to the canonical project repository and source-path limit", () => {
  const message = validEnvelope();
  const mapping = { "KI-ARBEITSPLATZ": "mouzzlii/KI-Arbeitsplatz" };
  const result = resolveCouncilTaskProject(message, mapping);
  assert.equal(result.success, true);
  assert.equal(result.project, "KI-ARBEITSPLATZ");
  assert.equal(result.commitSha, "a".repeat(40));

  assert.equal(resolveCouncilTaskProject(message, { "KI-ARBEITSPLATZ": "attacker/other-repo" }).success, false);
  assert.equal(resolveCouncilTaskProject(message, {}).success, false);

  const tooManyPaths = validEnvelope();
  tooManyPaths.payload.constraints.allowedPaths = ["a", "b", "c", "d", "e"];
  assert.equal(resolveCouncilTaskProject(tooManyPaths, mapping).success, false);
});

test("rejects more than four approved source files", () => {
  const message = validEnvelope();
  message.payload.constraints.allowedPaths = ["a.js", "b.js", "c.js", "d.js", "e.js"];
  assert.equal(validateCouncilTaskEnvelope(message, { now: NOW }).success, false);
});
