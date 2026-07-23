import type { KieSongVersion } from "./adapters/kie-suno";
import type { SpokenIntro } from "./spoken-intro";
import {
  SPOKEN_INTRO_AUDIO_COMPOSITION_ID,
  type SpokenIntroAudioProps,
} from "@/lib/music-video/spoken-intro-audio";
import { getRemotionLambdaConfig } from "@/lib/music-video/remotion-lambda";
import {
  getRenderProgress,
  renderMediaOnLambda,
} from "@remotion/lambda/client";

export type SpokenIntroRender = {
  bucketName: string;
  outKey: string;
  renderId: string;
  versionId: string;
};

export type SpokenIntroRenderProgress = {
  done: boolean;
  errorMessage?: string | null;
  outputFile?: string | null;
  progress: number;
};

export function buildSpokenIntroRenderInput({
  intro,
  songId,
  version,
}: {
  intro: SpokenIntro;
  songId: string;
  version: KieSongVersion;
}): Parameters<typeof renderMediaOnLambda>[0] {
  const config = getRemotionLambdaConfig();
  const outKey = `songs/generated/${songId}/${version.id}/with-intro.mp3`;
  const inputProps: SpokenIntroAudioProps = {
    introAudioUrl: intro.audioUrl,
    introDurationSeconds: intro.durationSeconds,
    songAudioUrl: version.audioUrl,
    songDurationSeconds: version.duration || 0,
  };

  return {
    audioBitrate: config.audioBitrate,
    codec: "mp3",
    composition: SPOKEN_INTRO_AUDIO_COMPOSITION_ID,
    concurrency: 1,
    functionName: config.functionName,
    inputProps,
    outName: process.env.REMOTION_FORCE_BUCKET_NAME
      ? {
          bucketName: process.env.REMOTION_FORCE_BUCKET_NAME,
          key: outKey,
        }
      : outKey,
    overwrite: true,
    privacy: "public",
    region: config.region,
    serveUrl: config.serveUrl,
  };
}

export async function startSpokenIntroRender({
  intro,
  songId,
  version,
}: {
  intro: SpokenIntro;
  songId: string;
  version: KieSongVersion;
}): Promise<Omit<SpokenIntroRender, "versionId">> {
  const outKey = `songs/generated/${songId}/${version.id}/with-intro.mp3`;
  const result = await renderMediaOnLambda(
    buildSpokenIntroRenderInput({ intro, songId, version }),
  );

  return {
    bucketName: result.bucketName,
    outKey,
    renderId: result.renderId,
  };
}

export async function getSpokenIntroRenderProgress(
  render: SpokenIntroRender,
): Promise<SpokenIntroRenderProgress> {
  const config = getRemotionLambdaConfig();
  const progress = await getRenderProgress({
    bucketName: render.bucketName,
    functionName: config.functionName,
    region: config.region,
    renderId: render.renderId,
  });

  return {
    done: progress.done,
    errorMessage:
      progress.errors[0]?.message ??
      (progress.fatalErrorEncountered
        ? "Remotion audio composition failed."
        : null),
    outputFile: progress.outputFile,
    progress: progress.overallProgress,
  };
}
