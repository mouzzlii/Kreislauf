import { createHash } from "node:crypto";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_TIME_PATTERN = /(?:Z|[+-]\d{2}:\d{2})$/;
const SYSTEM_ID_PATTERN = /^[a-z0-9][a-z0-9._-]{1,63}$/;
const PROJECT_ID_PATTERN = /^[A-Z0-9][A-Z0-9_-]{1,63}$/;
const COMPONENT_ID_PATTERN = /^[a-z0-9][a-z0-9._-]{1,63}$/;
const REPOSITORY_PATTERN = /^[A-Za-z0-9_.-]{1,100}\/[A-Za-z0-9_.-]{1,100}$/;
const COMMIT_PATTERN = /^[a-f0-9]{40}$/i;
const QUEUE_TASK_ID_PATTERN = /^[a-f0-9]{32}$/i;
const DENIED_OPERATIONS = [
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
];
const APPROVAL_GATES = [
  "irreversible",
  "external_cost",
  "production_data",
  "legal_commitment",
  "personal_data_export",
];
const TASKS = {
  "project.static_review": { format: "markdown" },
};

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function exactKeys(value, required, optional = []) {
  if (!isRecord(value)) return false;
  const keys = Object.keys(value);
  return required.every((key) => Object.hasOwn(value, key)) &&
    keys.every((key) => required.includes(key) || optional.includes(key));
}

const BLOCKED_REPOSITORY_DIRECTORIES = new Set([
  ".git", "node_modules", ".ssh", ".aws", ".azure", ".kube", ".docker",
  ".gnupg", ".gcloud", ".pulumi", ".terraform.d", ".venv", "venv",
  "__pycache__", "vendor", "coverage", "dist", "build",
]);
const BLOCKED_REPOSITORY_FILES = new Set([
  ".env", ".npmrc", ".pypirc", ".netrc", "credentials.json",
  "service-account.json", "id_rsa", "id_ed25519", "id_ecdsa", "id_dsa",
  "id_ed25519_sk", "id_ecdsa_sk",
]);

function isSafeRepositoryPath(value) {
  if (typeof value !== "string" || value.length < 1 || value.length > 1024) return false;
  if (value.startsWith("/") || /^[A-Za-z]:/.test(value) || value.includes("\\")) return false;
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code < 0x20 || code === 0x7f) return false;
  }
  if (["*", "?", "[", "]"].some((character) => value.includes(character))) return false;

  let decoded;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return false;
  }
  if (decoded.startsWith("/") || /^[A-Za-z]:/.test(decoded) || decoded.includes("\\")) return false;
  for (let index = 0; index < decoded.length; index += 1) {
    const code = decoded.charCodeAt(index);
    if (code < 0x20 || code === 0x7f) return false;
  }
  if (["*", "?", "[", "]"].some((character) => decoded.includes(character))) return false;

  const segments = decoded.split("/");
  if (segments.some((part) => !part || part === "." || part === "..")) return false;
  if (segments.some((part) => {
    const lower = part.toLowerCase();
    return BLOCKED_REPOSITORY_DIRECTORIES.has(lower) || lower.startsWith(".env");
  })) return false;

  const leaf = segments.at(-1).toLowerCase();
  if (BLOCKED_REPOSITORY_FILES.has(leaf)) return false;
  if (/\.(pem|key|p12|pfx|ppk|jks|keystore|kdbx)$/.test(leaf)) return false;
  if (/(secret|credential|apikey|api_key|api-key|access[-_]token|refresh[-_]token)/.test(leaf)) return false;
  return true;
}

export function createCouncilTaskIdempotencyKey(payload) {
  const paths = [...payload.constraints.allowedPaths].sort();
  const parts = [
    "ki-arbeitsplatz",
    "queue-v1",
    payload.inputs.originalQueueTaskId.toLowerCase(),
    "interop-v1",
    payload.taskType,
    payload.inputs.repository.toLowerCase(),
    payload.inputs.projectId,
    payload.inputs.commitSha.toLowerCase(),
    String(paths.length),
    ...paths,
  ];
  const material = parts.map((field) => String(field.length) + ":" + field).join("");
  return "kia-" + createHash("sha256").update(material, "utf8").digest("hex");
}

