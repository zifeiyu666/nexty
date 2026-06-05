import { anthropic } from "@ai-sdk/anthropic";
import { deepseek } from "@ai-sdk/deepseek";
import { fal } from "@ai-sdk/fal";
import { google } from "@ai-sdk/google";
import { createOpenAI, openai } from "@ai-sdk/openai";
import { replicate } from "@ai-sdk/replicate";
import { xai } from "@ai-sdk/xai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

// ============================================================
// Provider Registry
// ============================================================
// To add a new provider:
// 1. Install the corresponding @ai-sdk/xxx package
// 2. Add a new ProviderConfig entry in this file
// 3. Configure the API key in .env.local
// ============================================================

export interface ProviderConfig {
  /** Unique identifier (referenced in model configs) */
  id: string;
  /** Display name */
  name: string;
  /** Environment variable name (used for API key validation) */
  envKey: string;
  /** Supported capabilities */
  capabilities: ("chat" | "image" | "video")[];
  /** Returns a language model instance */
  languageModel?: (modelId: string) => any;
  /** Returns an image model instance */
  imageModel?: (modelId: string) => any;
  /**
   * Video generation is not handled via the AI SDK but through the adapter pattern.
   * Marking video: true here indicates the provider has video capability;
   * the concrete implementation lives in lib/ai/adapters/.
   */
}

export const AI_PROVIDERS: Record<string, ProviderConfig> = {
  openai: {
    id: "openai",
    name: "OpenAI",
    envKey: "OPENAI_API_KEY",
    capabilities: ["chat", "image"],
    languageModel: (modelId) => openai(modelId),
    imageModel: (modelId) => openai.image(modelId),
  },
  anthropic: {
    id: "anthropic",
    name: "Anthropic",
    envKey: "ANTHROPIC_API_KEY",
    capabilities: ["chat"],
    languageModel: (modelId) => anthropic(modelId),
  },
  google: {
    id: "google",
    name: "Google",
    envKey: "GOOGLE_GENERATIVE_AI_API_KEY",
    capabilities: ["chat", "image"],
    languageModel: (modelId) => google(modelId),
    // Gemini image generation is handled via languageModel + generateText, not imageModel.
    // See the gemini adapter in lib/ai/image.ts for implementation details.
  },
  deepseek: {
    id: "deepseek",
    name: "DeepSeek",
    envKey: "DEEPSEEK_API_KEY",
    capabilities: ["chat"],
    languageModel: (modelId) => deepseek(modelId),
  },
  xai: {
    id: "xai",
    name: "xAI",
    envKey: "XAI_API_KEY",
    capabilities: ["chat", "image"],
    languageModel: (modelId) => xai(modelId),
    imageModel: (modelId) => xai.image(modelId),
  },
  openrouter: {
    id: "openrouter",
    name: "OpenRouter",
    envKey: "OPENROUTER_API_KEY",
    capabilities: ["chat"],
    languageModel: (modelId) => {
      const provider = createOpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY!,
      });
      return provider.chat(modelId);
    },
  },
  replicate: {
    id: "replicate",
    name: "Replicate",
    envKey: "REPLICATE_API_TOKEN",
    capabilities: ["image", "video"],
    imageModel: (modelId) => replicate.image(modelId),
  },
  fal: {
    id: "fal",
    name: "fal.ai",
    envKey: "FAL_API_KEY",
    capabilities: ["image", "video"],
    imageModel: (modelId) => fal.image(modelId),
  },
  kie: {
    id: "kie",
    name: "KIE",
    envKey: "KIE_API_KEY",
    capabilities: ["image", "video"],
    // KIE image and video use custom adapters (lib/ai/adapters/kie-*.ts)
    // Uses unified jobs API: POST /api/v1/jobs/createTask
  },
  "custom-openai": {
    id: "custom-openai",
    name: "Custom OpenAI",
    envKey: "CUSTOM_OPENAI_API_KEY",
    capabilities: ["chat"],
    languageModel: (modelId) => {
      const provider = createOpenAI({
        baseURL: process.env.CUSTOM_OPENAI_BASE_URL,
        apiKey: process.env.CUSTOM_OPENAI_API_KEY,
      });
      return provider.chat(modelId); // Use /v1/chat/completions instead of /v1/responses
    },
  },
};

// ============================================================
// Helper: Validate whether a provider's API key is configured
// ============================================================
export function validateProviderKey(providerId: string): {
  valid: boolean;
  error?: string;
} {
  const provider = AI_PROVIDERS[providerId];
  if (!provider) {
    return { valid: false, error: `Unknown provider: ${providerId}` };
  }
  if (!process.env[provider.envKey]) {
    return {
      valid: false,
      error: `Missing API key: ${provider.envKey} is not configured for ${provider.name}.`,
    };
  }
  return { valid: true };
}

// ============================================================
// Helper: Get a language model instance
// ============================================================
export function getLanguageModel(providerId: string, modelId: string) {
  const provider = AI_PROVIDERS[providerId];
  if (!provider?.languageModel) {
    throw new Error(`Provider ${providerId} does not support chat.`);
  }
  const keyCheck = validateProviderKey(providerId);
  if (!keyCheck.valid) throw new Error(keyCheck.error);
  return provider.languageModel(modelId);
}

// ============================================================
// Helper: Get an image model instance
// ============================================================
export function getImageModel(providerId: string, modelId: string) {
  const provider = AI_PROVIDERS[providerId];
  if (!provider?.imageModel) {
    throw new Error(`Provider ${providerId} does not support image generation.`);
  }
  const keyCheck = validateProviderKey(providerId);
  if (!keyCheck.valid) throw new Error(keyCheck.error);
  return provider.imageModel(modelId);
}
