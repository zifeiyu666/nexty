import { apiResponse } from "@/lib/api-response";
import { refreshSongGeneration } from "@/lib/ai/song";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const songId = searchParams.get("songId");

  if (!songId) {
    return apiResponse.badRequest("songId is required");
  }

  try {
    const task = await refreshSongGeneration(songId);
    if (!task) {
      return apiResponse.notFound("Song task not found or expired.");
    }

    return apiResponse.success({
      songId: task.songId,
      status: task.status,
      title: task.title,
      lyrics: task.lyrics,
      versions: task.versions,
      previewLimitSeconds: task.isSubscriber ? null : 60,
      error: task.error,
      expiresAt: new Date(task.expiresAt).toISOString(),
    });
  } catch (error) {
    console.error("[songs/generate/status] Failed to refresh song task:", error);
    return apiResponse.serverError(
      error instanceof Error ? error.message : "Failed to check song status."
    );
  }
}
