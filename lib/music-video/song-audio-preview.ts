export const SONG_AUDIO_PREVIEW_COMPOSITION_ID = "SongAudioPreview";
export const SONG_AUDIO_PREVIEW_FPS = 30;
export const SONG_AUDIO_PREVIEW_LIMIT_SECONDS = 60;

export type SongAudioPreviewProps = {
  audioUrl: string;
  audioDurationSeconds: number;
  previewLimitSeconds: number;
};

export function getSongAudioPreviewDurationSeconds({
  audioDurationSeconds,
  previewLimitSeconds,
}: Pick<
  SongAudioPreviewProps,
  "audioDurationSeconds" | "previewLimitSeconds"
>): number {
  if (audioDurationSeconds > 0) {
    return Math.min(audioDurationSeconds, previewLimitSeconds);
  }

  return previewLimitSeconds;
}

export function getSongAudioPreviewDurationInFrames(
  props: Pick<
    SongAudioPreviewProps,
    "audioDurationSeconds" | "previewLimitSeconds"
  >,
): number {
  return Math.max(
    1,
    Math.ceil(
      getSongAudioPreviewDurationSeconds(props) * SONG_AUDIO_PREVIEW_FPS,
    ),
  );
}
