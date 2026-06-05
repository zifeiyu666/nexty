/**
 * KIE Image Generation Adapter
 * Uses unified job creation API: POST /api/v1/jobs/createTask
 * Status polling via: GET /api/v1/jobs/recordInfo?taskId=xxx
 * Docs: https://docs.kie.ai/
 */

import { IMAGE_MODELS } from "@/config/ai-models";
import { serverUploadFile } from "@/lib/cloudflare/r2";
import type { ImageGenerationInput, ImageGenerationResult } from "../image";

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

/**
 * Upload a base64 data URI to R2 and return a public URL.
 * If the input is already a URL (http/https), return it as-is.
 */
async function ensureImageUrl(imageData: string): Promise<string> {
  if (imageData.startsWith("http://") || imageData.startsWith("https://")) {
    return imageData;
  }

  // Extract content type from data URI
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
 * Submit image generation task to KIE
 */
async function submitImageTask(
  input: ImageGenerationInput,
  apiKey: string
): Promise<string> {
  const url = `${KIE_BASE_URL}/api/v1/jobs/createTask`;

  const payload: Record<string, any> = {
    model: input.modelId,
    input: {
      prompt: input.prompt,
    },
  };

  // Add aspect ratio
  if (input.aspectRatio) {
    payload.input.aspect_ratio = input.aspectRatio;
  }

  // Add resolution
  if (input.resolution) {
    payload.input.resolution = input.resolution;
  }

  // Add output format (KIE uses "jpg" not "jpeg", default to "png")
  const fmt = input.outputFormat === "jpeg" ? "jpg" : (input.outputFormat || "png");
  payload.input.output_format = fmt;

  // Add reference image for I2I
  if (input.sourceImage) {
    const imageUrl = await ensureImageUrl(input.sourceImage);
    const modelCfg = IMAGE_MODELS.find((m) => m.id === input.modelId);
    const { imageInputField, imageInputIsArray } = modelCfg?.capabilities ?? {};

    if (imageInputField) {
      payload.input[imageInputField] = imageInputIsArray ? [imageUrl] : imageUrl;
    }
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
 * Poll task status until completion using GET /api/v1/jobs/recordInfo
 */
async function pollTaskStatus(
  taskId: string,
  apiKey: string,
  maxAttempts = 60,
  intervalMs = 3000
): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(
      `${KIE_BASE_URL}/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`KIE status check error: ${response.status} - ${error}`);
    }

    const result: KIERecordInfoResponse = await response.json();

    if (result.code !== 200) {
      throw new Error(`KIE status check error: ${result.message}`);
    }

    const { state, resultJson, failMsg } = result.data;

    if (state === "success") {
      if (!resultJson) {
        throw new Error("KIE task succeeded but resultJson is empty");
      }
      const parsed = JSON.parse(resultJson);
      const urls: string[] = parsed.resultUrls || [];
      if (urls.length === 0) {
        throw new Error("KIE did not return any image URLs");
      }
      return urls[0];
    }

    if (state === "fail") {
      throw new Error(`KIE task failed: ${failMsg || "Unknown error"}`);
    }

    // Still waiting/queuing/generating, wait and retry
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error("KIE image generation timed out");
}

/**
 * Download image from URL and convert to base64 data URI.
 *
 * TODO [Save to R2 Instead of Base64]: Rather than returning a base64 data URI,
 *   upload the image directly to R2 and return the R2 public URL.
 *   This avoids encoding overhead and large JSON payloads in the API response.
 *   Use fetchExternalUrlToR2() from lib/cloudflare/r2-fetch-upload.ts:
 *
 *   import { fetchExternalUrlToR2 } from "@/lib/cloudflare/r2-fetch-upload";
 *   import { generateR2Key } from "@/lib/cloudflare/r2-utils";
 *   const key = generateR2Key({ fileName: "image.png", path: "ai-images" });
 *   const { url: r2Url } = await fetchExternalUrlToR2(imageUrl, key);
 *   return { imageUrl: r2Url, mimeType: "image/png" };
 *
 *   When using R2 URLs, update ImageResultArea.tsx to use downloadFileFromUrl()
 *   instead of downloadBase64File() for the download button.
 */
async function downloadImage(imageUrl: string): Promise<ImageGenerationResult> {
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to download image: ${imageResponse.statusText}`);
  }

  const imageBuffer = await imageResponse.arrayBuffer();
  const base64 = Buffer.from(imageBuffer).toString("base64");
  const contentType = imageResponse.headers.get("content-type") || "image/png";

  return {
    imageUrl: `data:${contentType};base64,${base64}`,
    mimeType: contentType,
  };
}

/**
 * Generate image with KIE
 */
export async function generateImageWithKIE(
  input: ImageGenerationInput
): Promise<ImageGenerationResult> {
  const apiKey = process.env.KIE_API_KEY;
  if (!apiKey) {
    throw new Error("KIE_API_KEY is not configured");
  }

  // Step 1: Submit task
  const taskId = await submitImageTask(input, apiKey);
  console.log(`[KIE] Image task submitted: ${taskId}`);

  // Step 2: Poll for completion
  const imageUrl = await pollTaskStatus(taskId, apiKey);
  console.log(`[KIE] Image task completed: ${taskId}`);

  // Step 3: Download image and return as base64
  return await downloadImage(imageUrl);
}
