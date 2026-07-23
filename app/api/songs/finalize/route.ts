import { finalizeSongFromSample } from "@/lib/ai/final-song";
import { songSampleStore } from "@/lib/ai/song-sample-store";
import { apiResponse } from "@/lib/api-response";
import { getSession } from "@/lib/auth/server";
import { z } from "zod";

const finalizeSchema = z.object({
  coverImageUrl: z.string().trim().url().max(2000).optional(),
  personalNote: z.string().trim().max(500).optional(),
  songId: z.string().trim().min(1),
  versionId: z.string().trim().min(1),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return apiResponse.unauthorized("Please sign in to save this song.");
  }

  let input: z.infer<typeof finalizeSchema>;
  try {
    input = finalizeSchema.parse(await req.json());
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message || "Invalid finalize payload."
        : "Invalid JSON payload.";
    return apiResponse.badRequest(message);
  }

  const sample = await songSampleStore.get(input.songId, {
    includeFullVersions: true,
  });
  if (!sample) {
    console.warn("[songs/finalize] Sample not found", {
      songId: input.songId,
      versionId: input.versionId,
      userId: session.user.id,
      userEmail: session.user.email,
    });
    return apiResponse.notFound("Song sample not found.");
  }

  console.log("[songs/finalize] Finalize requested", {
    songId: input.songId,
    versionId: input.versionId,
    userId: session.user.id,
    userEmail: session.user.email,
    sampleUserId: sample.userId,
    isExpired: sample.isExpired,
    previewLimitSeconds: sample.previewLimitSeconds,
    accessExpiresAt: sample.accessExpiresAt,
    sampleVersionIds: sample.versions.map((version) => version.id),
  });

  if (input.personalNote !== undefined) {
    await songSampleStore.updatePersonalNote({
      personalNote: input.personalNote,
      songId: input.songId,
      userId: session.user.id,
    });
    sample.personalNote = input.personalNote;
  }

  const result = await finalizeSongFromSample({
    coverImageUrl: input.coverImageUrl,
    personalNote: input.personalNote,
    sample,
    userId: session.user.id,
    versionId: input.versionId,
  });

  if (!result.success) {
    console.warn("[songs/finalize] Finalize failed", {
      songId: input.songId,
      versionId: input.versionId,
      userId: session.user.id,
      status: result.status,
      error: result.error,
    });
    return apiResponse.error(result.error, result.status);
  }

  console.log("[songs/finalize] Finalize succeeded", {
    sourceSampleId: input.songId,
    versionId: input.versionId,
    userId: session.user.id,
    songId: result.song.id,
    alreadyFinalized: result.alreadyFinalized,
  });

  return apiResponse.success({
    songId: result.song.id,
    songUrl: `/songs/${result.song.id}`,
    shareToken: result.song.shareToken,
    alreadyFinalized: result.alreadyFinalized,
  });
}
