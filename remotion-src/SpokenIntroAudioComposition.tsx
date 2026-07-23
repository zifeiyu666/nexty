import { Audio, interpolate, Sequence, useVideoConfig } from "remotion";

import {
  getSpokenIntroAudioTiming,
  SPOKEN_INTRO_FADE_OUT_MS,
  SPOKEN_INTRO_SONG_FADE_IN_MS,
  type SpokenIntroAudioProps,
} from "../lib/music-video/spoken-intro-audio";

export function SpokenIntroAudioComposition({
  introAudioUrl,
  introDurationSeconds,
  songAudioUrl,
  songDurationSeconds,
}: SpokenIntroAudioProps) {
  const { fps } = useVideoConfig();
  const timing = getSpokenIntroAudioTiming({
    introDurationSeconds,
    songDurationSeconds,
  });
  const introFadeFrames = Math.max(
    1,
    Math.round((SPOKEN_INTRO_FADE_OUT_MS / 1000) * fps),
  );
  const songFadeFrames = Math.max(
    1,
    Math.round((SPOKEN_INTRO_SONG_FADE_IN_MS / 1000) * fps),
  );

  return (
    <>
      <Sequence durationInFrames={timing.introDurationInFrames} layout="none">
        <Audio
          src={introAudioUrl}
          volume={(frame) =>
            interpolate(
              frame,
              [timing.introDurationInFrames - introFadeFrames, timing.introDurationInFrames],
              [1, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            )
          }
        />
      </Sequence>
      <Sequence from={timing.songStartInFrames} layout="none">
        <Audio
          src={songAudioUrl}
          volume={(frame) =>
            interpolate(frame, [0, songFadeFrames], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
      </Sequence>
    </>
  );
}
