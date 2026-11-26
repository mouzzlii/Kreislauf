import { z } from "zod";

const UUID = z.string().uuid();
const DATE_TIME = z.string().refine((value) =>
  typeof value === "string" &&
  /(?:Z|[+-]\\d{2}:\\d{2})$/.test(value) &&
  Number.isFinite(Date.parse(value)),
  "Expected an ISO-8601 date-time with an explicit timezone.",
);

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
  "project.inventory": { format: "csv" },
  "project.static_review": { format: "markdown" },
  "project.hash_manifest": { format: "json" },
};

const IDENTITY = z.object({
  systemId: z.string().regex(/^[a-z0-9][a-z0-9._-]{1,63}$/),
  projectId: z.string().regex(/^[A-Z0-9][A-Z0-9_-]{1,63}$/),
  componentId: z.string().regex(/^[a-z0-9][a-z0-9._-]{1,63}$/),
  agentId: z.string().regex(/^[a-z0-9][a-z0-9._-]{1,63}$/).optional(),
}).strict();

function isSafeRepositoryPath(value) {
  if (typeof value !== "string" || value.length < 1 || value.length > 1024) return false;
  if (value.startsWith("/") || /^[A-Za-z]:/.test(value) || value.includes("\\\\")) return false;
  if (/[\\x00-\\x1f]/.test(value)) return false;
  return !value.split("/").some((part) => part === "." || part === ".." || part === "");
}

const allowedPathsSchema = z.array(z.string().min(1).max(1024)).min(1).max(200)
  .superRefine((paths, context) => {
    const seen = new Set();
    for (const [index, path] of paths.entries()) {
      if (!isSafeRepositoryPath(path)) {
        context.addIssue({ code: "custom", path: [index], message: "Path must be a safe repository-relative POSIX path." });
      }
      if (seen.has(path)) {
        context.addIssue({ code: "custom", path: [index], message: "Duplicate allowed path." });
      }
      seen.add(path);
    }
  });

const taskPayloadSchema = z.object({
  taskId: UUID,
  taskType: z.string().regex(/^[a-z][a-z0-9]*(\\.[a-z][a-z0-9_-]*){1,4}$/).max(120),
  instruction: z.string().min(1).max(8000),
  inputs: z.object({
    projectId: z.string().regex(/^[A-Z0-9][A-Z0-9_-]{1,63}$/),
    repository: z.string().regex(/^[A-Za-z0-9_.-]{1,100}\\/[A-Za-z0-9_.-]{1,100}$/),
    commitSha: z.string().regex(/^[a-f0-9]{40}$/i),
    originalQueueTaskId: z.string().regex(/^[a-f0-9]{32}$/i),
  }).strict(),
  constraints: z.object({
    readOnly: z.literal(true),
    allowedPaths: allowedPathsSchema,
    deniedOperations: z.array(z.enum(DENIED_OPERATIONS)).length(10),
    maxRuntimeSeconds: z.number().int().min(1).max(86400),
    maxInputBytes: z.number().int().min(1).max(104857600),
    approvalGates: z.array(z.enum(APPROVAL_GATES)).max(5),
  }).strict().superRefine((constraints, context) => {
    if (new Set(constraints.deniedOperations).size !== DENIED_OPERATIONS.length) {
      context.addIssue({ code: "custom", path: ["deniedOperations"], message: "All ten denied operation classes must be present exactly once." });
    }
    if (new Set(constraints.approvalGates).size !== constraints.approvalGates.length) {
      context.addIssue({ code: "custom", path: ["approvalGates"], message: "Approval gates must be unique." });
    }
  }),
  expectedOutput: z.object({
    format: z.enum(["markdown", "json", "csv", "artifact"]),
    maxBytes: z.number().int().min(1).max(104857600),
  }).strict(),
}).strict().superRefine((payload, context) => {
  const expected = TASKS[payload.taskType];
  if (!expected) {
    context.addIssue({ code: "custom", path: ["taskType"], message: "Task type is not enabled for this read-only adapter." });
    return;
  }
  if (payload.expectedOutput.format !== expected.format) {
    context.addIssue({ code: "custom", path: ["expectedOutput", "format"], message: "Output format does not match the approved task type." });
  }
  if (payload.taskId.replaceAll("-", "").toLowerCase() !== payload.inputs.originalQueueTaskId.toLowerCase()) {
    context.addIssue({ code: "custom", path: ["inputs", "originalQueueTaskId"], message: "Original queue task ID does not match the protocol task ID." });
  }
});

const envelopeSchema = z.object({
  protocol: z.literal("ki-interoperability"),
  version: z.literal("1.0.0"),
  messageId: UUID,
  messageType: z.literal("task.request"),
  createdAt: DATE_TIME,
  source: IDENTITY,
  target: IDENTITY,
  correlationId: UUID,
  idempotencyKey: z.string().regex(/^kia-[a-f0-9]{64}$/),
  expiresAt: DATE_TIME,
  dataClassification: z.enum(["public", "internal", "confidential", "restricted"]),
  payload: taskPayloadSchema,
}).strict().superRefine((message, context) => {
  if (message.source.systemId !== "ki-arbeitsplatz" ||
      message.source.projectId !== "KI-ARBEITSPLATZ" ||
      message.source.componentId !== "offline-worker") {
    context.addIssue({ code: "custom", path: ["source"], message: "Unexpected source identity." });
  }
  if (message.target.systemId !== "council-gateway" ||
      message.target.projectId !== "KREISLAUF" ||
      message.target.componentId !== "task-router") {
    context.addIssue({ code: "custom", path: ["target"], message: "Unexpected target identity." });
  }
  if (message.dataClassification !== "internal") {
    context.addIssue({ code: "custom", path: ["dataClassification"], message: "Only internal data is accepted by this adapter." });
  }
  const created = Date.parse(message.createdAt);
  const expires = Date.parse(message.expiresAt);
  if (expires <= created || expires - created > 24 * 60 * 60 * 1000) {
    context.addIssue({ code: "custom", path: ["expiresAt"], message: "Expiry must be after creation and no more than 24 hours later." });
  }
});

export function validateCouncilTaskEnvelope(input, { now = new Date() } = {}) {
  const parsed = envelopeSchema.safeParse(input);
  if (!parsed.success) return parsed;
  if (Date.parse(parsed.data.expiresAt) <= now.getTime()) {
    return {
      success: false,
      error: new z.ZodError([{
        code: "custom",
        path: ["expiresAt"],
        message: "Envelope has expired.",
        input: parsed.data.expiresAt,
      }]),
    };
  }
  return parsed;
}

export const COUNCIL_TASK_ENVELOPE_VERSION = "1.0.0";
