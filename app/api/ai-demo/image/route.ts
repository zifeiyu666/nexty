import { generateImageUnified } from "@/lib/ai/image";
import { IMAGE_MODELS } from "@/config/ai-models";
import { getSession } from "@/lib/auth/server";
import { apiResponse } from "@/lib/api-response";
import { z } from "zod";

// TODO [Auth]: Verify user session before processing.
//   import { getSession } from "@/lib/auth/server";
//   const session = await getSession();
//   if (!session?.user) return apiResponse.unauthorized();

// TODO [Rate Limit]: Add per-user rate limiting.
//   import { checkRateLimit } from "@/lib/upstash";
//   Call checkRateLimit(userId, REDIS_RATE_LIMIT_CONFIGS.imageGenApi).

// TODO [Credits]: Deduct credits before/after generation.
//   See actions/usage/deduct.ts. Image generation can be expensive;
//   consider pre-authorizing credits and refunding on failure.

// TODO [Reference Image - Client Upload to R2]: For image-to-image workflows,
//   the client should upload the reference image to R2 via presigned URL and pass
//   the R2 public URL in `sourceImage` instead of a base64 data URI.
//   This reduces request payload size and avoids base64 encoding overhead.
//   Client upload flow:
//     1. Call generateUserPresignedUploadUrl() from actions/r2-resources/index.ts
//        with path: "ai-inputs", prefix: "ref-img"
//     2. PUT the file to the presignedUrl from the browser
//     3. Send publicObjectUrl as `sourceImage` in this request body
//   The adapters (fal, replicate) already accept http/https URLs, so no extra
//   server-side conversion is needed. KIE also handles URLs via ensureImageUrl().

// TODO [Save Generated Image to R2]: After generation, upload the base64 result
//   to R2 for permanent storage instead of returning raw base64 to the client.
//   This prevents repeatedly sending large base64 strings and gives you a stable URL.
//   Example:
//     import { serverUploadFile } from "@/lib/cloudflare/r2";
//     import { generateR2Key } from "@/lib/cloudflare/r2-utils";
//     const key = generateR2Key({ fileName: "image.png", path: "ai-images", prefix: userId });
//     const { url: r2Url } = await serverUploadFile({ data: result.imageUrl, contentType: "image/png", key });
//     // Then return r2Url instead of result.imageUrl

// TODO [DB - Save Generation Record]: Persist the generation record to the database.
//   Schema suggestion: table ai_image_generations { id, userId, prompt, provider, modelId,
//   r2Key, r2Url, aspectRatio, size, outputFormat, generationTimeMs, createdAt }
//   Insert after successfully saving to R2.

const inputSchema = z
  .object({
    prompt: z.string().min(1, "Prompt is required"),
    provider: z.string().min(1),
    modelId: z.string().min(1),
    size: z.string().optional(),
    sourceImage: z.string().optional(),
    aspectRatio: z.string().optional(),
    seed: z.number().int().optional(),
    negativePrompt: z.string().optional(),
    guidanceScale: z.number().optional(),
    inferenceSteps: z.number().int().optional(),
    strength: z.number().min(0).max(1).optional(),
    outputFormat: z.string().optional(),
    quality: z.string().optional(),
    background: z.string().optional(),
    resolution: z.string().optional(),
  })
  .refine((data) => !(data.size && data.aspectRatio), {
    message: "Cannot specify both size and aspectRatio",
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

    const modelConfig = IMAGE_MODELS.find(
      (m) => m.provider === input.provider && m.id === input.modelId
    );
    if (!modelConfig) {
      return apiResponse.badRequest(
        `Unknown model: ${input.provider}/${input.modelId}`
      );
    }

    const result = await generateImageUnified({
      prompt: input.prompt,
      provider: input.provider,
      modelId: input.modelId,
      size: input.size,
      sourceImage: input.sourceImage,
      generationMethod: modelConfig.generationMethod || "standard",
      aspectRatio: input.aspectRatio,
      seed: input.seed,
      negativePrompt: input.negativePrompt,
      guidanceScale: input.guidanceScale,
      inferenceSteps: input.inferenceSteps,
      strength: input.strength,
      outputFormat: input.outputFormat,
      quality: input.quality,
      background: input.background,
      resolution: input.resolution,
    });

    return apiResponse.success({ imageUrl: result.imageUrl });
  } catch (error: any) {
    console.error("[Image API] Error:", error);
    return apiResponse.serverError(error.message || "Image generation failed");
  }
}
