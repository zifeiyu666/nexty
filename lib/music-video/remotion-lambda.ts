import {
  PHOTO_SLIDESHOW_COMPOSITION_ID,
  PHOTO_SLIDESHOW_FPS,
} from "@/lib/music-video/remotion-constants";
import {
  getRenderProgress,
  renderMediaOnLambda,
} from "@remotion/lambda/client";
import type { MusicVideoInputProps, MusicVideoRender } from "./renders";

export type StartLambdaRenderResult = {
  bucketName?: string;
  outKey?: string;
  renderId: string;
};

export type LambdaRenderProgress = {
  done: boolean;
  errorMessage?: string | null;
  outputFile?: string | null;
  progress: number;
};

type Env = NodeJS.ProcessEnv | Record<string, string | undefined>;

function requiredEnv(name: string, env: Env = process.env) {
  const value = env[name]?.trim();
  if (!value) throw new Error(`${name} is required for Remotion rendering.`);
  return value;
}

export function buildRemotionWebhook({
  env = process.env,
  videoId,
}: {
  env?: Env;
  videoId: string;
}): NonNullable<Parameters<typeof renderMediaOnLambda>[0]["webhook"]> {
  const webhookBaseUrl = requiredEnv("WEBHOOK_BASE_URL", env).replace(/\/+$/, "");

  return {
    customData: { videoId },
    secret: requiredEnv("REMOTION_WEBHOOK_SECRET", env),
    url: `${webhookBaseUrl}/api/webhooks/remotion/music-video`,
  };
}

export function getRemotionLambdaConfig({
  env = process.env,
}: {
  env?: Env;
} = {}) {
  return {
    codec: "h264" as const,
    composition: PHOTO_SLIDESHOW_COMPOSITION_ID,
    functionName: requiredEnv("REMOTION_FUNCTION_NAME", env),
    region: requiredEnv("REMOTION_AWS_REGION", env) as Parameters<
      typeof renderMediaOnLambda
    >[0]["region"],
    serveUrl: requiredEnv("REMOTION_SERVE_URL", env),
    webhookSecret: requiredEnv("REMOTION_WEBHOOK_SECRET", env),
  };
}

export async function startLambdaRender({
  inputProps,
  video,
}: {
  inputProps: MusicVideoInputProps;
  video: Pick<MusicVideoRender, "id">;
}): Promise<StartLambdaRenderResult> {
  const config = getRemotionLambdaConfig();
  const result = await renderMediaOnLambda({
    codec: config.codec,
    composition: config.composition,
    framesPerLambda: PHOTO_SLIDESHOW_FPS * 20,
    functionName: config.functionName,
    inputProps,
    outName: process.env.REMOTION_FORCE_BUCKET_NAME
      ? {
          bucketName: process.env.REMOTION_FORCE_BUCKET_NAME,
          key: `music-videos/${video.id}.mp4`,
        }
      : `music-videos/${video.id}.mp4`,
    privacy: "public",
    region: config.region,
    serveUrl: config.serveUrl,
    webhook: buildRemotionWebhook({ videoId: video.id }),
  });

  return {
    bucketName: result.bucketName,
    outKey: `music-videos/${video.id}.mp4`,
    renderId: result.renderId,
  };
}

export async function getLambdaRenderProgress({
  bucketName,
  renderId,
}: {
  bucketName: string;
  renderId: string;
}): Promise<LambdaRenderProgress> {
  const config = getRemotionLambdaConfig();
  const progress = await getRenderProgress({
    bucketName,
    functionName: config.functionName,
    region: config.region,
    renderId,
  });

  return {
    done: progress.done,
    errorMessage:
      progress.errors[0]?.message ??
      (progress.fatalErrorEncountered ? "Remotion Lambda render failed." : null),
    outputFile: progress.outputFile,
    progress: progress.overallProgress,
  };
}
