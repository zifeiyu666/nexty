import { normalizeKieMusicRecord } from "@/lib/ai/adapters/kie-suno";
import { completeSongTaskFromKieResult } from "@/lib/ai/kie-suno-song-completion";
import { songTaskStore, type SongGenerationTask } from "@/lib/ai/song-task-store";

type KieSunoCallbackDependencies = {
  completeTask?: typeof completeSongTaskFromKieResult;
  getSongByExternalId?: typeof songTaskStore.getSongByExternalId;
  updateSong?: typeof songTaskStore.updateSong;
};

function getKieSunoCallbackTaskId(body: any): string | undefined {
  return (
    body?.data?.task_id ||
    body?.data?.taskId ||
    body?.taskId ||
    body?.task_id ||
    body?.data?.externalId ||
    body?.externalId
  );
}

export async function handleKieSunoCallback(
  body: any,
  dependencies: KieSunoCallbackDependencies = {}
): Promise<{ ok: boolean; error?: string; status?: number }> {
  const taskId = getKieSunoCallbackTaskId(body);
  const getSongByExternalId =
    dependencies.getSongByExternalId ?? songTaskStore.getSongByExternalId.bind(songTaskStore);
  const updateSong = dependencies.updateSong ?? songTaskStore.updateSong.bind(songTaskStore);
  const completeTask = dependencies.completeTask ?? completeSongTaskFromKieResult;

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
    return { ok: false, error: "Missing task_id", status: 400 };
  }

  const task = await getSongByExternalId(taskId);
  if (!task) {
    console.warn("[KIE Suno Callback] No internal song task found", { taskId, body });
    return { ok: true };
  }

  if (task.status === "succeeded" || task.status === "failed") {
    console.log("[KIE Suno Callback] Task already terminal, skipping update", {
      songId: task.songId,
      status: task.status,
    });
    return { ok: true };
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
    await completeTask({
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
    return { ok: true };
  }

  if (result.status === "succeeded" && result.versions.length) {
    let updated: SongGenerationTask | null = null;
    try {
      updated = await completeTask({ result, task });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to complete KIE song callback.";
      console.error("[KIE Suno Callback] Failed to complete succeeded task", {
        songId: task.songId,
        externalId: task.externalId,
        error,
      });
      await updateSong(task.songId, {
        status: "processing",
        error: message,
      });
      return { ok: true };
    }

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

  return { ok: true };
}

export async function POST(req: Request) {
  try {
    console.log("[KIE Suno Callback] POST request received", {
      url: req.url,
      host: req.headers.get("host"),
      forwardedHost: req.headers.get("x-forwarded-host"),
      forwardedProto: req.headers.get("x-forwarded-proto"),
      userAgent: req.headers.get("user-agent"),
      contentType: req.headers.get("content-type"),
      contentLength: req.headers.get("content-length"),
    });

    const result = await handleKieSunoCallback(await req.json());
    return Response.json(
      result.ok ? { ok: true } : { ok: false, error: result.error },
      { status: result.status || 200 }
    );
  } catch (error) {
    console.error("[KIE Suno Callback] Error:", error);
    return Response.json({ ok: true });
  }
}

export async function GET(req: Request) {
  return Response.json({
    ok: true,
    route: "/api/webhooks/kie/suno",
    method: "GET",
    url: req.url,
    webhookBaseUrl: process.env.WEBHOOK_BASE_URL || null,
  });
}
