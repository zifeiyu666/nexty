import { apiResponse } from "@/lib/api-response";
import { getSession } from "@/lib/auth/server";
import { createPresignedUploadUrl } from "@/lib/cloudflare/r2";
import { z } from "zod";

const MAX_COVER_BYTES = 10 * 1024 * 1024;
const coverUploadSchema = z.object({
  contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  fileName: z.string().trim().min(1).max(180),
  size: z.number().int().positive(),
});

const extensionByContentType = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user) {
    return apiResponse.unauthorized("Please sign in to upload an album cover.");
  }

  const parsed = coverUploadSchema.safeParse(await request.json());
  if (!parsed.success) {
    return apiResponse.badRequest(
      parsed.error.issues[0]?.message ||
        "Use a JPEG, PNG, or WebP image under 10MB.",
    );
  }
  if (parsed.data.size > MAX_COVER_BYTES) {
    return apiResponse.badRequest("Use an image under 10MB.");
  }

  const extension = extensionByContentType[parsed.data.contentType];
  const key = `songs/covers/uploads/${session.user.id}/${crypto.randomUUID()}.${extension}`;

  try {
    const upload = await createPresignedUploadUrl({
      contentType: parsed.data.contentType,
      expiresIn: 300,
      key,
    });

    return apiResponse.success({
      contentType: parsed.data.contentType,
      key,
      presignedUrl: upload.presignedUrl,
      publicObjectUrl: upload.publicObjectUrl,
    });
  } catch (error) {
    return apiResponse.serverError(
      error instanceof Error
        ? error.message
        : "Unable to prepare album cover upload.",
    );
  }
}
