import Replicate from "replicate";
import type { VideoGenerationInput } from "../video";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function generateVideoWithReplicate(
  input: VideoGenerationInput
): Promise<{ videoUrl: string; externalId: string }> {
  const replicateInput: Record<string, any> = {
    prompt: input.prompt,
    duration: input.duration,
  };

  // image-to-video: add reference image
  if (input.image) {
    replicateInput.start_image = input.image;
  }

  // Advanced parameters
  if (input.aspectRatio) replicateInput.aspect_ratio = input.aspectRatio;
  if (input.negativePrompt) replicateInput.negative_prompt = input.negativePrompt;
  if (input.cfgScale !== undefined) replicateInput.cfg_scale = input.cfgScale;
  if (input.generateAudio !== undefined) replicateInput.generate_audio = input.generateAudio;
  if (input.cameraFixed !== undefined) replicateInput.camera_fixed = input.cameraFixed;
  if (input.seed !== undefined) replicateInput.seed = input.seed;

  if (!input.webhookUrl) {
    throw new Error("Replicate adapter requires a webhookUrl (WEBHOOK_BASE_URL is not configured)");
  }

  // Create prediction with webhook — returns immediately, result delivered via callback
  const prediction = await replicate.predictions.create({
    model: input.modelId as `${string}/${string}`,
    input: replicateInput,
    webhook: input.webhookUrl,
    webhook_events_filter: ["completed"],
  });

  if (prediction.status === "failed") {
    throw new Error(`Replicate prediction failed: ${prediction.error}`);
  }

  return {
    videoUrl: "", // Filled by webhook handler
    externalId: prediction.id,
  };
}
