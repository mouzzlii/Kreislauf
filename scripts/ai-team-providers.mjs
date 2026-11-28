export const VERCEL_AI_GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/chat/completions";

export const COUNCIL_MODELS = Object.freeze({
  gpt: "vmc/council-gpt",
  claude: "vmc/council-claude",
  gemini: "vmc/council-gemini",
  grok: "vmc/council-grok",
});

// Canonical targets read from the active Vercel Gateway virtual-model configs.
// Chat Completions response.model reports the model that actually served the request.
export const COUNCIL_MODEL_TARGETS = Object.freeze({
  gpt: "openai/gpt-5",
  claude: "anthropic/claude-sonnet-4.6",
  gemini: "google/gemini-3-flash",
  grok: "spacexai/grok-4.7",
});

export function validateGatewayResponseModel(response, expectedModel) {
  if (!expectedModel || !Object.values(COUNCIL_MODEL_TARGETS).includes(expectedModel)) {
    throw new Error("Council expected model target is not allowlisted.");
  }
  if (typeof response?.model !== "string" || response.model.length === 0) {
    throw new Error("Gateway response is missing the resolved model identity.");
  }
  if (response.model !== expectedModel) {
    throw new Error(`Gateway resolved model mismatch: expected ${expectedModel}, received ${response.model}.`);
  }
  return response.model;
}

export function buildGatewayChatCompletion({ model, instructions, input, maxTokens }) {
  if (!Object.values(COUNCIL_MODELS).includes(model)) {
    throw new Error("Council model alias is not allowlisted.");
  }
  if (!Number.isInteger(maxTokens) || maxTokens < 1 || maxTokens > 2000) {
    throw new Error("Council output token limit is invalid.");
  }
  return {
    model,
    messages: [
      { role: "system", content: instructions },
      { role: "user", content: input },
    ],
    max_tokens: maxTokens,
    stream: false,
  };
}

export function extractGatewayText(response) {
  const content = response?.choices?.find((choice) => choice?.message)?.message?.content;
  if (typeof content === "string") return content.trim();
  if (!Array.isArray(content)) return "";
  return content
    .filter((part) => part?.type === "text" && typeof part.text === "string")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

export function getMissingProviderConfiguration(env) {
  const missingSecrets = [
    !env.AI_GATEWAY_API_KEY && "AI_GATEWAY_API_KEY",
    !env.AI_TEAM_REPO_READ_TOKEN && "AI_TEAM_REPO_READ_TOKEN",
  ].filter(Boolean);
  return { missingSecrets, missingVariables: [], missingModels: [] };
}
