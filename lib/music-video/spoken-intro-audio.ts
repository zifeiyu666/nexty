export const SPOKEN_INTRO_AUDIO_COMPOSITION_ID = "SpokenIntroAudio";
export const SPOKEN_INTRO_AUDIO_FPS = 30;
export const SPOKEN_INTRO_FADE_OUT_MS = 300;
export const SPOKEN_INTRO_SILENCE_MS = 400;
export const SPOKEN_INTRO_SONG_FADE_IN_MS = 500;

export type SpokenIntroAudioProps = {
  introAudioUrl: string;
  introDurationSeconds: number;
  songAudioUrl: string;
  songDurationSeconds: number;
};

export function getSpokenIntroAudioTiming({
  introDurationSeconds,
  songDurationSeconds,
}: Pick<
  SpokenIntroAudioProps,
  "introDurationSeconds" | "songDurationSeconds"
>) {
  const songStartOffsetSeconds =
    introDurationSeconds + SPOKEN_INTRO_SILENCE_MS / 1000;
  const durationSeconds = songStartOffsetSeconds + songDurationSeconds;

  return {
    durationInFrames: Math.ceil(durationSeconds * SPOKEN_INTRO_AUDIO_FPS),
    durationSeconds,
    introDurationInFrames: Math.ceil(
      introDurationSeconds * SPOKEN_INTRO_AUDIO_FPS,
    ),
    songStartInFrames: Math.ceil(
      songStartOffsetSeconds * SPOKEN_INTRO_AUDIO_FPS,
    ),
    songStartOffsetSeconds,
  };
}
