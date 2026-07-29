import { apiResponse } from "@/lib/api-response";
import { getSession } from "@/lib/auth/server";
import { createPresignedUploadUrl } from "@/lib/cloudflare/r2";
import { z } from "zod";

const schema = z.object({ kind: z.enum(["source", "verification", "image"]), contentType: z.string(), fileName: z.string().min(1).max(160), size: z.number().positive() });
const allowedAudio = new Set(["audio/mpeg", "audio/wav", "audio/x-wav", "audio/mp4", "audio/webm", "audio/ogg"]);
const allowedImages = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const session = await getSession(); if (!session?.user) return apiResponse.unauthorized();
  const parsed = schema.safeParse(await request.json()); if (!parsed.success) return apiResponse.badRequest("Invalid upload.");
  const { kind, contentType, size } = parsed.data;
  const image = kind === "image";
  if (!(image ? allowedImages : allowedAudio).has(contentType) || size > (image ? 10 : 20) * 1024 * 1024) return apiResponse.badRequest(image ? "Use a JPEG, PNG, or WebP image under 10MB." : "Use an audio file under 20MB.");
  const extension = contentType.split("/")[1].replace("mpeg", "mp3").replace("x-wav", "wav");
  const key = `voices/${kind}/${session.user.id}/${crypto.randomUUID()}.${extension}`;
  const upload = await createPresignedUploadUrl({ key, contentType, expiresIn: 300 });
  return apiResponse.success({ key, presignedUrl: upload.presignedUrl, publicObjectUrl: upload.publicObjectUrl });
}
