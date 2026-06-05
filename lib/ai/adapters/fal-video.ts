import { fal } from "@fal-ai/client";
import type { VideoGenerationInput } from "../video";

// fal.ai client authenticates automatically via the FAL_KEY env variable

export async function generateVideoWithFal(
  input: VideoGenerationInput
): Promise<{ videoUrl: string; externalId: string }> {
  const falInput: Record<string, any> = {
    prompt: input.prompt,
    duration: input.duration,
  };

  // image-to-video: convert base64 to URL
  // fal.ai accepts URLs, not base64. Use fal.storage.upload or pass a data URI directly.
  if (input.image) {
    falInput.image_url = input.image;
  }

  // Advanced parameters
  if (input.aspectRatio) falInput.aspect_ratio = input.aspectRatio;
  if (input.resolution) falInput.resolution = input.resolution;
  if (input.negativePrompt) falInput.negative_prompt = input.negativePrompt;
  if (input.cfgScale !== undefined) falInput.cfg_scale = input.cfgScale;
  if (input.generateAudio !== undefined) falInput.generate_audio = input.generateAudio;
  if (input.cameraFixed !== undefined) falInput.camera_fixed = input.cameraFixed;
  if (input.seed !== undefined) falInput.seed = input.seed;

  if (!input.webhookUrl) {
    throw new Error("fal.ai adapter requires a webhookUrl (WEBHOOK_BASE_URL is not configured)");
  }

  // Submit to queue with webhook — returns immediately, result delivered via callback
  const result = await fal.queue.submit(input.modelId, {
    input: falInput,
    webhookUrl: input.webhookUrl,
  });

  return {
    videoUrl: "", // Filled by webhook handler
    externalId: result.request_id,
  };
}
