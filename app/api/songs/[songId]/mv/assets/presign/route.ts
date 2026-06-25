import { apiResponse } from "@/lib/api-response";
import { getSongForOwner } from "@/lib/ai/final-song";
import { getSession } from "@/lib/auth/server";
import { createPresignedUploadUrl } from "@/lib/cloudflare/r2";
import { generateR2Key } from "@/lib/cloudflare/r2-utils";
import { z } from "zod";

type Params = Promise<{ songId: string }>;

const presignSchema = z.object({
  contentType: z
    .string()
    .regex(
      /^(image\/(jpeg|png|webp|gif)|video\/(mp4|quicktime|webm|x-m4v))$/,
      "Only common image and video formats are supported.",
    ),
  fileName: z.string().min(1).max(180),
});

export async function POST(
  request: Request,
  { params }: { params: Params },
) {
  const session = await getSession();
  const user = session?.user;
  if (!user) return apiResponse.unauthorized();

  const { songId } = await params;
  const song = await getSongForOwner(songId, user.id);
  if (!song) return apiResponse.notFound("Song not found.");

  const parsed = presignSchema.safeParse(await request.json());
  if (!parsed.success) {
    return apiResponse.badRequest(parsed.error.errors[0]?.message ?? "Invalid upload.");
  }

  const key = generateR2Key({
    fileName: parsed.data.fileName,
    path: `music-videos/assets/${user.id}/${song.id}`,
  });
  const { presignedUrl, publicObjectUrl } = await createPresignedUploadUrl({
    contentType: parsed.data.contentType,
    expiresIn: 300,
    key,
  });

  return apiResponse.success({
    key,
    presignedUrl,
    publicObjectUrl,
  });
}
