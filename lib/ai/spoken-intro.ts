import type { KieAlignedWord, KieTimestampedLyrics } from "./adapters/kie-suno";

export type SpokenIntro = {
  alignedWords: KieAlignedWord[];
  audioKey: string;
  audioUrl: string;
  durationSeconds: number;
  transcript: string;
};

const SPOKEN_INTRO_TAG = "[Spoken Intro / Narration]";

export function addSpokenIntroToLyrics(
  lyrics: string,
  blessing: string,
): string {
  const text = blessing.trim();
  if (!text || lyrics.includes(SPOKEN_INTRO_TAG)) return lyrics.trim();
  return `${SPOKEN_INTRO_TAG}\n${text}\n\n${lyrics.trim()}`;
}

export function mergeSpokenIntroTimeline({
  intro,
  songStartOffsetSeconds,
  songTimeline,
}: {
  intro: Pick<SpokenIntro, "alignedWords">;
  songStartOffsetSeconds: number;
  songTimeline?: KieTimestampedLyrics;
}): KieTimestampedLyrics {
  const offset = Math.max(0, songStartOffsetSeconds);
  return {
    alignedWords: [
      ...intro.alignedWords,
      ...(songTimeline?.alignedWords ?? []).map((word) => ({
        ...word,
        startS: word.startS + offset,
        endS: word.endS + offset,
      })),
    ],
  };
}
