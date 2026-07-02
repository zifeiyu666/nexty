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

export type WaveRadioBackgroundOption = {
  durationInFrames: number;
  id: string;
  label: string;
  src: string;
};

const VIDEO_FILE_EXTENSION_PATTERN =
  /\.(?:mp4|m4v|mov|webm|ogg|ogv)(?:[?#].*)?$/i;
const LYRIC_METADATA_LINE = /^(?:title)\s*:/i;

function inferMediaTypeFromValue(value?: string | null) {
  if (!value) return null;
  return VIDEO_FILE_EXTENSION_PATTERN.test(value.trim()) ? "video" : null;
}

export function getUploadedMediaType(
  media:
    | Pick<UploadedPhoto, "mediaType" | "name" | "objectUrl" | "url">
    | null
    | undefined,
) {
  if (media?.mediaType === "video") return "video";
  if (media?.mediaType === "image") return "image";

  return (
    inferMediaTypeFromValue(media?.name) ??
    inferMediaTypeFromValue(media?.url) ??
    inferMediaTypeFromValue(media?.objectUrl) ??
    "image"
  );
}

export type LyricsStyleInput = Omit<Partial<LyricsStyleConfig>, "entrance"> & {
  entrance?: LyricsEntranceMode | "" | null;
};

export type AtmosphereOverlayInput = Partial<AtmosphereOverlayConfig> | null;

export type MusicVideoTemplateId =
  | "photo-slideshow"
  | "minimal-vinyl"
  | "wave-radio";

export type MusicVideoRenderDimensions = {
  width: number;
  height: number;
};

type BaseMusicVideoTimeline = {
  templateId: MusicVideoTemplateId;
  songTitle: string;
  audioUrl: string;
  duration: number;
  width: number;
  height: number;
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
  backgroundBlur?: number;
  backgroundPhoto?: UploadedPhoto;
  templateId: "minimal-vinyl";
};

export type WaveRadioTimeline = BaseMusicVideoTimeline & {
  templateId: "wave-radio";
  waveRadioBackgroundId: string;
};

export type MusicVideoTimeline =
  | PhotoSlideshowTimeline
  | MinimalVinylTimeline
  | WaveRadioTimeline;

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
const OVERLAY_CDN_BASE_URL = "https://cdn.customsong.top/overlay";
const overlayCdnSrc = (path: string) => `${OVERLAY_CDN_BASE_URL}/${path}`;
const DEFAULT_RENDER_DIMENSIONS: MusicVideoRenderDimensions = {
  width: 1080,
  height: 1920,
};

export const DEFAULT_TRANSITION_TYPE: TransitionType = "cross-dissolve";
export const ATMOSPHERE_OVERLAY_OPTIONS: AtmosphereOverlayOption[] = [
  {
    durationInFrames: 1800,
    id: "soft-star-drift",
    label: "Soft Star Drift",
    src: overlayCdnSrc("video/138553-769988105.mp4"),
  },
  {
    durationInFrames: 375,
    id: "golden-sparkle",
    label: "Golden Sparkle",
    src: overlayCdnSrc("video/32261-391054857.mp4"),
  },
  {
    durationInFrames: 1800,
    id: "cinematic-light-rain",
    label: "Cinematic Light Rain",
    src: overlayCdnSrc("video/243312.mp4"),
  },
  {
    durationInFrames: 240,
    id: "warm-bokeh-flow",
    label: "Warm Bokeh Flow",
    src: overlayCdnSrc("video/199558-910609536.mp4"),
  },
  {
    durationInFrames: 241,
    id: "dream-glitter",
    label: "Dream Glitter",
    src: overlayCdnSrc("video/48569-454825064.mp4"),
  },
];
export const WAVE_RADIO_BACKGROUND_OPTIONS: WaveRadioBackgroundOption[] = [
  {
    durationInFrames: 299,
    id: "crimson-pulse-107256",
    label: "Crimson Pulse",
    src: overlayCdnSrc("bg-video/107256-678130118.mp4"),
  },
  {
    durationInFrames: 993,
    id: "midnight-glow-11722",
    label: "Midnight Glow",
    src: overlayCdnSrc("bg-video/720p/11722-231759069.mp4"),
  },
  {
    durationInFrames: 1066,
    id: "aurora-119885",
    label: "Aurora Signal",
    src: overlayCdnSrc("bg-video/720p/119885-719283332.mp4"),
  },
  {
    durationInFrames: 299,
    id: "ember-veil-127216",
    label: "Ember Veil",
    src: overlayCdnSrc("bg-video/127216-738093640.mp4"),
  },
  {
    durationInFrames: 203,
    id: "glass-shimmer-132427",
    label: "Glass Shimmer",
    src: overlayCdnSrc("bg-video/132427-753435588.mp4"),
  },
  {
    durationInFrames: 543,
    id: "sunset-drift-147206",
    label: "Sunset Drift",
    src: overlayCdnSrc("bg-video/147206-791344441.mp4"),
  },
  {
    durationInFrames: 376,
    id: "violet-field-148029",
    label: "Violet Field",
    src: overlayCdnSrc("bg-video/148029-793140704.mp4"),
  },
  {
    durationInFrames: 828,
    id: "starlight-rain-151469",
    label: "Starlight Rain",
    src: overlayCdnSrc("bg-video/151469-800921014.mp4"),
  },
  {
    durationInFrames: 677,
    id: "lilac-mist-152798",
    label: "Lilac Mist",
    src: overlayCdnSrc("bg-video/152798-803733100.mp4"),
  },
  {
    durationInFrames: 1441,
    id: "solar-spark-154006",
    label: "Solar Spark",
    src: overlayCdnSrc("bg-video/154006-806572051.mp4"),
  },
  {
    durationInFrames: 301,
    id: "velvet-night-155630",
    label: "Velvet Night",
    src: overlayCdnSrc("bg-video/155630-810650602.mp4"),
  },
  {
    durationInFrames: 505,
    id: "rose-orbit-175741",
    label: "Rose Orbit",
    src: overlayCdnSrc("bg-video/720p/175741-854057998.mp4"),
  },
  {
    durationInFrames: 240,
    id: "warm-bokeh-199558",
    label: "Warm Bokeh",
    src: overlayCdnSrc("bg-video/199558-910609536.mp4"),
  },
  {
    durationInFrames: 476,
    id: "horizon-bloom-230851",
    label: "Horizon Bloom",
    src: overlayCdnSrc("bg-video/720p/230851.mp4"),
  },
  {
    durationInFrames: 762,
    id: "electric-haze-248842",
    label: "Electric Haze",
    src: overlayCdnSrc("bg-video/720p/248842.mp4"),
  },
  {
    durationInFrames: 255,
    id: "magma-fall-265607",
    label: "Magma Fall",
    src: overlayCdnSrc("bg-video/720p/265607.mp4"),
  },
  {
    durationInFrames: 252,
    id: "aqua-ray-265648",
    label: "Aqua Ray",
    src: overlayCdnSrc("bg-video/265648.mp4"),
  },
  {
    durationInFrames: 912,
    id: "vertical-lights-266987",
    label: "Vertical Lights",
    src: overlayCdnSrc("bg-video/720p/266987.mp4"),
  },
  {
    durationInFrames: 1024,
    id: "blue-current-277316",
    label: "Blue Current",
    src: overlayCdnSrc("bg-video/720p/277316.mp4"),
  },
  {
    durationInFrames: 481,
    id: "flare-canopy-284542",
    label: "Flare Canopy",
    src: overlayCdnSrc("bg-video/284542.mp4"),
  },
  {
    durationInFrames: 207,
    id: "neon-tunnel-302596",
    label: "Neon Tunnel",
    src: overlayCdnSrc("bg-video/302596.mp4"),
  },
  {
    durationInFrames: 313,
    id: "vertical-aura-315351",
    label: "Vertical Aura",
    src: overlayCdnSrc("bg-video/315351.mp4"),
  },
  {
    durationInFrames: 1782,
    id: "comet-stream-45316",
    label: "Comet Stream",
    src: overlayCdnSrc("bg-video/45316-442643130.mp4"),
  },
  {
    durationInFrames: 324,
    id: "sunset-grain-58142",
    label: "Sunset Grain",
    src: overlayCdnSrc("bg-video/720p/58142-487508532.mp4"),
  },
  {
    durationInFrames: 450,
    id: "light-leak-62666",
    label: "Light Leak",
    src: overlayCdnSrc("bg-video/62666-504665647.mp4"),
  },
  {
    durationInFrames: 141,
    id: "prism-bloom-6962",
    label: "Prism Bloom",
    src: overlayCdnSrc("bg-video/6962-197634410.mp4"),
  },
  {
    durationInFrames: 444,
    id: "ember-cloud-84916",
    label: "Ember Cloud",
    src: overlayCdnSrc("bg-video/84916-587646675.mp4"),
  },
];
export const DEFAULT_WAVE_RADIO_BACKGROUND =
  WAVE_RADIO_BACKGROUND_OPTIONS[0];
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

function normalizeRenderDimension(value: number | null | undefined, fallback: number) {
  return Number.isFinite(value) && value && value > 0
    ? Math.max(1, Math.round(value))
    : fallback;
}

export function normalizeRenderDimensions(
  dimensions?: Partial<MusicVideoRenderDimensions> | null,
): MusicVideoRenderDimensions {
  return {
    width: normalizeRenderDimension(
      dimensions?.width,
      DEFAULT_RENDER_DIMENSIONS.width,
    ),
    height: normalizeRenderDimension(
      dimensions?.height,
      DEFAULT_RENDER_DIMENSIONS.height,
    ),
  };
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

export function normalizeWaveRadioBackgroundId(backgroundId?: string | null) {
  const isKnownBackground = WAVE_RADIO_BACKGROUND_OPTIONS.some(
    (option) => option.id === backgroundId,
  );

  return isKnownBackground
    ? (backgroundId as string)
    : DEFAULT_WAVE_RADIO_BACKGROUND.id;
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
    .filter((line) => line && !SECTION_LABEL.test(line) && !LYRIC_METADATA_LINE.test(line));
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
  const firstCue = cues[0];

  if (firstCue && currentTime < firstCue.start) return null;

  return cues.find((cue) => currentTime >= cue.start && currentTime < cue.end) ?? cues[cues.length - 1] ?? null;
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
  dimensions,
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
  dimensions?: Partial<MusicVideoRenderDimensions> | null;
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
  const renderDimensions = normalizeRenderDimensions(dimensions);
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
    width: renderDimensions.width,
    height: renderDimensions.height,
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
  backgroundBlur,
  backgroundPhoto,
  duration,
  dimensions,
  lyrics,
  fallbackImageUrl,
  coverPhoto,
  timestampedLyrics,
  lyricsStyle,
}: {
  songTitle: string;
  audioUrl: string;
  backgroundBlur?: number | null;
  backgroundPhoto?: UploadedPhoto | null;
  duration?: number | null;
  dimensions?: Partial<MusicVideoRenderDimensions> | null;
  lyrics: string;
  fallbackImageUrl?: string | null;
  coverPhoto?: UploadedPhoto | null;
  timestampedLyrics?: { alignedWords: AlignedLyricWord[] } | null;
  lyricsStyle?: LyricsStyleConfig;
}): MusicVideoTimeline {
  const effectiveDuration = normalizeDuration(duration);
  const renderDimensions = normalizeRenderDimensions(dimensions);
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
    width: renderDimensions.width,
    height: renderDimensions.height,
    lyrics: lyricCues,
    photos: [],
    assignments: [],
    backgroundBlur:
      typeof backgroundBlur === "number" && Number.isFinite(backgroundBlur)
        ? Math.min(Math.max(backgroundBlur, 0), 64)
        : 42,
    backgroundPhoto: backgroundPhoto ?? undefined,
    coverPhoto: coverPhoto ?? createCoverPhoto(fallbackImageUrl) ?? undefined,
    lyricsStyle: normalizeLyricsStyleConfig(lyricsStyle),
    transitions: [],
  };
}

export function buildWaveRadioTimeline({
  songTitle,
  audioUrl,
  duration,
  dimensions,
  lyrics,
  timestampedLyrics,
  lyricsStyle,
  waveRadioBackgroundId,
}: {
  songTitle: string;
  audioUrl: string;
  duration?: number | null;
  dimensions?: Partial<MusicVideoRenderDimensions> | null;
  lyrics: string;
  timestampedLyrics?: { alignedWords: AlignedLyricWord[] } | null;
  lyricsStyle?: LyricsStyleConfig;
  waveRadioBackgroundId?: string | null;
}): MusicVideoTimeline {
  const effectiveDuration = normalizeDuration(duration);
  const renderDimensions = normalizeRenderDimensions(dimensions);
  const lyricCues = timestampedLyrics?.alignedWords?.length
    ? buildLyricCuesFromAlignedWords({
        lyrics,
        alignedWords: timestampedLyrics.alignedWords,
        duration: effectiveDuration,
      })
    : parseTimestampedLyrics(lyrics, effectiveDuration);
  const normalizedLyricsStyle = normalizeLyricsStyleConfig(lyricsStyle);

  return {
    templateId: "wave-radio",
    songTitle,
    audioUrl,
    duration: effectiveDuration,
    width: renderDimensions.width,
    height: renderDimensions.height,
    lyrics: lyricCues,
    photos: [],
    assignments: [],
    lyricsStyle: {
      ...normalizedLyricsStyle,
      position: "center",
    },
    transitions: [],
    waveRadioBackgroundId: normalizeWaveRadioBackgroundId(
      waveRadioBackgroundId,
    ),
  };
}
