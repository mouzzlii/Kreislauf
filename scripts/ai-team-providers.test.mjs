import assert from "node:assert/strict";
import { test } from "node:test";
import {
  COUNCIL_MODELS,
  VERCEL_AI_GATEWAY_URL,
  buildGatewayChatCompletion,
  extractGatewayResponseMetadata,
  extractGatewayText,
  getMissingProviderConfiguration,
} from "./ai-team-providers.mjs";

test("Council uses four fixed Vercel virtual-model aliases", () => {
  assert.equal(VERCEL_AI_GATEWAY_URL, "https://ai-gateway.vercel.sh/v1/chat/completions");
  assert.deepEqual(COUNCIL_MODELS, {
    gpt: "vmc/council-gpt",
    claude: "vmc/council-claude",
    gemini: "vmc/council-gemini",
    grok: "vmc/council-grok",
  });
});

test("Gateway request is bounded, non-streaming and uses independent messages", () => {
  assert.deepEqual(buildGatewayChatCompletion({
    model: COUNCIL_MODELS.gemini,
    instructions: "Review independently.",
    input: "Inspect this project.",
    maxTokens: 900,
  }), {
    model: "vmc/council-gemini",
    messages: [
      { role: "system", content: "Review independently." },
      { role: "user", content: "Inspect this project." },
    ],
    max_tokens: 900,
    stream: false,
  });
  assert.throws(() => buildGatewayChatCompletion({
    model: "openai/gpt-5", instructions: "x", input: "y", maxTokens: 100,
  }), /not allowlisted/);
  assert.throws(() => buildGatewayChatCompletion({
    model: COUNCIL_MODELS.gpt, instructions: "x", input: "y", maxTokens: 5000,
  }), /token limit/);
});

test("Gateway response extraction accepts text and rejects empty/non-text responses", () => {
  assert.equal(extractGatewayText({
    choices: [{ message: { content: "  independent finding  " } }],
  }), "independent finding");
  assert.equal(extractGatewayText({
    choices: [{ message: { content: [
      { type: "text", text: "First." },
      { type: "image", url: "ignored" },
      { type: "text", text: "Second." },
    ] } }],
  }), "First.\nSecond.");
  assert.equal(extractGatewayText({ choices: [] }), "");
});

test("only Gateway key and read-only repository token are required", () => {
  assert.deepEqual(getMissingProviderConfiguration({}), {
    missingSecrets: ["AI_GATEWAY_API_KEY", "AI_TEAM_REPO_READ_TOKEN"],
    missingVariables: [],
    missingModels: [],
  });
  assert.deepEqual(getMissingProviderConfiguration({
    AI_GATEWAY_API_KEY: "configured",
    AI_TEAM_REPO_READ_TOKEN: "readonly",
  }), {
    missingSecrets: [],
    missingVariables: [],
    missingModels: [],
  });
});

test("Gateway response audit records only returned identity and numeric usage", () => {
  assert.deepEqual(extractGatewayResponseMetadata({
    id: "chatcmpl-test-123",
    model: "openai/gpt-5",
    provider: "openai",
    usage: { prompt_tokens: 120, completion_tokens: 80, total_tokens: 200 },
  }, "vmc/council-gpt"), {
    requestedAlias: "vmc/council-gpt",
    responseId: "chatcmpl-test-123",
    returnedModel: "openai/gpt-5",
    providerReported: "openai",
    usage: { promptTokens: 120, completionTokens: 80, totalTokens: 200 },
  });
  assert.deepEqual(extractGatewayResponseMetadata({ id: 12, usage: { prompt_tokens: "10", total_tokens: -1 } }, "vmc/council-claude"), {
    requestedAlias: "vmc/council-claude",
    responseId: null,
    returnedModel: null,
    providerReported: null,
    usage: { promptTokens: null, completionTokens: null, totalTokens: null },
  });
});
