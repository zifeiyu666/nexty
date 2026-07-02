import { Readable } from "node:stream";

import { serverUploadFile, type UploadResult } from "@/lib/cloudflare/r2";

/**
 * Fetch content from an external URL (e.g. a provider-generated video/image URL)
 * and upload it to R2 for permanent storage.
 *
 * Provider URLs (Replicate, fal.ai, KIE) are typically temporary and expire within
 * 1–24 hours. Call this function inside webhook handlers right after receiving the
 * result to ensure the file is persisted before the provider URL becomes invalid.
 *
 * @param externalUrl - The provider-returned URL to fetch (http/https).
 * @param key         - The R2 object key (e.g. "ai-videos/userId/taskId.mp4").
 *                      Use `generateR2Key()` from lib/cloudflare/r2-utils to build this.
 * @returns           The R2 upload result containing { url, key }.
 *
 * @example
 * // Inside a webhook handler after video generation succeeds:
 * const { url: r2Url } = await fetchExternalUrlToR2(
 *   task.videoUrl,
 *   `ai-videos/${task.taskId}.mp4`
 * );
 * await taskStore.update(task.taskId, { videoUrl: r2Url });
 */
export async function fetchExternalUrlToR2(
  externalUrl: string,
  key: string
): Promise<UploadResult> {
  const startedAt = Date.now();
  const response = await fetch(externalUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch external URL (${response.status}): ${externalUrl}`
    );
  }

  const contentType =
    response.headers.get("content-type") || "application/octet-stream";
  const contentLengthHeader = response.headers.get("content-length");
  const contentLength =
    contentLengthHeader && Number.isFinite(Number(contentLengthHeader))
      ? Number.parseInt(contentLengthHeader, 10)
      : undefined;

  if (!response.body) {
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return serverUploadFile({ data: buffer, contentType, contentLength, key });
  }

  const upload = await serverUploadFile({
    data: Readable.fromWeb(response.body as globalThis.ReadableStream<Uint8Array>),
    contentType,
    contentLength,
    key,
  });

  console.info("[fetchExternalUrlToR2] persisted external file to R2", {
    contentLength: contentLength ?? null,
    durationMs: Date.now() - startedAt,
    externalUrl,
    key,
  });

  return upload;
}
