import { apiResponse } from "@/lib/api-response";
import { refreshLyricsGeneration } from "@/lib/ai/song";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId");

  if (!taskId) {
    return apiResponse.badRequest("taskId is required");
  }

  try {
    const task = await refreshLyricsGeneration(taskId);
    if (!task) {
      return apiResponse.notFound("Lyrics task not found or expired.");
    }

    return apiResponse.success({
      taskId: task.taskId,
      status: task.status,
      title: task.title,
      lyrics: task.lyrics,
      error: task.error,
      expiresAt: new Date(task.expiresAt).toISOString(),
    });
  } catch (error) {
    console.error("[songs/lyrics/status] Failed to refresh lyrics task:", error);
    return apiResponse.serverError(
      error instanceof Error ? error.message : "Failed to check lyrics status."
    );
  }
}
