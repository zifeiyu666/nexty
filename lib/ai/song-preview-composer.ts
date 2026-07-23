import {
  getRenderProgress,
  renderMediaOnLambda,
} from "@remotion/lambda/client";

import type { KieSongVersion } from "./adapters/kie-suno";
import { getRemotionLambdaConfig } from "@/lib/music-video/remotion-lambda";
import {
  SONG_AUDIO_PREVIEW_COMPOSITION_ID,
  SONG_AUDIO_PREVIEW_LIMIT_SECONDS,
  type SongAudioPreviewProps,
} from "@/lib/music-video/song-audio-preview";

export type SongPreviewRender = {
  bucketName: string;
  outKey: string;
  renderId: string;
  versionId: string;
};

export type SongPreviewRenderProgress = {
  done: boolean;
  errorMessage?: string | null;
  outputFile?: string | null;
  progress: number;
};

export function buildSongPreviewRenderInput({
  songId,
  version,
}: {
  songId: string;
  version: KieSongVersion;
}): Parameters<typeof renderMediaOnLambda>[0] {
  const config = getRemotionLambdaConfig();
  const outKey = `songs/generated/${songId}/${version.id}/preview.mp3`;
  const inputProps: SongAudioPreviewProps = {
    audioUrl: version.audioUrl,
    audioDurationSeconds: version.duration || 0,
    previewLimitSeconds: SONG_AUDIO_PREVIEW_LIMIT_SECONDS,
  };

  return {
    audioBitrate: config.audioBitrate,
    codec: "mp3",
    composition: SONG_AUDIO_PREVIEW_COMPOSITION_ID,
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

export async function startSongPreviewRender({
  songId,
  version,
}: {
  songId: string;
  version: KieSongVersion;
}): Promise<Omit<SongPreviewRender, "versionId">> {
  const outKey = `songs/generated/${songId}/${version.id}/preview.mp3`;
  const result = await renderMediaOnLambda(
    buildSongPreviewRenderInput({ songId, version }),
  );

  return {
    bucketName: result.bucketName,
    outKey,
    renderId: result.renderId,
  };
}

export async function getSongPreviewRenderProgress(
  render: SongPreviewRender,
): Promise<SongPreviewRenderProgress> {
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
        ? "Remotion song preview rendering failed."
        : null),
    outputFile: progress.outputFile,
    progress: progress.overallProgress,
  };
}
