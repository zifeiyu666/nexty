import { taskStore } from "@/lib/ai/task-store";
import crypto from "crypto";
import { NextResponse } from "next/server";

// TODO [Save Video to R2]: fal.ai output URLs may expire and are not guaranteed permanent.
//   After a successful callback, immediately download and re-upload to R2 using:
//
//   import { fetchExternalUrlToR2 } from "@/lib/cloudflare/r2-fetch-upload";
//   import { generateR2Key } from "@/lib/cloudflare/r2-utils";
//
//   const key = generateR2Key({ fileName: `${taskId}.mp4`, path: "ai-videos" });
//   const { url: r2Url } = await fetchExternalUrlToR2(payload.payload.video.url, key);
//   await taskStore.update(taskId, { status: "succeeded", videoUrl: r2Url });
//
//   Note: fal.ai JWKS cache is module-level (jwksCache) and will be reset on cold starts.
//   Consider persisting the JWKS keys in Redis for more reliable caching across instances.

// TODO [DB - Update Task Record]: Update the database after the R2 upload:
//   await db.update(aiVideoTasks)
//     .set({ status: "succeeded", r2Key: key, r2Url: r2Url, updatedAt: new Date() })
//     .where(eq(aiVideoTasks.taskId, taskId));

let jwksCache: { keys: any[]; fetchedAt: number } | null = null;
const JWKS_CACHE_TTL = 24 * 60 * 60 * 1000;

async function getJWKS(): Promise<any[]> {
  if (jwksCache && Date.now() - jwksCache.fetchedAt < JWKS_CACHE_TTL) {
    return jwksCache.keys;
  }
  const response = await fetch(
    "https://rest.alpha.fal.ai/.well-known/jwks.json"
  );
  const data = await response.json();
  jwksCache = { keys: data.keys, fetchedAt: Date.now() };
  return data.keys;
}

async function verifyFalSignature(
  request: Request,
  body: string
): Promise<boolean> {
  const requestId = request.headers.get("x-fal-request-id");
  const userId = request.headers.get("x-fal-user-id");
  const timestamp = request.headers.get("x-fal-timestamp");
  const signature = request.headers.get("x-fal-signature");

  if (!requestId || !userId || !timestamp || !signature) return false;

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > 300) return false;

  const bodyHash = crypto.createHash("sha256").update(body).digest("hex");
  const message = `${requestId}\n${userId}\n${timestamp}\n${bodyHash}`;

  const keys = await getJWKS();
  for (const key of keys) {
    try {
      const publicKey = Buffer.from(key.x, "base64url");
      const verify = crypto.createVerify("ed25519");
      verify.update(message);
      if (verify.verify({ key: publicKey, format: "der", type: "raw" } as any, Buffer.from(signature, "base64"))) {
        return true;
      }
    } catch {
      continue;
    }
  }
  return false;
}

export async function POST(request: Request) {
  try {
    const body = await request.text();

    if (process.env.FAL_VERIFY_WEBHOOKS === "true") {
      const isValid = await verifyFalSignature(request, body);
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid webhook signature" },
          { status: 401 }
        );
      }
    }

    const payload = JSON.parse(body);

    const url = new URL(request.url);
    const taskId = url.searchParams.get("taskId");

    if (!taskId) {
      console.warn("[fal.ai Webhook] No taskId in URL");
      return NextResponse.json({ received: true });
    }

    if (payload.status === "OK") {
      const videoUrl = payload.payload?.video?.url;
      await taskStore.update(taskId, {
        status: "succeeded",
        videoUrl,
        externalId: payload.request_id,
      });
    } else {
      await taskStore.update(taskId, {
        status: "failed",
        error: payload.error || "Unknown error from fal.ai",
        externalId: payload.request_id,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[fal.ai Webhook] Error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
