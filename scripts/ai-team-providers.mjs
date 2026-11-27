export const VERCEL_AI_GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/chat/completions";

export const COUNCIL_MODELS = Object.freeze({
  gpt: "vmc/council-gpt",
  claude: "vmc/council-claude",
  gemini: "vmc/council-gemini",
  grok: "vmc/council-grok",
});

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

export function extractGatewayResponseMetadata(response, requestedAlias) {
  const usage = response?.usage;
  const tokenCount = (value) => Number.isSafeInteger(value) && value >= 0 ? value : null;
  return {
    requestedAlias: typeof requestedAlias === "string" ? requestedAlias : null,
    responseId: typeof response?.id === "string" ? response.id : null,
    returnedModel: typeof response?.model === "string" ? response.model : null,
    providerReported: typeof response?.provider === "string" ? response.provider : null,
    usage: {
      promptTokens: tokenCount(usage?.prompt_tokens),
      completionTokens: tokenCount(usage?.completion_tokens),
      totalTokens: tokenCount(usage?.total_tokens),
    },
  };
}
