import {
  normalizeKieMusicRecord,
} from "@/lib/ai/adapters/kie-suno";
import { completeSongTaskFromKieResult } from "@/lib/ai/kie-suno-song-completion";
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
      await completeSongTaskFromKieResult({
        result: {
          ...result,
          error: result.error || body?.msg || "KIE song generation failed.",
        },
        task,
      });
      console.log("[KIE Suno Callback] Marked task failed", {
        songId: task.songId,
        error: result.error || body?.msg,
      });
      return Response.json({ ok: true });
    }

    if (result.status === "succeeded" && result.versions.length) {
      const updated = await completeSongTaskFromKieResult({ result, task });
      const r2PublicUrl = process.env.R2_PUBLIC_URL;
      console.log("[KIE Suno Callback] Marked task succeeded", {
        songId: task.songId,
        versions: updated?.versions.length,
        r2Media: r2PublicUrl
          ? updated?.versions.filter((version) => version.audioUrl.startsWith(r2PublicUrl)).length
          : undefined,
        timestampedLyrics: updated?.versions.filter(
          (version) => version.timestampedLyrics?.alignedWords?.length,
        ).length,
        isSubscriber: updated?.isSubscriber,
      });
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("[KIE Suno Callback] Error:", error);
    return Response.json({ ok: true });
  }
}
