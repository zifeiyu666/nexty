import { apiResponse } from "@/lib/api-response";
import { getSession } from "@/lib/auth/server";
import { createPresignedUploadUrl } from "@/lib/cloudflare/r2";
import { getLogger } from "@/lib/logger";
import { MAX_VOICE_SOURCE_UPLOAD_BYTES, MAX_VOICE_VERIFICATION_UPLOAD_BYTES } from "@/lib/voice-sample";
import { z } from "zod";

const schema = z.object({ kind: z.enum(["source", "verification", "image"]), contentType: z.string(), fileName: z.string().min(1).max(160), size: z.number().positive() });
const allowedAudio = new Set(["audio/mpeg", "audio/wav", "audio/x-wav", "audio/mp4", "audio/webm", "audio/ogg"]);
const allowedImages = new Set(["image/jpeg", "image/png", "image/webp"]);
const logger = getLogger("voice-upload");

function normalizeContentType(contentType: string) {
  return contentType.split(";", 1)[0].trim().toLowerCase();
}

export async function POST(request: Request) {
  const session = await getSession(); if (!session?.user) { logger.warn({}, "Rejected voice upload request without a user session"); return apiResponse.unauthorized(); }
  const parsed = schema.safeParse(await request.json()); if (!parsed.success) { logger.warn({ userId: session.user.id }, "Rejected invalid voice upload request"); return apiResponse.badRequest("Invalid upload."); }
  const { kind, contentType, size } = parsed.data;
  const normalizedContentType = normalizeContentType(contentType);
  const image = kind === "image";
  const maxBytes = image
    ? 10 * 1024 * 1024
    : kind === "verification"
      ? MAX_VOICE_VERIFICATION_UPLOAD_BYTES
      : MAX_VOICE_SOURCE_UPLOAD_BYTES;
  logger.info({ userId: session.user.id, kind, contentType, normalizedContentType, size }, "Creating voice upload URL");
  if (!(image ? allowedImages : allowedAudio).has(normalizedContentType)) { logger.warn({ userId: session.user.id, kind, contentType, normalizedContentType, size }, "Rejected voice upload with unsupported file type"); return apiResponse.badRequest(image ? "Use a JPEG, PNG, or WebP image." : "Use an MP3, WAV, M4A, WebM, or OGG audio file."); }
  if (size > maxBytes) { const maxMegabytes = Math.round(maxBytes / 1024 / 1024); logger.warn({ userId: session.user.id, kind, contentType, normalizedContentType, size, maxBytes }, "Rejected voice upload exceeding file size limit"); return apiResponse.badRequest(`${kind === "verification" ? "Verification recording" : image ? "Image" : "Source recording"} must be under ${maxMegabytes}MB.`); }
  const extension = normalizedContentType.split("/")[1].replace("mpeg", "mp3").replace("x-wav", "wav");
  const key = `voices/${kind}/${session.user.id}/${crypto.randomUUID()}.${extension}`;
  const upload = await createPresignedUploadUrl({ key, contentType: normalizedContentType, expiresIn: 300 });
  logger.info({ userId: session.user.id, kind, key, contentType, normalizedContentType, size }, "Created voice upload URL");
  return apiResponse.success({ key, presignedUrl: upload.presignedUrl, publicObjectUrl: upload.publicObjectUrl });
}
