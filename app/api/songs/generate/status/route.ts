import {
  getPublicSongGenerationVersions,
  refreshSongGeneration,
} from "@/lib/ai/song";
import { apiResponse } from "@/lib/api-response";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const songId = searchParams.get("songId");

  if (!songId) {
    return apiResponse.badRequest("songId is required");
  }

  try {
    const task = await refreshSongGeneration(songId);
    if (!task) {
      console.warn("[songs/generate/status] Song task missing or expired", {
        songId,
      });
      return apiResponse.notFound("Song task not found or expired.");
    }

    console.log("[songs/generate/status] Task refreshed", {
      songId: task.songId,
      externalId: task.externalId,
      status: task.status,
      expiresAt: task.expiresAt,
      versions: task.versions?.length || 0,
      timestampedLyrics:
        task.versions?.filter(
          (version) => version.timestampedLyrics?.alignedWords?.length,
        ).length || 0,
      isSubscriber: task.isSubscriber,
      error: task.error,
    });

    return apiResponse.success({
      songId: task.songId,
      status: task.status,
      mockMode: Boolean(task.mockMode),
      title: task.title,
      lyrics: task.lyrics,
      versions: getPublicSongGenerationVersions(task),
      previewLimitSeconds: 60,
      error: task.error,
      expiresAt: new Date(task.expiresAt).toISOString(),
    });
  } catch (error) {
    console.error(
      "[songs/generate/status] Failed to refresh song task:",
      error,
    );
    return apiResponse.serverError(
      error instanceof Error ? error.message : "Failed to check song status.",
    );
  }
}
