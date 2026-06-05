import { getImageModel, validateProviderKey } from "@/config/ai-providers";
import { google } from "@ai-sdk/google";
import { type DataContent, generateImage, generateText } from "ai";
import { generateImageWithKIE } from "./adapters/kie-image";

export interface ImageGenerationInput {
  prompt: string;
  provider: string;
  modelId: string;
  size?: string;
  sourceImage?: string;
  generationMethod?: "standard" | "gemini";
  aspectRatio?: string;
  seed?: number;
  negativePrompt?: string;
  guidanceScale?: number;
  inferenceSteps?: number;
  strength?: number;
  outputFormat?: string;
  quality?: string;
  background?: string;
  resolution?: string;
}

export interface ImageGenerationResult {
  imageUrl: string;
  mimeType: string;
}

/**
 * Build provider-specific options from the unified input fields.
 */
type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };
type JSONObject = Record<string, JSONValue | undefined>;

function buildProviderOptions(
  input: ImageGenerationInput
): Record<string, JSONObject> | undefined {
  const opts: Record<string, JSONObject> = {};

  if (input.provider === "openai") {
    const openaiOpts: JSONObject = {};
    if (input.quality) openaiOpts.quality = input.quality;
    if (input.background) openaiOpts.background = input.background;
    if (input.outputFormat) openaiOpts.output_format = input.outputFormat;
    if (Object.keys(openaiOpts).length > 0) opts.openai = openaiOpts;
  }

  if (input.provider === "replicate") {
    const repOpts: JSONObject = {};
    if (input.negativePrompt)
      repOpts.negative_prompt = input.negativePrompt;
    if (input.guidanceScale !== undefined)
      repOpts.guidance = input.guidanceScale;
    if (input.inferenceSteps !== undefined)
      repOpts.num_inference_steps = input.inferenceSteps;
    if (input.outputFormat) repOpts.output_format = input.outputFormat;
    if (input.strength !== undefined)
      repOpts.prompt_strength = input.strength;
    if (input.sourceImage) repOpts.image = input.sourceImage;
    if (Object.keys(repOpts).length > 0) opts.replicate = repOpts;
  }

  if (input.provider === "fal") {
    const falOpts: JSONObject = {};
    if (input.negativePrompt)
      falOpts.negative_prompt = input.negativePrompt;
    if (input.guidanceScale !== undefined)
      falOpts.guidance_scale = input.guidanceScale;
    if (input.inferenceSteps !== undefined)
      falOpts.num_inference_steps = input.inferenceSteps;
    if (input.outputFormat) falOpts.output_format = input.outputFormat;
    if (input.strength !== undefined) falOpts.strength = input.strength;
    if (input.sourceImage) falOpts.image_url = input.sourceImage;
    if (Object.keys(falOpts).length > 0) opts.fal = falOpts;
  }

  if (input.provider === "xai") {
    const xaiOpts: JSONObject = {};
    if (input.outputFormat) xaiOpts.output_format = input.outputFormat;
    if (Object.keys(xaiOpts).length > 0) opts.xai = xaiOpts;
  }

  return Object.keys(opts).length > 0 ? opts : undefined;
}

/**
 * Extract base64 data from a data URI.
 * "data:image/png;base64,xxx" → "xxx"
 */
function extractBase64(dataUri: string): string {
  const idx = dataUri.indexOf("base64,");
  return idx >= 0 ? dataUri.slice(idx + 7) : dataUri;
}

/**
 * Unified image generation entry point.
 * Automatically routes between standard (generateImage), gemini (generateText), and kie (custom adapter) paths.
 */
export async function generateImageUnified(
  input: ImageGenerationInput
): Promise<ImageGenerationResult> {
  const keyCheck = validateProviderKey(input.provider);
  if (!keyCheck.valid) throw new Error(keyCheck.error);

  // KIE path: use custom adapter for async task-based API
  if (input.provider === "kie") {
    return generateImageWithKIE(input);
  }

  // Gemini special path: generate images via generateText with multimodal output
  if (input.generationMethod === "gemini") {
    return generateImageWithGemini(input);
  }

  // Standard path: via AI SDK generateImage
  const imageModel = getImageModel(input.provider, input.modelId);
  const providerOptions = buildProviderOptions(input);

  // OpenAI uses `size` (pixel dimensions), not `aspectRatio`.
  let size = input.size as `${number}x${number}` | undefined;
  let aspectRatio = input.aspectRatio as `${number}:${number}` | undefined;

  if (input.provider === "openai" && input.aspectRatio && !input.size) {
    const openaiSizeMap: Record<string, string> = {
      "1:1": "1024x1024",
      "3:2": "1536x1024",
      "2:3": "1024x1536",
    };
    size = (openaiSizeMap[input.aspectRatio] ?? "1024x1024") as `${number}x${number}`;
    aspectRatio = undefined;
  }

  // Build prompt — for OpenAI/xAI I2I, use the object form { images, text }
  // so the SDK auto-routes to /images/edits
  let prompt: string | { images: Array<DataContent>; text?: string } = input.prompt;
  if (
    input.sourceImage &&
    (input.provider === "openai" || input.provider === "xai")
  ) {
    prompt = {
      images: [extractBase64(input.sourceImage)],
      text: input.prompt,
    };
  }

  const { images } = await generateImage({
    model: imageModel,
    prompt,
    size,
    aspectRatio,
    seed: input.seed,
    n: 1,
    providerOptions,
  });

  if (!images?.length) {
    throw new Error("No image generated.");
  }

  return {
    imageUrl: `data:${images[0].mediaType || "image/png"};base64,${images[0].base64}`,
    mimeType: images[0].mediaType || "image/png",
  };
}

/**
 * Gemini Image Generation.
 * Uses generateText + responseModalities: ["IMAGE"].
 * Supports I2I: pass the reference image as an image part in messages content.
 */
async function generateImageWithGemini(
  input: ImageGenerationInput
): Promise<ImageGenerationResult> {
  const googleOpts: JSONObject = {
    responseModalities: ["TEXT", "IMAGE"],
  };

  const imageConfig: Record<string, string> = {};
  if (input.aspectRatio) imageConfig.aspectRatio = input.aspectRatio;
  if (input.resolution) imageConfig.imageSize = input.resolution;
  if (Object.keys(imageConfig).length > 0) {
    googleOpts.imageConfig = imageConfig;
  }

  // Build messages — if sourceImage is present, include it as an image part
  type ContentPart =
    | { type: "text"; text: string }
    | { type: "image"; image: string; mediaType?: string };

  const parts: ContentPart[] = [{ type: "text", text: input.prompt }];

  if (input.sourceImage) {
    // Extract mime type from data URI
    const mimeMatch = input.sourceImage.match(/^data:(image\/\w+);/);
    const mediaType = mimeMatch?.[1] || "image/png";

    parts.unshift({
      type: "image",
      image: extractBase64(input.sourceImage),
      mediaType,
    });
  }

  const { files } = await generateText({
    model: google(input.modelId),
    messages: [{ role: "user", content: parts }],
    providerOptions: { google: googleOpts },
  });

  if (!files?.length) {
    throw new Error("Gemini did not return any image.");
  }

  const imageFile = files[0];

  return {
    imageUrl: `data:${imageFile.mediaType};base64,${imageFile.base64}`,
    mimeType: imageFile.mediaType,
  };
}
