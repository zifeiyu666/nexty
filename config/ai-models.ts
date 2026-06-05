// ============================================================
// Model Registry
// ============================================================
// To add a new model, simply append a config object to the corresponding array.
// The provider field must match a provider id defined in ai-providers.ts.
// ============================================================

// ------ Language Models ------

export interface LanguageModelConfig {
  provider: string;
  id: string;
  name: string;
  inputSupport: ("text" | "image" | "audio")[];
  outputSupport: ("text" | "reasoning")[];
}

export const LANGUAGE_MODELS: LanguageModelConfig[] = [
  // OpenAI
  { provider: "openai", id: "gpt-4o-mini", name: "GPT-4o Mini", inputSupport: ["text", "image"], outputSupport: ["text"] },
  { provider: "openai", id: "gpt-4o", name: "GPT-4o", inputSupport: ["text", "image"], outputSupport: ["text"] },
  { provider: "openai", id: "o3", name: "o3", inputSupport: ["text", "image"], outputSupport: ["text", "reasoning"] },
  { provider: "openai", id: "o4-mini", name: "o4 Mini", inputSupport: ["text", "image"], outputSupport: ["text", "reasoning"] },

  // Anthropic
  { provider: "anthropic", id: "claude-opus-4-6", name: "Claude Opus 4.6", inputSupport: ["text", "image"], outputSupport: ["text"] },
  { provider: "anthropic", id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6", inputSupport: ["text", "image"], outputSupport: ["text"] },
  { provider: "anthropic", id: "claude-3-7-sonnet-20250219", name: "Claude 3.7 Sonnet", inputSupport: ["text", "image"], outputSupport: ["text", "reasoning"] },
  { provider: "anthropic", id: "claude-haiku-4-5", name: "Claude Haiku 4.5", inputSupport: ["text", "image"], outputSupport: ["text"] },

  // Google
  { provider: "google", id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", inputSupport: ["text", "image"], outputSupport: ["text", "reasoning"] },
  { provider: "google", id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", inputSupport: ["text", "image"], outputSupport: ["text", "reasoning"] },

  // DeepSeek
  { provider: "deepseek", id: "deepseek-chat", name: "DeepSeek V3.2", inputSupport: ["text"], outputSupport: ["text"] },
  { provider: "deepseek", id: "deepseek-reasoner", name: "DeepSeek R1", inputSupport: ["text"], outputSupport: ["text", "reasoning"] },

  // xAI
  { provider: "xai", id: "grok-4", name: "Grok 4", inputSupport: ["text", "image"], outputSupport: ["text"] },
  { provider: "xai", id: "grok-3", name: "Grok 3", inputSupport: ["text"], outputSupport: ["text"] },
  { provider: "xai", id: "grok-3-mini", name: "Grok 3 Mini", inputSupport: ["text"], outputSupport: ["text", "reasoning"] },

  // OpenRouter
  { provider: "openrouter", id: "openai/o4-mini", name: "o4 Mini (OpenRouter)", inputSupport: ["text"], outputSupport: ["text", "reasoning"] },
  { provider: "openrouter", id: "openai/gpt-4o", name: "GPT-4o (OpenRouter)", inputSupport: ["text", "image"], outputSupport: ["text"] },
  { provider: "openrouter", id: "anthropic/claude-opus-4-6", name: "Claude Opus 4.6 (OpenRouter)", inputSupport: ["text", "image"], outputSupport: ["text"] },
  { provider: "openrouter", id: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro (OpenRouter)", inputSupport: ["text", "image"], outputSupport: ["text", "reasoning"] },
];

// ------ Custom OpenAI-Compatible Models ------
// Parsed from NEXT_PUBLIC_CUSTOM_OPENAI_MODELS env var.
// Format: "model-id:Display Name,model-id-2:Display Name 2"
// If no display name is provided, the model id is used as the name.
function parseCustomOpenAIModels(): LanguageModelConfig[] {
  const raw = process.env.NEXT_PUBLIC_CUSTOM_OPENAI_MODELS;
  if (!raw) return [];
  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const colonIdx = entry.indexOf(":");
      const id = colonIdx > -1 ? entry.slice(0, colonIdx) : entry;
      const name = colonIdx > -1 ? entry.slice(colonIdx + 1) : entry;
      return {
        provider: "custom-openai",
        id,
        name,
        inputSupport: ["text"] as LanguageModelConfig["inputSupport"],
        outputSupport: ["text"] as LanguageModelConfig["outputSupport"],
      };
    });
}

LANGUAGE_MODELS.push(...parseCustomOpenAIModels());

// ------ Image Models ------

export interface ImageModelCapabilities {
  imageToImage?: boolean;
  aspectRatios?: string[];
  sizes?: string[];
  /** Resolution presets, e.g. ["1K","2K","4K"] for Gemini */
  resolutions?: string[];
  quality?: string[];
  background?: string[];
  outputFormats?: string[];
  seed?: boolean;
  negativePrompt?: boolean;
  guidanceScale?: [number, number, number];
  inferenceSteps?: [number, number, number];
  strength?: [number, number, number];
  /** API field name used to pass the source image (provider-specific) */
  imageInputField?: string;
  /** Whether the imageInputField expects an array of URLs */
  imageInputIsArray?: boolean;
}

export interface ImageModelConfig {
  provider: string;
  id: string;
  name: string;
  generationMethod?: "standard" | "gemini";
  capabilities: ImageModelCapabilities;
}

export const IMAGE_MODELS: ImageModelConfig[] = [
  // OpenAI
  {
    provider: "openai", id: "gpt-image-1", name: "GPT Image 1.5",
    capabilities: {
      imageToImage: true,
      aspectRatios: ["1:1", "3:2", "2:3"],
      quality: ["low", "medium", "high"],
      background: ["auto", "opaque", "transparent"],
      outputFormats: ["png", "jpeg", "webp"],
    },
  },
  // Google (special path via generateText + responseModalities)
  {
    provider: "google", id: "gemini-3.1-flash-image-preview", name: "Nano Banana 2",
    generationMethod: "gemini",
    capabilities: {
      imageToImage: true,
      aspectRatios: ["1:1", "1:4", "1:8", "2:3", "3:2", "3:4", "4:1", "4:3", "4:5", "5:4", "8:1", "9:16", "16:9", "21:9"],
      resolutions: ["512px", "1K", "2K", "4K"],
    },
  },
  {
    provider: "google", id: "gemini-3-pro-image-preview", name: "Nano Banana Pro",
    generationMethod: "gemini",
    capabilities: {
      imageToImage: true,
      aspectRatios: ["1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"],
      resolutions: ["1K", "2K", "4K"],
    },
  },
  // xAI
  {
    provider: "xai", id: "grok-2-image", name: "Grok 2 Image",
    capabilities: {
      imageToImage: true,
      aspectRatios: ["1:1", "4:3", "3:4", "3:2", "2:3", "16:9", "9:16", "2:1", "1:2"],
    },
  },
  // Replicate
  {
    provider: "replicate", id: "black-forest-labs/flux-schnell", name: "Flux Schnell (Replicate)",
    capabilities: {
      aspectRatios: ["1:1", "4:3", "3:4", "16:9", "9:16", "2:3", "3:2", "4:5", "5:4"],
      seed: true,
      outputFormats: ["webp", "jpg", "png"],
    },
  },
  {
    provider: "replicate", id: "black-forest-labs/flux-1.1-pro", name: "Flux 1.1 Pro (Replicate)",
    capabilities: {
      imageToImage: true,
      aspectRatios: ["1:1", "4:3", "3:4", "16:9", "9:16", "2:3", "3:2", "4:5", "5:4"],
      seed: true,
      strength: [0, 1, 0.8],
      outputFormats: ["webp", "jpg", "png"],
    },
  },
  // fal.ai
  {
    provider: "fal", id: "fal-ai/flux/schnell", name: "Flux Schnell (fal.ai)",
    capabilities: {
      imageToImage: true,
      sizes: ["512x512", "768x768", "1024x1024"],
      seed: true,
      guidanceScale: [1, 20, 3.5],
      inferenceSteps: [1, 50, 4],
      strength: [0.01, 1, 0.95],
      outputFormats: ["jpeg", "png"],
    },
  },
  {
    provider: "fal", id: "fal-ai/flux-pro/v1.1", name: "Flux Pro 1.1 (fal.ai)",
    capabilities: {
      sizes: ["512x512", "768x768", "1024x1024"],
      seed: true,
      guidanceScale: [1, 20, 3.5],
      inferenceSteps: [1, 50, 28],
      outputFormats: ["jpeg", "png"],
    },
  },
  {
    provider: "fal", id: "fal-ai/flux/dev/image-to-image", name: "Flux Dev I2I (fal.ai)",
    capabilities: {
      imageToImage: true,
      seed: true,
      guidanceScale: [1, 20, 3.5],
      inferenceSteps: [10, 50, 40],
      strength: [0.01, 1, 0.95],
      outputFormats: ["jpeg", "png"],
    },
  },

  // KIE - Image Models
  {
    provider: "kie", id: "nano-banana-pro", name: "Nano Banana Pro (KIE)",
    capabilities: {
      imageToImage: true,
      aspectRatios: ["1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"],
      resolutions: ["1K", "2K", "4K"],
      outputFormats: ["png", "jpg"],
      imageInputField: "image_input",
      imageInputIsArray: true,
    },
  },
  {
    provider: "kie", id: "z-image", name: "Z-Image (KIE)",
    capabilities: {
      aspectRatios: ["1:1", "4:3", "3:4", "16:9", "9:16"],
    },
  },
];

// ------ Video Models ------

export interface VideoModelCapabilities {
  aspectRatios?: string[];
  resolutions?: string[];
  negativePrompt?: boolean;
  cfgScale?: [number, number, number]; // [min, max, default]
  generateAudio?: boolean;
  generateAudioDefault?: boolean;
  cameraFixed?: boolean;
  seed?: boolean;
}

export interface VideoModelConfig {
  provider: string;
  id: string;
  name: string;
  type: "text-to-video" | "image-to-video";
  supportedDurations: number[];
  /** Maximum wait time in seconds. Used for polling timeout. */
  maxWaitSeconds: number;
  capabilities: VideoModelCapabilities;
}

export const VIDEO_MODELS: VideoModelConfig[] = [
  // --- Text-to-Video ---
  {
    provider: "replicate", id: "kwaivgi/kling-v2.5-turbo-pro", name: "Kling 2.5 Turbo Pro (Replicate)",
    type: "text-to-video", supportedDurations: [5, 10], maxWaitSeconds: 600,
    capabilities: { aspectRatios: ["16:9", "9:16", "1:1"], negativePrompt: true, cfgScale: [0, 1, 0.5] },
  },
  {
    provider: "replicate", id: "bytedance/seedance-1.5-pro", name: "Seedance 1.5 Pro (Replicate)",
    type: "text-to-video", supportedDurations: [5, 10], maxWaitSeconds: 600,
    capabilities: { aspectRatios: ["21:9", "16:9", "4:3", "1:1", "3:4", "9:16"], resolutions: ["480p", "720p"], generateAudio: true, generateAudioDefault: true, cameraFixed: true, seed: true },
  },
  {
    provider: "fal", id: "fal-ai/kling-video/v2.6/pro/text-to-video", name: "Kling 2.6 Pro (fal.ai)",
    type: "text-to-video", supportedDurations: [5, 10], maxWaitSeconds: 600,
    capabilities: { aspectRatios: ["16:9", "9:16", "1:1"], negativePrompt: true, cfgScale: [0, 1, 0.5], generateAudio: true },
  },
  {
    provider: "fal", id: "fal-ai/bytedance/seedance/v1.5/pro/text-to-video", name: "Seedance 1.5 Pro (fal.ai)",
    type: "text-to-video", supportedDurations: [5, 10], maxWaitSeconds: 600,
    capabilities: { aspectRatios: ["21:9", "16:9", "4:3", "1:1", "3:4", "9:16"], resolutions: ["480p", "720p"], generateAudio: true, generateAudioDefault: true, cameraFixed: true, seed: true },
  },
  {
    provider: "fal", id: "fal-ai/wan/v2.6/text-to-video", name: "Wan 2.6 (fal.ai)",
    type: "text-to-video", supportedDurations: [5, 10, 15], maxWaitSeconds: 600,
    capabilities: { aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"], resolutions: ["720p", "1080p"], negativePrompt: true, seed: true },
  },

  // --- Image-to-Video ---
  {
    provider: "replicate", id: "kwaivgi/kling-v2.6", name: "Kling 2.6 (Replicate)",
    type: "image-to-video", supportedDurations: [5, 10], maxWaitSeconds: 600,
    capabilities: { aspectRatios: ["16:9", "9:16", "1:1"], negativePrompt: true, generateAudio: true },
  },
  {
    provider: "replicate", id: "bytedance/seedance-1.5-pro", name: "Seedance 1.5 Pro (Replicate)",
    type: "image-to-video", supportedDurations: [5, 10], maxWaitSeconds: 600,
    capabilities: { aspectRatios: ["21:9", "16:9", "4:3", "1:1", "3:4", "9:16"], resolutions: ["480p", "720p"], generateAudio: true, generateAudioDefault: true, cameraFixed: true, seed: true },
  },
  {
    provider: "fal", id: "fal-ai/kling-video/v2.6/pro/image-to-video", name: "Kling 2.6 Pro (fal.ai)",
    type: "image-to-video", supportedDurations: [5, 10], maxWaitSeconds: 600,
    capabilities: { negativePrompt: true, generateAudio: true },
  },
  {
    provider: "fal", id: "fal-ai/bytedance/seedance/v1.5/pro/image-to-video", name: "Seedance 1.5 Pro (fal.ai)",
    type: "image-to-video", supportedDurations: [5, 10], maxWaitSeconds: 600,
    capabilities: { aspectRatios: ["21:9", "16:9", "4:3", "1:1", "3:4", "9:16"], resolutions: ["480p", "720p"], generateAudio: true, generateAudioDefault: true, cameraFixed: true, seed: true },
  },
  {
    provider: "fal", id: "fal-ai/wan/v2.6/image-to-video", name: "Wan 2.6 (fal.ai)",
    type: "image-to-video", supportedDurations: [5, 10, 15], maxWaitSeconds: 600,
    capabilities: { resolutions: ["720p", "1080p"], negativePrompt: true, seed: true },
  },

  // KIE - Video Models
  {
    provider: "kie", id: "kling-2.6/text-to-video", name: "Kling 2.6 (KIE)",
    type: "text-to-video", supportedDurations: [5, 10], maxWaitSeconds: 600,
    capabilities: { aspectRatios: ["16:9", "9:16", "1:1"], negativePrompt: true, cfgScale: [0, 1, 0.5], generateAudio: true },
  },
  {
    provider: "kie", id: "grok-imagine/text-to-video", name: "Grok Imagine (KIE)",
    type: "text-to-video", supportedDurations: [6, 10], maxWaitSeconds: 600,
    capabilities: { aspectRatios: ["2:3", "3:2", "1:1", "16:9", "9:16"], resolutions: ["480p", "720p"] },
  },
  {
    provider: "kie", id: "kling-2.6/image-to-video", name: "Kling 2.6 (KIE)",
    type: "image-to-video", supportedDurations: [5, 10], maxWaitSeconds: 600,
    capabilities: { generateAudio: true },
  },
  {
    provider: "kie", id: "grok-imagine/image-to-video", name: "Grok Imagine (KIE)",
    type: "image-to-video", supportedDurations: [6, 10], maxWaitSeconds: 600,
    capabilities: { resolutions: ["480p", "720p"] },
  },
];

// ============================================================
// Helper: Filter models by type
// ============================================================
export function getVideoModelsByType(type: "text-to-video" | "image-to-video") {
  return VIDEO_MODELS.filter((m) => m.type === type);
}

/** Group models by provider (used for grouped display in the frontend ModelSelector) */
export function groupModelsByProvider<T extends { provider: string }>(
  models: T[]
): Record<string, T[]> {
  return models.reduce(
    (acc, model) => {
      if (!acc[model.provider]) acc[model.provider] = [];
      acc[model.provider].push(model);
      return acc;
    },
    {} as Record<string, T[]>
  );
}
