import { fetchKIETaskResult } from "@/lib/ai/adapters/kie-video";
import { taskStore } from "@/lib/ai/task-store";
import crypto from "crypto";

// TODO [Save Video to R2]: KIE result URLs (from resultUrls[]) are temporary.
//   After receiving a successful callback and fetching the result via fetchKIETaskResult(),
//   immediately download the video and upload to R2 using:
//
//   import { fetchExternalUrlToR2 } from "@/lib/cloudflare/r2-fetch-upload";
//   import { generateR2Key } from "@/lib/cloudflare/r2-utils";
//
//   const key = generateR2Key({ fileName: `${task.taskId}.mp4`, path: "ai-videos" });
//   const { url: r2Url } = await fetchExternalUrlToR2(result.videoUrl!, key);
//   await taskStore.update(task.taskId, { status: "succeeded", videoUrl: r2Url });

// TODO [DB - Update Task Record]: Update the database after the R2 upload:
//   await db.update(aiVideoTasks)
//     .set({ status: "succeeded", r2Key: key, r2Url: r2Url, updatedAt: new Date() })
//     .where(eq(aiVideoTasks.taskId, task.taskId));

const KIE_WEBHOOK_HMAC_KEY = process.env.KIE_WEBHOOK_HMAC_KEY;

function verifyKieSignature(
  taskId: string,
  timestamp: string,
  receivedSignature: string,
  secret: string
): boolean {
  const dataToSign = `${taskId}.${timestamp}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(dataToSign)
    .digest("base64");

  if (expected.length !== receivedSignature.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(receivedSignature)
  );
}

/**
 * KIE Webhook Callback Handler
 *
 * KIE sends a POST when a task completes:
 * { code: 200 | 501, msg: "...", data: { taskId: "kie_task_xxx" } }
 *
 * On receiving the callback, we:
 * 1. Verify HMAC-SHA256 signature (if KIE_WEBHOOK_HMAC_KEY is set)
 * 2. Look up the internal taskId by the KIE taskId
 * 3. Fetch the actual result from KIE recordInfo API
 * 4. Update the task store
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // HMAC signature verification (enabled when KIE_WEBHOOK_HMAC_KEY is set)
    if (KIE_WEBHOOK_HMAC_KEY) {
      const timestamp = req.headers.get("x-webhook-timestamp");
      const receivedSignature = req.headers.get("x-webhook-signature");

      if (!timestamp || !receivedSignature) {
        return Response.json(
          { error: "Missing signature headers" },
          { status: 401 }
        );
      }

      // doc uses data.task_id (snake_case) for the signature
      const sigTaskId: string | undefined =
        body?.data?.task_id ?? body?.data?.taskId;
      if (!sigTaskId) {
        return Response.json({ error: "Missing task_id" }, { status: 400 });
      }

      const isValid = verifyKieSignature(
        sigTaskId,
        timestamp,
        receivedSignature,
        KIE_WEBHOOK_HMAC_KEY
      );
      if (!isValid) {
        console.warn("[KIE Callback] Invalid signature");
        return Response.json({ error: "Invalid signature" }, { status: 401 });
      }
    }
    const kieTaskId = body?.data?.taskId;

    if (!kieTaskId) {
      return Response.json({ error: "Missing taskId" }, { status: 400 });
    }

    console.log(`[KIE Callback] Received for task: ${kieTaskId}, code: ${body.code}`);

    // Look up internal task by KIE external ID
    const task = await taskStore.getByExternalId(kieTaskId);
    if (!task) {
      console.warn(`[KIE Callback] No internal task found for KIE taskId: ${kieTaskId}`);
      return Response.json({ error: "Task not found" }, { status: 404 });
    }

    // Task already completed (e.g. duplicate callback)
    if (task.status === "succeeded" || task.status === "failed") {
      return Response.json({ ok: true });
    }

    // KIE callback code 501 = generation failed
    if (body.code === 501) {
      await taskStore.update(task.taskId, {
        status: "failed",
        error: body.msg || "KIE generation failed",
      });
      return Response.json({ ok: true });
    }

    // Fetch actual result from KIE recordInfo API
    const result = await fetchKIETaskResult(kieTaskId);

    if (result.status === "succeeded" && result.videoUrl) {
      await taskStore.update(task.taskId, {
        status: "succeeded",
        videoUrl: result.videoUrl,
      });
    } else if (result.status === "failed") {
      await taskStore.update(task.taskId, {
        status: "failed",
        error: result.error || "KIE generation failed",
      });
    }
    // If still processing, do nothing — KIE will send another callback

    return Response.json({ ok: true });
  } catch (error: any) {
    console.error("[KIE Callback] Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
