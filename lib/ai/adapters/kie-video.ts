/**
 * KIE Video Generation Adapter
 * Uses unified job creation API: POST /api/v1/jobs/createTask
 * Status polling via: GET /api/v1/jobs/recordInfo?taskId=xxx
 * Supports webhook callback via KIE_CALLBACK_URL env var.
 * Docs: https://docs.kie.ai/
 */

import { serverUploadFile } from "@/lib/cloudflare/r2";
import type { VideoGenerationInput } from "../video";

const KIE_BASE_URL = "https://api.kie.ai";

interface KIECreateTaskResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

interface KIERecordInfoResponse {
  code: number;
  message: string;
  data: {
    taskId: string;
    model: string;
    state: "waiting" | "queuing" | "generating" | "success" | "fail";
    resultJson?: string; // JSON string: { resultUrls: string[] }
    failCode?: string;
    failMsg?: string;
    costTime?: number;
    progress?: number;
  };
}

interface KIEVideoResult {
  videoUrl: string;
  externalId: string;
}

/**
 * Upload a base64 data URI to R2 and return a public URL.
 * If the input is already a URL (http/https), return it as-is.
 */
async function ensureImageUrl(imageData: string): Promise<string> {
  if (imageData.startsWith("http://") || imageData.startsWith("https://")) {
    return imageData;
  }

  const mimeMatch = imageData.match(/^data:(image\/\w+);base64,/);
  const contentType = mimeMatch?.[1] || "image/png";
  const ext = contentType.split("/")[1] || "png";

  const key = `kie-tmp/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { url } = await serverUploadFile({
    data: imageData,
    contentType,
    path: "",
    key,
  });

  return url;
}

/**
 * Submit video generation task to KIE.
 * If KIE_CALLBACK_URL is set, includes it as callBackUrl.
 */
async function submitVideoTask(
  input: VideoGenerationInput,
  apiKey: string
): Promise<string> {
  const url = `${KIE_BASE_URL}/api/v1/jobs/createTask`;

  const payload: Record<string, any> = {
    model: input.modelId,
    input: {
      prompt: input.prompt,
      duration: String(input.duration),
    },
  };

  if (input.webhookUrl) {
    payload.callBackUrl = input.webhookUrl;
  }

  // Pass through optional fields generically (no model-specific branching)
  if (input.aspectRatio) payload.input.aspect_ratio = input.aspectRatio;
  if (input.negativePrompt) payload.input.negative_prompt = input.negativePrompt;
  if (input.cfgScale !== undefined) payload.input.cfg_scale = input.cfgScale;
  // KIE API uses "sound" for the audio generation field across all models
  if (input.generateAudio !== undefined) payload.input.sound = input.generateAudio;
  if (input.resolution) payload.input.resolution = input.resolution;
  if (input.mode) payload.input.mode = input.mode;
  if (input.seed !== undefined) payload.input.seed = input.seed;

  // Add image for I2V — KIE requires `image_urls` with public URLs
  if (input.image) {
    const imageUrl = await ensureImageUrl(input.image);
    payload.input.image_urls = [imageUrl];
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`KIE API error: ${response.status} - ${error}`);
  }

  const result: KIECreateTaskResponse = await response.json();

  if (result.code !== 200) {
    throw new Error(`KIE API error: ${result.msg}`);
  }

  return result.data.taskId;
}


/**
 * Generate video with KIE.
 * Requires input.webhookUrl (built from WEBHOOK_BASE_URL) — submits the task and returns immediately.
 * The callback handler at /api/webhooks/kie will update the task store when KIE finishes.
 */
export async function generateVideoWithKIE(
  input: VideoGenerationInput
): Promise<KIEVideoResult> {
  const apiKey = process.env.KIE_API_KEY;
  if (!apiKey) {
    throw new Error("KIE_API_KEY is not configured");
  }
  if (!input.webhookUrl) {
    throw new Error("KIE adapter requires a webhookUrl (WEBHOOK_BASE_URL is not configured)");
  }

  const kieTaskId = await submitVideoTask(input, apiKey);
  console.log(`[KIE] Video task submitted: ${kieTaskId}`);

  return {
    videoUrl: "", // Filled by webhook handler at /api/webhooks/kie
    externalId: kieTaskId,
  };
}

/**
 * Fetch KIE task result via recordInfo API.
 * Used by the callback handler to retrieve the actual result URLs.
 */
export async function fetchKIETaskResult(
  kieTaskId: string
): Promise<{ status: string; videoUrl?: string; error?: string }> {
  const apiKey = process.env.KIE_API_KEY;
  if (!apiKey) {
    throw new Error("KIE_API_KEY is not configured");
  }

  const response = await fetch(
    `${KIE_BASE_URL}/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(kieTaskId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`KIE status check error: ${response.status}`);
  }

  const result: KIERecordInfoResponse = await response.json();

  if (result.code !== 200) {
    throw new Error(`KIE status check error: ${result.message}`);
  }

  const { state, resultJson, failMsg } = result.data;

  let videoUrl: string | undefined;
  if (state === "success" && resultJson) {
    const parsed = JSON.parse(resultJson);
    videoUrl = parsed.resultUrls?.[0];
  }

  return {
    status: state === "success" ? "succeeded" : state === "fail" ? "failed" : "processing",
    videoUrl,
    error: failMsg,
  };
}
