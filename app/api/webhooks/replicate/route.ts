import { NextResponse } from "next/server";
import { validateWebhook } from "replicate";
import { taskStore } from "@/lib/ai/task-store";

// TODO [Save Video to R2]: Replicate output URLs expire within ~1 hour.
//   After a successful prediction, immediately download the video and upload it
//   to R2 for permanent storage using fetchExternalUrlToR2():
//
//   import { fetchExternalUrlToR2 } from "@/lib/cloudflare/r2-fetch-upload";
//   import { generateR2Key } from "@/lib/cloudflare/r2-utils";
//
//   const key = generateR2Key({ fileName: `${taskId}.mp4`, path: "ai-videos" });
//   const { url: r2Url } = await fetchExternalUrlToR2(videoUrl, key);
//   await taskStore.update(taskId, { status: "succeeded", videoUrl: r2Url, externalId: prediction.id });
//
//   This ensures the video is accessible beyond the Replicate URL expiry window.

// TODO [DB - Update Task Record]: After uploading to R2, update the database record.
//   await db.update(aiVideoTasks)
//     .set({ status: "succeeded", r2Key: key, r2Url: r2Url, updatedAt: new Date() })
//     .where(eq(aiVideoTasks.taskId, taskId));

// TODO [Notify User]: Optionally send an email or push notification when the video
//   is ready. Use Resend (lib/resend.ts or nexty-email skill) for email notifications.

export async function POST(request: Request) {
  try {
    const secret = process.env.REPLICATE_WEBHOOK_SIGNING_SECRET;
    if (secret) {
      const isValid = await validateWebhook(request.clone(), secret);
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid webhook signature" },
          { status: 401 }
        );
      }
    }

    const prediction = await request.json();

    const url = new URL(request.url);
    const taskId = url.searchParams.get("taskId");

    if (!taskId) {
      console.warn("[Replicate Webhook] No taskId in URL");
      return NextResponse.json({ received: true });
    }

    if (prediction.status === "succeeded") {
      const output = prediction.output;
      const videoUrl = Array.isArray(output)
        ? output[0]
        : typeof output === "string"
          ? output
          : null;

      await taskStore.update(taskId, {
        status: "succeeded",
        videoUrl: videoUrl || undefined,
        externalId: prediction.id,
      });
    } else if (
      prediction.status === "failed" ||
      prediction.status === "canceled"
    ) {
      await taskStore.update(taskId, {
        status: "failed",
        error:
          typeof prediction.error === "string"
            ? prediction.error
            : JSON.stringify(prediction.error),
        externalId: prediction.id,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[Replicate Webhook] Error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