export function validateCouncilTaskEnvelope(input, { now = new Date() } = {}) {
  const issues = [];
  const add = (path, message) => issues.push({ path, message });
  const string = (value, min, max) => typeof value === "string" && value.length >= min && value.length <= max;
  const integer = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;
  const uuid = (value) => typeof value === "string" && UUID_PATTERN.test(value);
  const dateTime = (value) => typeof value === "string" && DATE_TIME_PATTERN.test(value) && Number.isFinite(Date.parse(value));

  const envelopeKeys = [
    "protocol", "version", "messageId", "messageType", "createdAt", "source",
    "target", "correlationId", "idempotencyKey", "expiresAt", "dataClassification", "payload",
  ];
  if (!exactKeys(input, envelopeKeys)) {
    add([], "Envelope must be an object with exactly the v1 task-request fields.");
    return { success: false, issues };
  }

  if (input.protocol !== "ki-interoperability") add(["protocol"], "Unsupported protocol.");
  if (input.version !== "1.0.0") add(["version"], "Unsupported protocol version.");
  if (!uuid(input.messageId)) add(["messageId"], "Expected a canonical UUID.");
  if (input.messageType !== "task.request") add(["messageType"], "Only task.request is accepted.");
  if (!dateTime(input.createdAt)) add(["createdAt"], "Expected an ISO-8601 date-time with an explicit timezone.");
  if (!uuid(input.correlationId)) add(["correlationId"], "Expected a canonical UUID.");
  if (typeof input.idempotencyKey !== "string" || !/^kia-[a-f0-9]{64}$/.test(input.idempotencyKey)) {
    add(["idempotencyKey"], "Expected the local outbox idempotency key format.");
  }
  else if (isRecord(input.payload) && isRecord(input.payload.inputs) && isRecord(input.payload.constraints) && Array.isArray(input.payload.constraints.allowedPaths) && input.payload.constraints.allowedPaths.every((path) => typeof path === "string") && typeof input.payload.taskType === "string" && typeof input.payload.inputs.originalQueueTaskId === "string" && typeof input.payload.inputs.repository === "string" && typeof input.payload.inputs.projectId === "string" && typeof input.payload.inputs.commitSha === "string") {
    if (input.idempotencyKey !== createCouncilTaskIdempotencyKey(input.payload)) {
      add(["idempotencyKey"], "Idempotency key does not match the canonical task and repository scope.");
    }
  }
  if (!dateTime(input.expiresAt)) add(["expiresAt"], "Expected an ISO-8601 date-time with an explicit timezone.");
  if (input.dataClassification !== "internal") add(["dataClassification"], "Only internal data is accepted.");

  const identity = (value, path) => {
    if (!exactKeys(value, ["systemId", "projectId", "componentId"], ["agentId"])) {
      add(path, "Identity has missing or unknown fields.");
      return;
    }
    if (!string(value.systemId, 2, 64) || !SYSTEM_ID_PATTERN.test(value.systemId)) add([...path, "systemId"], "Invalid system ID.");
    if (!string(value.projectId, 2, 64) || !PROJECT_ID_PATTERN.test(value.projectId)) add([...path, "projectId"], "Invalid project ID.");
    if (!string(value.componentId, 2, 64) || !COMPONENT_ID_PATTERN.test(value.componentId)) add([...path, "componentId"], "Invalid component ID.");
    if (value.agentId !== undefined && (!string(value.agentId, 2, 64) || !SYSTEM_ID_PATTERN.test(value.agentId))) {
      add([...path, "agentId"], "Invalid agent ID.");
    }
  };

  identity(input.source, ["source"]);
  identity(input.target, ["target"]);
  if (isRecord(input.source) && (
    input.source.systemId !== "ki-arbeitsplatz" ||
    input.source.projectId !== "KI-ARBEITSPLATZ" ||
    input.source.componentId !== "offline-worker"
  )) add(["source"], "Unexpected source identity.");
  if (isRecord(input.target) && (
    input.target.systemId !== "council-gateway" ||
    input.target.projectId !== "KREISLAUF" ||
    input.target.componentId !== "task-router"
  )) add(["target"], "Unexpected target identity.");

  const payload = input.payload;
  const payloadKeys = ["taskId", "taskType", "instruction", "inputs", "constraints", "expectedOutput"];
  if (!exactKeys(payload, payloadKeys)) {
    add(["payload"], "Task payload has missing or unknown fields.");
    return { success: false, issues };
  }

  if (!uuid(payload.taskId)) add(["payload", "taskId"], "Expected a canonical UUID.");
  if (!string(payload.taskType, 1, 120) || !/^[a-z][a-z0-9]*(\.[a-z][a-z0-9_-]*){1,4}$/.test(payload.taskType)) {
    add(["payload", "taskType"], "Invalid task type.");
  }
  if (!string(payload.instruction, 1, 8000)) add(["payload", "instruction"], "Instruction must contain 1 to 8000 characters.");

  const inputs = payload.inputs;
  if (!exactKeys(inputs, ["projectId", "repository", "commitSha", "originalQueueTaskId"])) {
    add(["payload", "inputs"], "Inputs have missing or unknown fields.");
  } else {
    if (!string(inputs.projectId, 2, 64) || !PROJECT_ID_PATTERN.test(inputs.projectId)) add(["payload", "inputs", "projectId"], "Invalid remote project ID.");
    if (typeof inputs.repository !== "string" || !REPOSITORY_PATTERN.test(inputs.repository)) add(["payload", "inputs", "repository"], "Invalid owner/repository identifier.");
    if (typeof inputs.commitSha !== "string" || !COMMIT_PATTERN.test(inputs.commitSha)) add(["payload", "inputs", "commitSha"], "A full 40-character commit SHA is required.");
    if (typeof inputs.originalQueueTaskId !== "string" || !QUEUE_TASK_ID_PATTERN.test(inputs.originalQueueTaskId)) {
      add(["payload", "inputs", "originalQueueTaskId"], "Invalid original queue task ID.");
    }
    if (uuid(payload.taskId) && QUEUE_TASK_ID_PATTERN.test(inputs.originalQueueTaskId || "") &&
        payload.taskId.replaceAll("-", "").toLowerCase() !== inputs.originalQueueTaskId.toLowerCase()) {
      add(["payload", "inputs", "originalQueueTaskId"], "Original queue task ID does not match the protocol task ID.");
    }
  }

  const constraints = payload.constraints;
  const constraintKeys = ["readOnly", "allowedPaths", "deniedOperations", "maxRuntimeSeconds", "maxInputBytes", "approvalGates"];
  if (!exactKeys(constraints, constraintKeys)) {
    add(["payload", "constraints"], "Constraints have missing or unknown fields.");
  } else {
    if (constraints.readOnly !== true) add(["payload", "constraints", "readOnly"], "Task must be strictly read-only.");

    if (!Array.isArray(constraints.allowedPaths) || constraints.allowedPaths.length < 1 || constraints.allowedPaths.length > 4) {
      add(["payload", "constraints", "allowedPaths"], "Between 1 and 4 approved source paths are required.");
    } else {
      const seen = new Set();
      for (const [index, path] of constraints.allowedPaths.entries()) {
        if (!isSafeRepositoryPath(path)) add(["payload", "constraints", "allowedPaths", index], "Path must be a safe repository-relative POSIX path.");
        if (seen.has(path)) add(["payload", "constraints", "allowedPaths", index], "Duplicate allowed path.");
        seen.add(path);
      }
    }

    if (!Array.isArray(constraints.deniedOperations) ||
        constraints.deniedOperations.length !== DENIED_OPERATIONS.length ||
        new Set(constraints.deniedOperations).size !== DENIED_OPERATIONS.length ||
        constraints.deniedOperations.some((operation) => !DENIED_OPERATIONS.includes(operation))) {
      add(["payload", "constraints", "deniedOperations"], "All ten denied operation classes must be present exactly once.");
    }
    if (!integer(constraints.maxRuntimeSeconds, 1, 86400)) add(["payload", "constraints", "maxRuntimeSeconds"], "Runtime limit is out of range.");
    if (!integer(constraints.maxInputBytes, 1, 104857600)) add(["payload", "constraints", "maxInputBytes"], "Input byte limit is out of range.");
    if (!Array.isArray(constraints.approvalGates) || constraints.approvalGates.length > 5 ||
        new Set(constraints.approvalGates).size !== constraints.approvalGates.length ||
        constraints.approvalGates.some((gate) => !APPROVAL_GATES.includes(gate))) {
      add(["payload", "constraints", "approvalGates"], "Approval gates must be unique known values.");
    }
  }

  const output = payload.expectedOutput;
  if (!exactKeys(output, ["format", "maxBytes"])) {
    add(["payload", "expectedOutput"], "Expected output has missing or unknown fields.");
  } else {
    const expected = TASKS[payload.taskType];
    if (!expected) add(["payload", "taskType"], "Task type is not enabled for this read-only adapter.");
    else if (output.format !== expected.format) add(["payload", "expectedOutput", "format"], "Output format does not match the approved task type.");
    if (!["markdown", "json", "csv", "artifact"].includes(output.format)) add(["payload", "expectedOutput", "format"], "Unsupported output format.");
    if (!integer(output.maxBytes, 1, 104857600)) add(["payload", "expectedOutput", "maxBytes"], "Output byte limit is out of range.");
  }

  if (dateTime(input.createdAt) && dateTime(input.expiresAt)) {
    const created = Date.parse(input.createdAt);
    const expires = Date.parse(input.expiresAt);
    if (expires <= created || expires - created > 24 * 60 * 60 * 1000) {
      add(["expiresAt"], "Expiry must be after creation and no more than 24 hours later.");
    }
    if (created > now.getTime() + 5 * 60 * 1000) add(["createdAt"], "Creation time is too far in the future.");
    if (expires <= now.getTime()) add(["expiresAt"], "Envelope has expired.");
  }

  return issues.length
    ? { success: false, issues }
    : { success: true, data: input };
}

