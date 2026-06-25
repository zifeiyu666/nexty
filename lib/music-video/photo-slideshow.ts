export type LyricCue = {
  id: string;
  start: number;
  end: number;
  text: string;
};

export type UploadedPhoto = {
  id: string;
  mediaType?: "image" | "video";
  name: string;
  objectUrl: string;
  url?: string;
  r2Key?: string;
  isCover?: boolean;
};

export type PhotoAssignment = {
  cueId: string;
  photoId: string;
};

export type TransitionType =
  | "cross-dissolve"
  | "motion-blur"
  | "light-leak"
  | "zoom-push";

export type TransitionAssignment = {
  fromCueId: string;
  toCueId: string;
  type: TransitionType;
};

export type LyricsPosition = "top" | "center" | "bottom";

export type LyricsEntranceMode =
  | "motion-blur-slip"
  | "staggered-glow-reveal"
  | "rolling-flow";

export type LyricsStyleConfig = {
  color: string;
  entrance: LyricsEntranceMode;
  fontFamily: string;
  fontSize: number;
  position: LyricsPosition;
  strokeColor: string;
  strokeWidth: number;
};

export type AtmosphereOverlayOption = {
  durationInFrames: number;
  id: string;
  label: string;
  src: string;
};

export type AtmosphereOverlayConfig = {
  opacity: number;
  overlayId: string | null;
};

export function getUploadedMediaType(
  media: Pick<UploadedPhoto, "mediaType"> | null | undefined,
) {
  return media?.mediaType === "video" ? "video" : "image";
}

export type LyricsStyleInput = Omit<Partial<LyricsStyleConfig>, "entrance"> & {
  entrance?: LyricsEntranceMode | "" | null;
};

export type AtmosphereOverlayInput = Partial<AtmosphereOverlayConfig> | null;

export type MusicVideoTemplateId = "photo-slideshow" | "minimal-vinyl";

type BaseMusicVideoTimeline = {
  templateId: MusicVideoTemplateId;
  songTitle: string;
  audioUrl: string;
  duration: number;
  lyrics: LyricCue[];
  photos: UploadedPhoto[];
  assignments: PhotoAssignment[];
  atmosphereOverlay?: AtmosphereOverlayConfig;
  coverPhoto?: UploadedPhoto;
  transitions: TransitionAssignment[];
  lyricsStyle?: LyricsStyleConfig;
};

export type PhotoSlideshowTimeline = BaseMusicVideoTimeline & {
  templateId: "photo-slideshow";
};

export type MinimalVinylTimeline = BaseMusicVideoTimeline & {
  templateId: "minimal-vinyl";
};

export type MusicVideoTimeline = PhotoSlideshowTimeline | MinimalVinylTimeline;

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
export const DEFAULT_TRANSITION_TYPE: TransitionType = "cross-dissolve";
export const ATMOSPHERE_OVERLAY_OPTIONS: AtmosphereOverlayOption[] = [
  {
    durationInFrames: 1800,
    id: "soft-star-drift",
    label: "Soft Star Drift",
    src: "/overlay/video/138553-769988105.mp4",
  },
  {
    durationInFrames: 375,
    id: "golden-sparkle",
    label: "Golden Sparkle",
    src: "/overlay/video/32261-391054857.mp4",
  },
  {
    durationInFrames: 1800,
    id: "cinematic-light-rain",
    label: "Cinematic Light Rain",
    src: "/overlay/video/243312.mp4",
  },
  {
    durationInFrames: 240,
    id: "warm-bokeh-flow",
    label: "Warm Bokeh Flow",
    src: "/overlay/video/199558-910609536.mp4",
  },
  {
    durationInFrames: 241,
    id: "dream-glitter",
    label: "Dream Glitter",
    src: "/overlay/video/48569-454825064.mp4",
  },
];
export const DEFAULT_ATMOSPHERE_OVERLAY: AtmosphereOverlayConfig = {
  opacity: 0.36,
  overlayId: null,
};
export const DEFAULT_LYRICS_STYLE: LyricsStyleConfig = {
  color: "#ffffff",
  entrance: "motion-blur-slip",
  fontFamily: "Georgia, serif",
  fontSize: 54,
  position: "bottom",
  strokeColor: "#111111",
  strokeWidth: 0,
};
export const LYRICS_ENTRANCE_MODES: LyricsEntranceMode[] = [
  "motion-blur-slip",
  "staggered-glow-reveal",
  "rolling-flow",
];
export const TRANSITION_TYPES: TransitionType[] = [
  "cross-dissolve",
  "motion-blur",
  "light-leak",
  "zoom-push",
];
const TIMESTAMPED_LINE =
  /^\s*(?:\[)?(?:(\d{1,2}):)?(\d{1,2}):(\d{2})(?:[.,](\d{1,3}))?(?:\])?\s*(.*)$/;
