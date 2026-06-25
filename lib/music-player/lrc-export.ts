import {
  buildLyricCuesFromAlignedWords,
  parseTimestampedLyrics,
  type AlignedLyricWord,
  type LyricCue,
} from "@/lib/music-video/photo-slideshow";

type TimestampedLyrics = {
  alignedWords: AlignedLyricWord[];
} | null;

type BuildLrcTextInput = {
  title: string;
  lyrics: string;
  duration?: number | null;
  timestampedLyrics?: TimestampedLyrics;
};

const FILE_NAME_UNSAFE_CHARS = /[<>:"/\\|?*\x00-\x1f]+/g;
const SECTION_LABEL = /^\s*\[[^\]]+\]\s*$/;
const LYRICS_METADATA_LINE =
  /^\s*(?:title|song title|标题|歌名)\s*[:：]\s*.+$/i;

function cleanLrcTagValue(value: string) {
  return value
    .replace(/[\r\n\]]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getExportableLyrics(lyrics: string) {
  return lyrics
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !SECTION_LABEL.test(line))
    .filter((line) => !LYRICS_METADATA_LINE.test(line))
    .join("\n");
}

function formatLrcTimestamp(seconds: number) {
  const totalHundredths = Math.max(0, Math.round(seconds * 100));
  const minutes = Math.floor(totalHundredths / 6000);
  const remainingHundredths = totalHundredths % 6000;
  const secondsPart = Math.floor(remainingHundredths / 100);
  const hundredths = remainingHundredths % 100;

  return `${minutes.toString().padStart(2, "0")}:${secondsPart
    .toString()
    .padStart(2, "0")}.${hundredths.toString().padStart(2, "0")}`;
}

function formatLengthTag(duration?: number | null) {
  if (!Number.isFinite(duration) || !duration || duration <= 0) return null;

  const totalSeconds = Math.floor(duration);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function buildLrcCues({
  lyrics,
  duration,
  timestampedLyrics,
}: BuildLrcTextInput): LyricCue[] {
  const exportableLyrics = getExportableLyrics(lyrics);
  const alignedWords = timestampedLyrics?.alignedWords ?? [];

  if (alignedWords.length > 0) {
    return buildLyricCuesFromAlignedWords({
      lyrics: exportableLyrics,
      alignedWords,
      duration,
    });
  }

  return parseTimestampedLyrics(exportableLyrics, duration);
}

export function buildLrcFileName(title: string) {
  const safeTitle = title
    .replace(FILE_NAME_UNSAFE_CHARS, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\.+$/g, "");

  return `${safeTitle || "lyrics"}.lrc`;
}

export function buildLrcText(input: BuildLrcTextInput) {
  const title = cleanLrcTagValue(input.title) || "Untitled song";
  const length = formatLengthTag(input.duration);
  const cues = buildLrcCues(input);
  const header = [
    `[ti:${title}]`,
    length ? `[length:${length}]` : null,
    "[by:CustomSong]",
    "[offset:0]",
  ].filter((line): line is string => Boolean(line));

  return [
    ...header,
    "",
    ...cues.map((cue) => `[${formatLrcTimestamp(cue.start)}]${cue.text}`),
    "",
  ].join("\n");
}