export const COUNCIL_TASK_ENVELOPE_VERSION = "1.0.0";


export function parseCouncilTaskComment(body, options = {}) {
  if (typeof body !== "string") return { matched: false };
  const match = body.match(/^\/ai-team\s+task\s*:\s*([\s\S]*)$/i);
  if (!match) return { matched: false };

  const raw = match[1].trim();
  if (!raw || raw.length > 12_000) {
    return { matched: true, success: false, issues: [{ path: [], message: "Task envelope comment is empty or exceeds 12000 characters." }] };
  }

  let envelope;
  try {
    envelope = JSON.parse(raw);
  } catch {
    return { matched: true, success: false, issues: [{ path: [], message: "Task envelope is not valid JSON." }] };
  }

  return { matched: true, ...validateCouncilTaskEnvelope(envelope, options) };
}

export function resolveCouncilTaskProject(envelope, projectRepositories) {
  const project = envelope?.payload?.inputs?.projectId;
  const repository = envelope?.payload?.inputs?.repository;
  if (!isRecord(projectRepositories) || typeof project !== "string" ||
      !Object.hasOwn(projectRepositories, project)) {
    return { success: false, message: "Unknown or unconfigured Council project ID." };
  }
  if (projectRepositories[project] !== repository) {
    return { success: false, message: "Repository does not match the canonical repository mapping for this project." };
  }
  const allowedPaths = envelope?.payload?.constraints?.allowedPaths;
  if (!Array.isArray(allowedPaths) || allowedPaths.length > 4) {
    return { success: false, message: "Council task may select at most four approved source files." };
  }
  return {
    success: true,
    project,
    repository,
    commitSha: envelope.payload.inputs.commitSha,
    allowedPaths: [...allowedPaths],
  };
}
