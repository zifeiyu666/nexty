export type LyricCue = {
  id: string;
  start: number;
  end: number;
  text: string;
};

export type UploadedPhoto = {
  id: string;
  name: string;
  objectUrl: string;
};

export type PhotoAssignment = {
  cueId: string;
  photoId: string;
};

export type MusicVideoTimeline = {
  templateId: "photo-slideshow";
  songTitle: string;
  audioUrl: string;
  duration: number;
  lyrics: LyricCue[];
  photos: UploadedPhoto[];
  assignments: PhotoAssignment[];
};

export type ResolvedCuePhoto = {
  cue: LyricCue;
  photo: UploadedPhoto | null;
};

export type AlignedLyricWord = {
  word: string;
  startS: number;
  endS: number;
};

const DEFAULT_DURATION = 30;
const TIMESTAMPED_LINE =
  /^\s*(?:\[)?(?:(\d{1,2}):)?(\d{1,2}):(\d{2})(?:[.,](\d{1,3}))?(?:\])?\s*(.*)$/;
const SECTION_LABEL = /^\s*\[[^\]]+\]\s*$/;

function normalizeDuration(duration?: number | null) {
  return Number.isFinite(duration) && duration && duration > 0
    ? duration
    : DEFAULT_DURATION;
}

function parseTimestamp(match: RegExpMatchArray) {
  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  const fraction = match[4] ? Number(`0.${match[4]}`) : 0;

  return hours * 3600 + minutes * 60 + seconds + fraction;
}

function createCueId(index: number) {
  return `cue-${index + 1}`;
}

function cleanUntimedLines(lyrics: string) {
  return lyrics
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !SECTION_LABEL.test(line));
}

function normalizeLyricWords(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function normalizeCueEnd(start: number, nextStart: number | undefined, duration: number) {
  if (typeof nextStart === "number" && nextStart > start) return nextStart;
  if (duration > start) return duration;
  return start + 4;
}

export function parseTimestampedLyrics(
  lyrics: string,
  duration?: number | null,
): LyricCue[] {
  const effectiveDuration = normalizeDuration(duration);
  const timestamped = cleanUntimedLines(lyrics)
    .map((line) => {
      const match = line.match(TIMESTAMPED_LINE);
      if (!match) return null;
      const text = (match[5] ?? "").trim();

      return {
        start: parseTimestamp(match),
        text: text || "Instrumental",
      };
    })
    .filter((cue): cue is { start: number; text: string } => Boolean(cue))
    .sort((first, second) => first.start - second.start);

  if (timestamped.length > 0) {
    return timestamped.map((cue, index) => ({
      id: createCueId(index),
      start: cue.start,
      end: normalizeCueEnd(
        cue.start,
        timestamped[index + 1]?.start,
        effectiveDuration,
      ),
      text: cue.text,
    }));
  }

  const lines = cleanUntimedLines(lyrics);
  if (lines.length === 0) {
    return [
      {
        id: createCueId(0),
        start: 0,
        end: effectiveDuration,
        text: "Instrumental",
      },
    ];
  }

  const segment = effectiveDuration / lines.length;

  return lines.map((line, index) => ({
    id: createCueId(index),
    start: Number((index * segment).toFixed(3)),
    end: Number(((index + 1) * segment).toFixed(3)),
    text: line,
  }));
}

export function buildLyricCuesFromAlignedWords({
  lyrics,
  alignedWords,
  duration,
}: {
  lyrics: string;
  alignedWords: AlignedLyricWord[];
  duration?: number | null;
}): LyricCue[] {
  const lyricLines = cleanUntimedLines(lyrics);
  const words = alignedWords.filter(
    (word) =>
      word.word.trim() &&
      Number.isFinite(word.startS) &&
      Number.isFinite(word.endS),
  );

  if (!lyricLines.length || !words.length) {
    return parseTimestampedLyrics(lyrics, duration);
  }

  let cursor = 0;
  const cues: LyricCue[] = [];

  for (const line of lyricLines) {
    const lineWordCount = normalizeLyricWords(line).length;
    if (lineWordCount === 0) continue;

    const lineWords = words.slice(cursor, cursor + lineWordCount);
    if (lineWords.length === 0) break;

    cues.push({
      id: createCueId(cues.length),
      start: lineWords[0]?.startS ?? 0,
      end: lineWords[lineWords.length - 1]?.endS ?? lineWords[0]?.endS ?? 0,
      text: line,
    });
    cursor += lineWordCount;
  }

  return cues.length ? cues : parseTimestampedLyrics(lyrics, duration);
}

export function resolveCuePhotos({
  cues,
  photos,
  assignments,
  fallbackImageUrl,
}: {
  cues: LyricCue[];
  photos: UploadedPhoto[];
  assignments: PhotoAssignment[];
  fallbackImageUrl?: string | null;
}): ResolvedCuePhoto[] {
  const photoById = new Map(photos.map((photo) => [photo.id, photo]));
  const assignmentByCueId = new Map(
    assignments.map((assignment) => [assignment.cueId, assignment.photoId]),
  );
  const artworkFallback: UploadedPhoto | null = fallbackImageUrl
    ? {
        id: "song-artwork",
        name: "Song artwork",
        objectUrl: fallbackImageUrl,
      }
    : null;
  let activePhoto = photos[0] ?? artworkFallback;

  return cues.map((cue) => {
    const assignedPhotoId = assignmentByCueId.get(cue.id);
    const assignedPhoto = assignedPhotoId
      ? photoById.get(assignedPhotoId)
      : undefined;

    if (assignedPhoto) {
      activePhoto = assignedPhoto;
    }

    return {
      cue,
      photo: activePhoto,
    };
  });
}

export function findActiveCue(cues: LyricCue[], time: number) {
  if (cues.length === 0) return null;
  const currentTime = Math.max(0, time);

  return (
    cues.find((cue) => currentTime >= cue.start && currentTime < cue.end) ??
    cues[cues.length - 1] ??
    null
  );
}

export function buildPhotoSlideshowTimeline({
  songTitle,
  audioUrl,
  duration,
  lyrics,
  photos,
  assignments,
  timestampedLyrics,
}: {
  songTitle: string;
  audioUrl: string;
  duration?: number | null;
  lyrics: string;
  photos: UploadedPhoto[];
  assignments: PhotoAssignment[];
  timestampedLyrics?: { alignedWords: AlignedLyricWord[] } | null;
}): MusicVideoTimeline {
  const effectiveDuration = normalizeDuration(duration);
  const lyricCues = timestampedLyrics?.alignedWords?.length
    ? buildLyricCuesFromAlignedWords({
        lyrics,
        alignedWords: timestampedLyrics.alignedWords,
        duration: effectiveDuration,
      })
    : parseTimestampedLyrics(lyrics, effectiveDuration);

  return {
    templateId: "photo-slideshow",
    songTitle,
    audioUrl,
    duration: effectiveDuration,
    lyrics: lyricCues,
    photos,
    assignments,
  };
}
