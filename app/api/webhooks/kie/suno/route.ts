import { normalizeKieMusicRecord } from "@/lib/ai/adapters/kie-suno";
import { songSampleEmail } from "@/lib/ai/song-sample-email";
import {
  createSongSampleFromTask,
  songSampleStore,
} from "@/lib/ai/song-sample-store";
import { songTaskStore } from "@/lib/ai/song-task-store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const taskId =
      body?.data?.task_id ||
      body?.data?.taskId ||
      body?.taskId ||
      body?.task_id ||
      body?.data?.externalId ||
      body?.externalId;

    console.log("[KIE Suno Callback] Received", {
      body,
      taskId,
      code: body?.code,
      callbackType: body?.data?.callbackType,
    });

    if (!taskId) {
      console.error("[KIE Suno Callback] Missing task identifier in callback payload", {
        body,
      });
      return Response.json({ ok: false, error: "Missing task_id" }, { status: 400 });
    }

    const task = await songTaskStore.getSongByExternalId(taskId);
    if (!task) {
      console.warn("[KIE Suno Callback] No internal song task found", { taskId, body });
      return Response.json({ ok: true });
    }

    if (task.status === "succeeded" || task.status === "failed") {
      console.log("[KIE Suno Callback] Task already terminal, skipping update", {
        songId: task.songId,
        status: task.status,
      });
      return Response.json({ ok: true });
    }

    const result = normalizeKieMusicRecord(body);
    console.log("[KIE Suno Callback] Normalized result", {
      songId: task.songId,
      externalId: task.externalId,
      status: result.status,
      versions: result.versions?.length,
      error: result.error,
    });

    if (body?.code === 501 || result.status === "failed") {
      await songTaskStore.updateSong(task.songId, {
        status: "failed",
        error: result.error || body?.msg || "KIE song generation failed.",
      });
      console.log("[KIE Suno Callback] Marked task failed", {
        songId: task.songId,
        error: result.error || body?.msg,
      });
      return Response.json({ ok: true });
    }

    if (result.status === "succeeded" && result.versions.length) {
      const updated = await songTaskStore.updateSong(task.songId, {
        status: "succeeded",
        versions: result.versions,
      });
      console.log("[KIE Suno Callback] Marked task succeeded", {
        songId: task.songId,
        versions: result.versions.length,
        isSubscriber: updated?.isSubscriber,
      });

      if (updated && !updated.isSubscriber) {
        const sample = createSongSampleFromTask(updated);
        await songSampleStore.save(sample);
        console.log("[KIE Suno Callback] Saved song sample", {
          songId: sample.songId,
          userId: sample.userId,
          email: sample.email,
        });
        await songSampleEmail.sendSongSampleReadyEmail(sample);
      }
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("[KIE Suno Callback] Error:", error);
    return Response.json({ ok: true });
  }
}
