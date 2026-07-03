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
const DEFAULT_REMOTION_CONCURRENCY = 100;
const MAX_REMOTION_CONCURRENCY = 300;
const DEFAULT_REMOTION_AUDIO_BITRATE = "192k";
const DEFAULT_REMOTION_VIDEO_CRF = 24;
const MIN_REMOTION_VIDEO_CRF = 18;
const MAX_REMOTION_VIDEO_CRF = 35;
const DEFAULT_REMOTION_X264_PRESET = "medium";
const REMOTION_X264_PRESETS = [
  "ultrafast",
  "superfast",
  "veryfast",
  "faster",
  "fast",
  "medium",
  "slow",
  "slower",
  "veryslow",
] as const;
type RemotionX264Preset = (typeof REMOTION_X264_PRESETS)[number];

function requiredEnv(name: string, env: Env = process.env) {
  const value = env[name]?.trim();
  if (!value) throw new Error(`${name} is required for Remotion rendering.`);
  return value;
}

function parseRemotionVideoCrf(value: string | undefined) {
  const parsed = Number.parseInt(value?.trim() ?? "", 10);
  if (
    Number.isFinite(parsed) &&
    parsed >= MIN_REMOTION_VIDEO_CRF &&
    parsed <= MAX_REMOTION_VIDEO_CRF
  ) {
    return parsed;
  }

  return DEFAULT_REMOTION_VIDEO_CRF;
}

function parseRemotionX264Preset(value: string | undefined): RemotionX264Preset {
  const preset = value?.trim();
  return REMOTION_X264_PRESETS.find((candidate) => candidate === preset)
    ?? DEFAULT_REMOTION_X264_PRESET;
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
  const configuredConcurrency = env.REMOTION_CONCURRENCY?.trim()
    ?? env.REMOTION_CONCURRENCY_PER_LAMBDA?.trim();
  const concurrency = configuredConcurrency
    ? Math.min(
        Math.max(Number.parseInt(configuredConcurrency, 10) || DEFAULT_REMOTION_CONCURRENCY, 1),
        MAX_REMOTION_CONCURRENCY,
      )
    : DEFAULT_REMOTION_CONCURRENCY;
  const videoBitrate = env.REMOTION_VIDEO_BITRATE?.trim();

  return {
    audioBitrate:
      env.REMOTION_AUDIO_BITRATE?.trim() || DEFAULT_REMOTION_AUDIO_BITRATE,
    codec: "h264" as const,
    composition: PHOTO_SLIDESHOW_COMPOSITION_ID,
    concurrency,
    crf: videoBitrate ? undefined : parseRemotionVideoCrf(env.REMOTION_VIDEO_CRF),
    functionName: requiredEnv("REMOTION_FUNCTION_NAME", env),
    region: requiredEnv("REMOTION_AWS_REGION", env) as Parameters<
      typeof renderMediaOnLambda
    >[0]["region"],
    serveUrl: requiredEnv("REMOTION_SERVE_URL", env),
    videoBitrate: videoBitrate || undefined,
    webhookSecret: requiredEnv("REMOTION_WEBHOOK_SECRET", env),
    x264Preset: parseRemotionX264Preset(env.REMOTION_X264_PRESET),
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
    audioBitrate: config.audioBitrate,
    codec: config.codec,
    composition: config.composition,
    concurrency: config.concurrency,
    crf: config.crf,
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
    videoBitrate: config.videoBitrate,
    webhook: buildRemotionWebhook({ videoId: video.id }),
    x264Preset: config.x264Preset,
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
