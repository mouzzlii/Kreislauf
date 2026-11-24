import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ANTHROPIC_API_VERSION,
  buildClaudeMessage,
  buildMetaChatCompletion,
  buildLlamaChatCompletion,
  extractClaudeText,
  extractMetaText,
  extractLlamaText,
  getMissingProviderConfiguration,
  isSecureLlamaEndpoint,
} from "./ai-team-providers.mjs";

test("Claude Messages API request uses system instruction and a user message", () => {
  assert.equal(ANTHROPIC_API_VERSION, "2026-10-21");
  assert.deepEqual(buildClaudeMessage({
    model: "claude-model-id",
    instructions: "Check critically.",
    input: "Review this project.",
    maxTokens: 900,
  }), {
    model: "claude-model-id",
    max_tokens: 900,
    system: "Check critically.",
    messages: [{ role: "user", content: "Review this project." }],
  });
});

test("Claude response extraction keeps only text blocks", () => {
  assert.equal(extractClaudeText({
    content: [
      { type: "text", text: "First finding." },
      { type: "tool_use", id: "tool_1", name: "do_not_print" },
      { type: "text", text: "Second finding." },
    ],
  }), "First finding.\nSecond finding.");
  assert.equal(extractClaudeText({ content: [] }), "");
});

test("Meta Model API uses its hosted OpenAI-compatible Chat Completions endpoint shape", () => {
  assert.deepEqual(buildMetaChatCompletion({
    model: "muse-spark-1.3",
    instructions: "Challenge the proposal.",
    input: "Review this change.",
    maxTokens: 800,
  }), {
    model: "muse-spark-1.3",
    messages: [
      { role: "system", content: "Challenge the proposal." },
      { role: "user", content: "Review this change." },
    ],
    max_completion_tokens: 800,
    stream: false,
  });
  assert.equal(extractMetaText({
    choices: [{ message: { content: " Meta Muse review " } }],
  }), "Meta Muse review");
});

test("Llama OpenAI-compatible request is bounded and non-streaming", () => {
  assert.deepEqual(buildLlamaChatCompletion({
    model: "llama-model-id",
    instructions: "Challenge the proposal.",
    input: "Review this change.",
    maxTokens: 800,
  }), {
    model: "llama-model-id",
    messages: [
      { role: "system", content: "Challenge the proposal." },
      { role: "user", content: "Review this change." },
    ],
    max_tokens: 800,
    stream: false,
  });
});

test("Llama response extraction handles string and text-array choices", () => {
  assert.equal(extractLlamaText({
    choices: [{ message: { content: " Llama review " } }],
  }), "Llama review");
  assert.equal(extractLlamaText({
    choices: [{ message: { content: [
      { type: "text", text: "One." },
      { type: "image", url: "ignored" },
      { type: "text", text: "Two." },
    ] } }],
  }), "One.\nTwo.");
  assert.equal(extractLlamaText({ choices: [] }), "");
});

test("Llama endpoint must be an authenticated-provider-compatible HTTPS chat-completions URL", () => {
  assert.equal(isSecureLlamaEndpoint("https://inference.example.com/v1/chat/completions"), true);
  assert.equal(isSecureLlamaEndpoint("https://inference.example.com/openai/v1/chat/completions"), true);
  assert.equal(isSecureLlamaEndpoint("http://inference.example.com/v1/chat/completions"), false);
  assert.equal(isSecureLlamaEndpoint("https://user:pass@inference.example.com/v1/chat/completions"), false);
  assert.equal(isSecureLlamaEndpoint("https://inference.example.com/v1/chat/completions#fragment"), false);
  assert.equal(isSecureLlamaEndpoint("not-a-url"), false);
});

test("all three provider credentials, endpoint and selected model IDs are explicit", () => {
  const incomplete = getMissingProviderConfiguration({
    OPENAI_API_KEY: "present",
    ANTHROPIC_API_KEY: "",
    AI_TEAM_THIRD_PROVIDER: "llama",
    LLAMA_API_KEY: "present",
    LLAMA_API_BASE_URL: "http://host/v1/chat/completions",
    AI_TEAM_REPO_READ_TOKEN: "present",
    OPENAI_MODEL: "gpt-model",
    CLAUDE_MODEL: "",
    LLAMA_MODEL: "llama-model",
  });
  assert.deepEqual(incomplete.missingSecrets, [
    "ANTHROPIC_API_KEY",
    "LLAMA_API_BASE_URL (muss eine HTTPS-URL mit /v1/chat/completions sein)",
  ]);
  assert.deepEqual(incomplete.missingModels, ["CLAUDE_MODEL"]);

  const complete = getMissingProviderConfiguration({
    OPENAI_API_KEY: "openai",
    ANTHROPIC_API_KEY: "claude",
    AI_TEAM_THIRD_PROVIDER: "llama",
    LLAMA_API_KEY: "llama",
    LLAMA_API_BASE_URL: "https://llama.example.com/v1/chat/completions",
    AI_TEAM_REPO_READ_TOKEN: "readonly",
    OPENAI_MODEL: "gpt",
    CLAUDE_MODEL: "claude",
    LLAMA_MODEL: "llama",
  });
  assert.deepEqual(complete, { missingSecrets: [], missingModels: [] });
});
test("Meta mode requires its own key and explicit Muse model but no Llama host", () => {
  const missing = getMissingProviderConfiguration({
    OPENAI_API_KEY: "openai",
    ANTHROPIC_API_KEY: "claude",
    AI_TEAM_THIRD_PROVIDER: "meta",
    META_MODEL_API_KEY: "",
    AI_TEAM_REPO_READ_TOKEN: "readonly",
    OPENAI_MODEL: "gpt",
    CLAUDE_MODEL: "claude",
    META_MODEL: "",
  });
  assert.deepEqual(missing, {
    missingSecrets: ["META_MODEL_API_KEY"],
    missingModels: ["META_MODEL"],
  });

  const complete = getMissingProviderConfiguration({
    OPENAI_API_KEY: "openai",
    ANTHROPIC_API_KEY: "claude",
    AI_TEAM_THIRD_PROVIDER: "meta",
    META_MODEL_API_KEY: "meta",
    AI_TEAM_REPO_READ_TOKEN: "readonly",
    OPENAI_MODEL: "gpt",
    CLAUDE_MODEL: "claude",
    META_MODEL: "muse-spark-1.3",
  });
  assert.deepEqual(complete, { missingSecrets: [], missingModels: [] });
});

test("third-agent selection rejects unknown providers before any provider call", () => {
  const invalid = getMissingProviderConfiguration({
    OPENAI_API_KEY: "openai",
    ANTHROPIC_API_KEY: "claude",
    AI_TEAM_THIRD_PROVIDER: "unlisted",
    AI_TEAM_REPO_READ_TOKEN: "readonly",
    OPENAI_MODEL: "gpt",
    CLAUDE_MODEL: "claude",
  });
  assert.deepEqual(invalid.missingSecrets, [
    "AI_TEAM_THIRD_PROVIDER (muss meta oder llama sein)",
  ]);
  assert.deepEqual(invalid.missingModels, []);
});