const SECTION_LABEL = /^\s*\[[^\]]+\]\s*$/;

function normalizeDuration(duration?: number | null) {
  return Number.isFinite(duration) && duration && duration > 0
    ? duration
    : DEFAULT_DURATION;
}

function normalizeLyricsEntranceMode(
  entrance?: LyricsEntranceMode | "" | null,
): LyricsEntranceMode {
  return entrance && LYRICS_ENTRANCE_MODES.includes(entrance)
    ? entrance
    : DEFAULT_LYRICS_STYLE.entrance;
}

export function normalizeLyricsStyleConfig(
  lyricsStyle?: LyricsStyleInput | null,
): LyricsStyleConfig {
  const fontSize =
    lyricsStyle && Number.isFinite(lyricsStyle.fontSize)
      ? Math.max(1, lyricsStyle.fontSize ?? DEFAULT_LYRICS_STYLE.fontSize)
      : DEFAULT_LYRICS_STYLE.fontSize;
  const strokeWidth =
    lyricsStyle && Number.isFinite(lyricsStyle.strokeWidth)
      ? Math.max(0, lyricsStyle.strokeWidth ?? DEFAULT_LYRICS_STYLE.strokeWidth)
      : DEFAULT_LYRICS_STYLE.strokeWidth;

  return {
    ...DEFAULT_LYRICS_STYLE,
    ...lyricsStyle,
    entrance: normalizeLyricsEntranceMode(lyricsStyle?.entrance),
    fontSize,
    strokeWidth,
  };
}

function normalizeOverlayOpacity(opacity?: number | null) {
  return typeof opacity === "number" && Number.isFinite(opacity)
    ? Math.min(Math.max(opacity, 0), 1)
    : DEFAULT_ATMOSPHERE_OVERLAY.opacity;
}

