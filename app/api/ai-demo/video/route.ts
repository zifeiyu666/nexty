import { submitVideoGeneration } from "@/lib/ai/video";
import { VIDEO_MODELS } from "@/config/ai-models";
import { validateProviderKey } from "@/config/ai-providers";
import { getSession } from "@/lib/auth/server";
import { apiResponse } from "@/lib/api-response";
import { z } from "zod";

// TODO [Auth]: Verify user session before accepting the task.
//   import { getSession } from "@/lib/auth/server";
//   const session = await getSession();
//   if (!session?.user) return apiResponse.unauthorized();
//   Pass session.user.id to submitVideoGeneration() for ownership tracking.

// TODO [Rate Limit]: Video generation is expensive; add strict per-user rate limits.
//   import { checkRateLimit } from "@/lib/upstash";
//   Call checkRateLimit(userId, REDIS_RATE_LIMIT_CONFIGS.videoGenApi).

// TODO [Credits]: Pre-authorize and deduct credits before submitting the task.
//   Reserve credits immediately to prevent over-generation; release on failure.
//   See actions/usage/deduct.ts for patterns.

// TODO [Reference Image - Client Upload to R2 for I2V]: For image-to-video workflows,
//   the client should upload the reference image to R2 via presigned URL and send the
//   R2 public URL as `image` instead of a base64 data URI. This prevents:
//   - Large request payloads being sent to the server
//   - The server re-uploading base64 to R2 in the adapter (kie-video.ts ensureImageUrl)
//   Client upload flow:
//     1. Call generateUserPresignedUploadUrl() from actions/r2-resources/index.ts
//        with path: "ai-inputs", prefix: "i2v-ref"
//     2. PUT the file to presignedUrl from the browser
//     3. Send publicObjectUrl as `image` in this request body
//   The adapters (fal, replicate, kie) all accept http/https image URLs natively.

// TODO [DB - Save Task Record]: Persist a video task row to the database on creation.
//   Schema suggestion: table ai_video_tasks { id, userId, taskId, prompt, provider,
//   modelId, duration, status, r2Key, r2Url, inputImageUrl, error, createdAt, updatedAt }
//   Insert with status="pending" here; update in webhook handlers when the task completes.
//   The taskId returned by submitVideoGeneration() is your primary key for correlation.

const inputSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  provider: z.string().min(1),
  modelId: z.string().min(1),
  duration: z.number().min(1).max(15).default(5),
  image: z.string().optional(),
  aspectRatio: z.string().optional(),
  resolution: z.string().optional(),
  negativePrompt: z.string().optional(),
  cfgScale: z.number().min(0).max(1).optional(),
  generateAudio: z.boolean().optional(),
  cameraFixed: z.boolean().optional(),
  seed: z.number().int().optional(),
  mode: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    // Demo restriction: Only admins can use AI demo to prevent API key abuse.
    // In production, remove this check and use proper auth + rate limiting instead.
    const session = await getSession();
    if (!session?.user) {
      return apiResponse.unauthorized("Please sign in to use the AI demo.");
    }
    if (session.user.role !== "admin") {
      return apiResponse.forbidden("Admin privileges required.");
    }

    const body = await req.json();
    const input = inputSchema.parse(body);

    const modelConfig = VIDEO_MODELS.find(
      (m) => m.provider === input.provider && m.id === input.modelId
    );
    if (!modelConfig) {
      return apiResponse.badRequest(
        `Unknown model: ${input.provider}/${input.modelId}`
      );
    }

    const keyCheck = validateProviderKey(input.provider);
    if (!keyCheck.valid) {
      return apiResponse.serverError(keyCheck.error!);
    }

    const { taskId } = await submitVideoGeneration({
      prompt: input.prompt,
      provider: input.provider,
      modelId: input.modelId,
      duration: input.duration,
      image: input.image,
      aspectRatio: input.aspectRatio,
      resolution: input.resolution,
      negativePrompt: input.negativePrompt,
      cfgScale: input.cfgScale,
      generateAudio: input.generateAudio,
      cameraFixed: input.cameraFixed,
      seed: input.seed,
      mode: input.mode,
    });

    return apiResponse.success({ taskId });
  } catch (error: any) {
    console.error("[Video API] Error:", error);
    return apiResponse.serverError(
      error.message || "Video generation failed"
    );
  }
}
