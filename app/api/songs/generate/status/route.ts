import { refreshSongGeneration } from "@/lib/ai/song";
import { songSampleStore } from "@/lib/ai/song-sample-store";
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
      console.warn("[songs/generate/status] Song task missing or expired", { songId });
      return apiResponse.notFound("Song task not found or expired.");
    }

    console.log("[songs/generate/status] Task refreshed", {
      songId: task.songId,
      status: task.status,
      expiresAt: task.expiresAt,
      versions: task.versions?.length || 0,
      isSubscriber: task.isSubscriber,
    });

    // Only expose a sample URL when a saved sample is actually available.
    let sampleUrl: string | null = null;
    if (!task.isSubscriber) {
      try {
        const sample = await songSampleStore.get(task.songId);
        if (sample) {
          sampleUrl = `/samples/${task.songId}`;
        } else {
          console.log("[songs/generate/status] Sample not yet saved", { songId: task.songId });
        }
      } catch (err) {
        console.warn("[songs/generate/status] Failed checking sample store", { songId: task.songId, err });
      }
    }

    return apiResponse.success({
      songId: task.songId,
      status: task.status,
      title: task.title,
      lyrics: task.lyrics,
      versions: task.versions,
      previewLimitSeconds: task.isSubscriber ? null : 60,
      sampleUrl,
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