export function normalizeAtmosphereOverlayConfig(
  overlay?: AtmosphereOverlayInput,
): AtmosphereOverlayConfig {
  const overlayId = overlay?.overlayId ?? null;
  const isKnownOverlay =
    typeof overlayId === "string" &&
    ATMOSPHERE_OVERLAY_OPTIONS.some((option) => option.id === overlayId);

  return {
    opacity: normalizeOverlayOpacity(overlay?.opacity),
    overlayId: isKnownOverlay ? overlayId : null,
  };
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

export function createCoverPhoto(
  fallbackImageUrl?: string | null,
): UploadedPhoto | null {
  return fallbackImageUrl
    ? {
        id: "song-artwork",
        isCover: true,
        mediaType: "image",
        name: "Song artwork",
        objectUrl: fallbackImageUrl,
        url: fallbackImageUrl,
      }
    : null;
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
  coverPhoto,
  fallbackImageUrl,
}: {
  cues: LyricCue[];
  photos: UploadedPhoto[];
  assignments: PhotoAssignment[];
  coverPhoto?: UploadedPhoto | null;
  fallbackImageUrl?: string | null;
}): ResolvedCuePhoto[] {
  const photoById = new Map(photos.map((photo) => [photo.id, photo]));
  const assignmentByCueId = new Map(
    assignments.map((assignment) => [assignment.cueId, assignment.photoId]),
  );
  const artworkFallback = coverPhoto ?? createCoverPhoto(fallbackImageUrl);
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

export function buildDefaultTransitions(
  cues: LyricCue[],
): TransitionAssignment[] {
  return cues.slice(0, -1).map((cue, index) => ({
    fromCueId: cue.id,
    toCueId: cues[index + 1].id,
    type: DEFAULT_TRANSITION_TYPE,
  }));
}

export function buildEvenPhotoAssignments({
  cues,
  photos,
}: {
  cues: LyricCue[];
  photos: UploadedPhoto[];
}): PhotoAssignment[] {
  if (cues.length === 0 || photos.length === 0) return [];

  return photos.slice(1).map((photo, index) => {
    const cueIndex = Math.min(
      cues.length - 1,
      Math.floor(((index + 1) * cues.length) / photos.length),
    );

    return {
      cueId: cues[cueIndex].id,
      photoId: photo.id,
    };
  });
}

export function buildRandomTransitionAssignments({
  cues,
  random = Math.random,
}: {
  cues: LyricCue[];
  random?: () => number;
}): TransitionAssignment[] {
  return cues.slice(0, -1).map((cue, index) => {
    const transitionIndex = Math.min(
      TRANSITION_TYPES.length - 1,
      Math.floor(random() * TRANSITION_TYPES.length),
    );

    return {
      fromCueId: cue.id,
      toCueId: cues[index + 1].id,
      type: TRANSITION_TYPES[transitionIndex],
    };
  });
}

export function normalizeTransitions({
  cues,
  transitions = [],
}: {
  cues: LyricCue[];
  transitions?: TransitionAssignment[];
}) {
  const customByPair = new Map(
    transitions.map((transition) => [
      `${transition.fromCueId}:${transition.toCueId}`,
      transition,
    ]),
  );

  return buildDefaultTransitions(cues).map((transition) => {
    const custom = customByPair.get(
      `${transition.fromCueId}:${transition.toCueId}`,
    );

    return custom ? { ...transition, type: custom.type } : transition;
  });
}

export function shouldShowPhotoTransition({
  fromPhotoId,
  toPhotoId,
}: {
  fromPhotoId?: string | null;
  toPhotoId?: string | null;
}) {
  return Boolean(fromPhotoId && toPhotoId && fromPhotoId !== toPhotoId);
}

export function buildPhotoSlideshowTimeline({
  songTitle,
  audioUrl,
  duration,
  lyrics,
  photos,
  assignments,
  fallbackImageUrl,
  timestampedLyrics,
  transitions,
  lyricsStyle,
  atmosphereOverlay,
}: {
  songTitle: string;
  audioUrl: string;
  duration?: number | null;
  lyrics: string;
  photos: UploadedPhoto[];
  assignments: PhotoAssignment[];
  fallbackImageUrl?: string | null;
  timestampedLyrics?: { alignedWords: AlignedLyricWord[] } | null;
  transitions?: TransitionAssignment[];
  lyricsStyle?: LyricsStyleConfig;
  atmosphereOverlay?: AtmosphereOverlayInput;
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
    atmosphereOverlay: normalizeAtmosphereOverlayConfig(atmosphereOverlay),
    coverPhoto:
      photos.length === 0
        ? createCoverPhoto(fallbackImageUrl) ?? undefined
        : undefined,
    lyricsStyle: normalizeLyricsStyleConfig(lyricsStyle),
    transitions: normalizeTransitions({ cues: lyricCues, transitions }),
  };
}

export function buildMinimalVinylTimeline({
  songTitle,
  audioUrl,
  duration,
  lyrics,
  fallbackImageUrl,
  timestampedLyrics,
}: {
  songTitle: string;
  audioUrl: string;
  duration?: number | null;
  lyrics: string;
  fallbackImageUrl?: string | null;
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
    templateId: "minimal-vinyl",
    songTitle,
    audioUrl,
    duration: effectiveDuration,
    lyrics: lyricCues,
    photos: [],
    assignments: [],
    coverPhoto: createCoverPhoto(fallbackImageUrl) ?? undefined,
    transitions: [],
  };
}
