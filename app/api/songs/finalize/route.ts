import { finalizeSongFromSample } from "@/lib/ai/final-song";
import { songSampleStore } from "@/lib/ai/song-sample-store";
import { apiResponse } from "@/lib/api-response";
import { getSession } from "@/lib/auth/server";
import { z } from "zod";

const finalizeSchema = z.object({
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

  const sample = await songSampleStore.get(input.songId);
  if (!sample) {
    return apiResponse.notFound("Song sample not found.");
  }

  const result = await finalizeSongFromSample({
    sample,
    userId: session.user.id,
    versionId: input.versionId,
  });

  if (!result.success) {
    return apiResponse.error(result.error, result.status);
  }

  return apiResponse.success({
    songId: result.song.id,
    songUrl: `/songs/${result.song.id}`,
    shareToken: result.song.shareToken,
    alreadyFinalized: result.alreadyFinalized,
  });
}
