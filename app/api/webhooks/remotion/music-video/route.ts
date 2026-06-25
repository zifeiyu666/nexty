import { getLogger } from "@/lib/logger";
import {
  getMusicVideoById,
  type MusicVideoRender,
} from "@/lib/music-video/renders";
import {
  completeMusicVideoRender,
  failMusicVideoRender,
} from "@/lib/music-video/render-completion";
import {
  appRouterWebhook,
  type WebhookErrorPayload,
  type WebhookSuccessPayload,
  type WebhookTimeoutPayload,
} from "@remotion/lambda/client";

const logger = getLogger("music-video-render");

function getWebhookSecret() {
  const secret = process.env.REMOTION_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new Error("REMOTION_WEBHOOK_SECRET is required for Remotion webhooks.");
  }

  return secret;
}

function getVideoId(payload: {
  customData: Record<string, unknown> | null;
  renderId: string;
}) {
  const videoId = payload.customData?.videoId;
  if (typeof videoId !== "string" || !videoId) {
    throw new Error(`Remotion webhook ${payload.renderId} is missing videoId.`);
  }

  return videoId;
}

async function getActiveVideo(payload: {
  customData: Record<string, unknown> | null;
  renderId: string;
}): Promise<MusicVideoRender | null> {
  const videoId = getVideoId(payload);
  const video = await getMusicVideoById({ videoId });

  if (!video) {
    logger.warn({ renderId: payload.renderId, videoId }, "Music video webhook target not found");
    return null;
  }

  if (video.status === "completed" || video.status === "failed") {
    logger.info(
      { renderId: payload.renderId, status: video.status, videoId },
      "Music video webhook skipped terminal render",
    );
    return null;
  }

  return video;
}

async function handleSuccess(payload: WebhookSuccessPayload) {
  const video = await getActiveVideo(payload);
  if (!video) return;

  logger.info(
    { renderId: payload.renderId, videoId: video.id },
    "Received Remotion music video success webhook",
  );

  await completeMusicVideoRender({
    outputUrl: payload.outputUrl ?? payload.outputFile,
    video,
  });
}

async function handleError(payload: WebhookErrorPayload) {
  const video = await getActiveVideo(payload);
  if (!video) return;

  const message =
    payload.errors.map((error) => error.message).filter(Boolean).join("\n") ||
    "Remotion Lambda render failed.";

  logger.warn(
    { renderId: payload.renderId, videoId: video.id },
    "Received Remotion music video error webhook",
  );

  await failMusicVideoRender({
    error: message,
    videoId: video.id,
  });
}

async function handleTimeout(payload: WebhookTimeoutPayload) {
  const video = await getActiveVideo(payload);
  if (!video) return;

  logger.warn(
    { renderId: payload.renderId, videoId: video.id },
    "Received Remotion music video timeout webhook",
  );

  await failMusicVideoRender({
    error: "Remotion Lambda render timed out.",
    videoId: video.id,
  });
}

function createWebhookHandler() {
  return appRouterWebhook({
    onError: handleError,
    onSuccess: handleSuccess,
    onTimeout: handleTimeout,
    secret: getWebhookSecret(),
  });
}

export async function POST(request: Request) {
  return createWebhookHandler()(request);
}

export async function OPTIONS(request: Request) {
  return createWebhookHandler()(request);
}
