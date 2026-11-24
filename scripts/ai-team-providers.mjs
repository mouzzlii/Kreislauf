export const ANTHROPIC_API_VERSION = "2026-10-21";

export function buildClaudeMessage({ model, instructions, input, maxTokens }) {
  return {
    model,
    max_tokens: maxTokens,
    system: instructions,
    messages: [{ role: "user", content: input }],
  };
}

export function extractClaudeText(response) {
  return (Array.isArray(response?.content) ? response.content : [])
    .filter((part) => part?.type === "text" && typeof part.text === "string")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

export function buildMetaChatCompletion({ model, instructions, input, maxTokens }) {
  return {
    model,
    messages: [
      { role: "system", content: instructions },
      { role: "user", content: input },
    ],
    max_completion_tokens: maxTokens,
    stream: false,
  };
}

export function buildLlamaChatCompletion({ model, instructions, input, maxTokens }) {
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

export function extractChatCompletionText(response) {
  const content = response?.choices?.find((choice) => choice?.message)?.message?.content;
  if (typeof content === "string") return content.trim();
  if (!Array.isArray(content)) return "";
  return content
    .filter((part) => part?.type === "text" && typeof part.text === "string")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

export const extractMetaText = extractChatCompletionText;
export const extractLlamaText = extractChatCompletionText;

export function isSecureLlamaEndpoint(value) {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.hash &&
      url.pathname.replace(/\/+$/, "").endsWith("/v1/chat/completions");
  } catch {
    return false;
  }
}

export function getMissingProviderConfiguration(env) {
  const thirdProvider = String(env.AI_TEAM_THIRD_PROVIDER || "").trim().toLowerCase();
  const missingSecrets = [
    !env.OPENAI_API_KEY && "OPENAI_API_KEY",
    !env.ANTHROPIC_API_KEY && "ANTHROPIC_API_KEY",
    !env.AI_TEAM_REPO_READ_TOKEN && "AI_TEAM_REPO_READ_TOKEN",
    !["meta", "llama"].includes(thirdProvider) && "AI_TEAM_THIRD_PROVIDER (muss meta oder llama sein)",
  ].filter(Boolean);
  const missingModels = [
    !env.OPENAI_MODEL && "OPENAI_MODEL",
    !env.CLAUDE_MODEL && "CLAUDE_MODEL",
  ].filter(Boolean);

  if (thirdProvider === "meta") {
    if (!env.META_MODEL_API_KEY) missingSecrets.push("META_MODEL_API_KEY");
    if (!env.META_MODEL) missingModels.push("META_MODEL");
  } else if (thirdProvider === "llama") {
    if (!env.LLAMA_API_KEY) missingSecrets.push("LLAMA_API_KEY");
    if (!env.LLAMA_API_BASE_URL) missingSecrets.push("LLAMA_API_BASE_URL");
    if (!env.LLAMA_MODEL) missingModels.push("LLAMA_MODEL");
    if (env.LLAMA_API_BASE_URL && !isSecureLlamaEndpoint(env.LLAMA_API_BASE_URL)) {
      missingSecrets.push("LLAMA_API_BASE_URL (muss eine HTTPS-URL mit /v1/chat/completions sein)");
    }
  }
  return { missingSecrets, missingModels };
}
