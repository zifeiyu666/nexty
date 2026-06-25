import { after } from "next/server";
import { generateVideoWithFal } from "./adapters/fal-video";
import { generateVideoWithKIE } from "./adapters/kie-video";
import { generateVideoWithReplicate } from "./adapters/replicate-video";
import { taskStore } from "./task-store";

export interface VideoGenerationInput {
  prompt: string;
  provider: string;
  modelId: string;
  duration: number;
  image?: string;
  webhookUrl?: string;
  aspectRatio?: string;
  resolution?: string;
  negativePrompt?: string;
  cfgScale?: number;
  generateAudio?: boolean;
  cameraFixed?: boolean;
  seed?: number;
  mode?: string;
  // TODO [Auth]: Add userId to track ownership of tasks.
  //   userId?: string;
  //   Pass from the API route: const session = await getSession(); userId: session.user.id
}

export interface VideoGenerationTask {
  taskId: string;
  status: "pending" | "processing" | "succeeded" | "failed";
  provider: string;
  modelId: string;
  // Original job ID from the platform (Replicate prediction ID / fal request ID / KIE taskId).
  externalId: string;
  videoUrl?: string;
  error?: string;
  createdAt: number;
  updatedAt: number;
  // TODO [Auth]: Add userId to enable ownership checks and user-specific task history.
  //   userId?: string;
}

/**
 * Submit a video generation task (async).
 * Returns a taskId that callers can use to query video task status.
 */
export async function submitVideoGeneration(
  input: VideoGenerationInput
): Promise<{ taskId: string }> {
  const taskId = crypto.randomUUID();
  const task: VideoGenerationTask = {
    taskId,
    status: "pending",
    provider: input.provider,
    modelId: input.modelId,
    externalId: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await taskStore.set(taskId, task);

  // Dispatch to the corresponding adapter (runs async, does not block the response).
  // `after` ensures the serverless function stays alive until this completes,
  // even after the HTTP response has been sent — critical for webhook correlation.
  after(
    processVideoGeneration(taskId, input).catch(async (error) => {
      await taskStore.update(taskId, {
        status: "failed",
        error: error.message,
      });
    })
  );

  return { taskId };
}

/**
 * Query the status of a video generation task.
 */
export async function getVideoTaskStatus(taskId: string): Promise<VideoGenerationTask | null> {
  return taskStore.get(taskId);
}

/**
 * Build the webhook callback URL for a given provider and task.
 * Requires WEBHOOK_BASE_URL env var (e.g. https://your-domain.com or ngrok URL for local dev).
 */
function buildWebhookUrl(provider: string, taskId: string): string {
  const base = process.env.WEBHOOK_BASE_URL?.replace(/\/+$/, '');
  if (!base) throw new Error("WEBHOOK_BASE_URL is not configured");
  switch (provider) {
    case "replicate":
      return `${base}/api/webhooks/replicate?taskId=${taskId}`;
    case "fal":
      return `${base}/api/webhooks/fal?taskId=${taskId}`;
    case "kie":
      return `${base}/api/webhooks/kie`;
    default:
      return "";
  }
}

/**
 * Internal: submit video generation task to provider (async, webhook-based).
 * All providers return immediately after submission; completion is notified via webhook.
 */
async function processVideoGeneration(
  taskId: string,
  input: VideoGenerationInput
): Promise<void> {
  await taskStore.update(taskId, { status: "processing" });

  const webhookUrl = buildWebhookUrl(input.provider, taskId);
  const inputWithWebhook: VideoGenerationInput = { ...input, webhookUrl };

  let result: { videoUrl: string; externalId: string };

  switch (input.provider) {
    case "replicate":
      result = await generateVideoWithReplicate(inputWithWebhook);
      break;
    case "fal":
      result = await generateVideoWithFal(inputWithWebhook);
      break;
    case "kie":
      result = await generateVideoWithKIE(inputWithWebhook);
      break;
    default:
      throw new Error(`Unsupported video provider: ${input.provider}`);
  }

  // Register external → internal ID mapping (used by webhook callbacks)
  if (result.externalId) {
    await taskStore.setExternalId(result.externalId, taskId);
    await taskStore.update(taskId, { externalId: result.externalId });
  }
  // Task stays "processing" — webhook handler will mark it succeeded/failed.
}
