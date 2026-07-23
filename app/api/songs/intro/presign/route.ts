import { apiResponse } from "@/lib/api-response";
import { normalizeSpokenIntroContentType } from "@/lib/audio/spoken-intro-upload";
import { getSession } from "@/lib/auth/server";
import { createPresignedUploadUrl } from "@/lib/cloudflare/r2";
import { z } from "zod";

const MAX_AUDIO_BYTES = 12 * 1024 * 1024;
const audioSchema = z.object({
  contentType: z.string().trim().min(1),
  fileName: z.string().trim().min(1).max(160),
  size: z.number().int().positive(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user)
    return apiResponse.unauthorized(
      "Please sign in to upload a voice message.",
    );
  const parsed = audioSchema.safeParse(await req.json());
  if (!parsed.success)
    return apiResponse.badRequest("Invalid audio recording.");
  if (parsed.data.size > MAX_AUDIO_BYTES)
    return apiResponse.badRequest("Use an audio file under 12MB.");
  const contentType = normalizeSpokenIntroContentType(parsed.data.contentType);
  if (!contentType)
    return apiResponse.badRequest(
      "Use a WebM, MP3, MP4, WAV, or OGG audio recording.",
    );
  const extension =
    contentType.split("/")[1] === "mpeg"
      ? "mp3"
      : contentType.split("/")[1];
  const key = `songs/spoken-intros/${session.user.id}/${crypto.randomUUID()}.${extension}`;
  try {
    const upload = await createPresignedUploadUrl({
      key,
      contentType,
    });
    return apiResponse.success({
      contentType,
      key,
      presignedUrl: upload.presignedUrl,
      publicObjectUrl: upload.publicObjectUrl,
    });
  } catch (error) {
    return apiResponse.serverError(
      error instanceof Error
        ? error.message
        : "Unable to prepare audio upload.",
    );
  }
}
