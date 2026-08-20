// Remotion bundles this module with its own Webpack config, which does not
// resolve the Next.js `@/` alias. Keep this import relative so both builds work.
import { r2PublicUrl } from "../cloudflare/public-url";

export const DEFAULT_MINIMAL_VINYL_BACKGROUND_BLUR = 10;
export const DEFAULT_MINIMAL_VINYL_BACKGROUND_OVERLAY = {
  color: "#020408",
  opacity: 0.58,
};

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

export const CAPTION_THEME_IDS = [
  "classic",
  "pop",
  "karaoke",
  "hustle",
  "beast",
  "soft-ai",
  "podcast",
] as const;

export type CaptionThemeId = (typeof CAPTION_THEME_IDS)[number];

export type CaptionWord = {
  text: string;
  start: number;
  end: number;
};

export type CaptionLine = { words: CaptionWord[] };

export type LyricsCaptionData = { lines: CaptionLine[] };

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

export type MinimalVinylBackgroundOverlayConfig = {
  color: string;
  opacity: number;
};

export type WaveRadioBackgroundOption = {
  durationInFrames: number;
  id: string;
  label: string;
  posterSrc?: string;
  previewSrc?: string;
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
    | (Pick<UploadedPhoto, "mediaType" | "name" | "objectUrl" | "url"> &
        Partial<Pick<UploadedPhoto, "id">>)
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
export type MinimalVinylBackgroundOverlayInput =
  Partial<MinimalVinylBackgroundOverlayConfig> | null;

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
  captionTheme?: CaptionThemeId;
  captions?: LyricsCaptionData;
};

export type PhotoSlideshowTimeline = BaseMusicVideoTimeline & {
  templateId: "photo-slideshow";
};

export type MinimalVinylTimeline = BaseMusicVideoTimeline & {
  backgroundBlur?: number;
  backgroundOverlay?: MinimalVinylBackgroundOverlayConfig;
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
const overlayCdnSrc = (path: string) => r2PublicUrl(`/overlay/${path}`);
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
    posterSrc: overlayCdnSrc("bg-video-poster/107256-678130118.jpg"),
    src: overlayCdnSrc("bg-video/107256-678130118.mp4"),
  },
  {
    durationInFrames: 993,
    id: "midnight-glow-11722",
    label: "Midnight Glow",
    posterSrc: overlayCdnSrc("bg-video-poster/720p/11722-231759069.jpg"),
    src: overlayCdnSrc("bg-video/720p/11722-231759069.mp4"),
  },
  {
    durationInFrames: 1066,
    id: "aurora-119885",
    label: "Aurora Signal",
    posterSrc: overlayCdnSrc("bg-video-poster/720p/119885-719283332.jpg"),
    src: overlayCdnSrc("bg-video/720p/119885-719283332.mp4"),
  },
  {
    durationInFrames: 299,
    id: "ember-veil-127216",
    label: "Ember Veil",
    posterSrc: overlayCdnSrc("bg-video-poster/127216-738093640.jpg"),
    src: overlayCdnSrc("bg-video/127216-738093640.mp4"),
  },
  {
    durationInFrames: 203,
    id: "glass-shimmer-132427",
    label: "Glass Shimmer",
    posterSrc: overlayCdnSrc("bg-video-poster/132427-753435588.jpg"),
    src: overlayCdnSrc("bg-video/132427-753435588.mp4"),
  },
  {
    durationInFrames: 543,
    id: "sunset-drift-147206",
    label: "Sunset Drift",
    posterSrc: overlayCdnSrc("bg-video-poster/147206-791344441.jpg"),
    src: overlayCdnSrc("bg-video/147206-791344441.mp4"),
  },
  {
    durationInFrames: 376,
    id: "violet-field-148029",
    label: "Violet Field",
    posterSrc: overlayCdnSrc("bg-video-poster/148029-793140704.jpg"),
    previewSrc: overlayCdnSrc("bg-video-preview/148029-793140704.mp4"),
    src: overlayCdnSrc("bg-video/148029-793140704.mp4"),
  },
  {
    durationInFrames: 828,
    id: "starlight-rain-151469",
    label: "Starlight Rain",
    posterSrc: overlayCdnSrc("bg-video-poster/151469-800921014.jpg"),
    previewSrc: overlayCdnSrc("bg-video-preview/151469-800921014.mp4"),
    src: overlayCdnSrc("bg-video/151469-800921014.mp4"),
  },
  {
    durationInFrames: 677,
    id: "lilac-mist-152798",
    label: "Lilac Mist",
    posterSrc: overlayCdnSrc("bg-video-poster/152798-803733100.jpg"),
    previewSrc: overlayCdnSrc("bg-video-preview/152798-803733100.mp4"),
    src: overlayCdnSrc("bg-video/152798-803733100.mp4"),
  },
  {
    durationInFrames: 1441,
    id: "solar-spark-154006",
    label: "Solar Spark",
    posterSrc: overlayCdnSrc("bg-video-poster/154006-806572051.jpg"),
    src: overlayCdnSrc("bg-video/154006-806572051.mp4"),
  },
  {
    durationInFrames: 301,
    id: "velvet-night-155630",
    label: "Velvet Night",
    posterSrc: overlayCdnSrc("bg-video-poster/155630-810650602.jpg"),
    src: overlayCdnSrc("bg-video/155630-810650602.mp4"),
  },
  {
    durationInFrames: 505,
    id: "rose-orbit-175741",
    label: "Rose Orbit",
    posterSrc: overlayCdnSrc("bg-video-poster/720p/175741-854057998.jpg"),
    src: overlayCdnSrc("bg-video/720p/175741-854057998.mp4"),
  },
  {
    durationInFrames: 240,
    id: "warm-bokeh-199558",
    label: "Warm Bokeh",
    posterSrc: overlayCdnSrc("bg-video-poster/199558-910609536.jpg"),
    src: overlayCdnSrc("bg-video/199558-910609536.mp4"),
  },
  {
    durationInFrames: 476,
    id: "horizon-bloom-230851",
    label: "Horizon Bloom",
    posterSrc: overlayCdnSrc("bg-video-poster/720p/230851.jpg"),
    previewSrc: overlayCdnSrc("bg-video-preview/720p/230851.mp4"),
    src: overlayCdnSrc("bg-video/720p/230851.mp4"),
  },
  {
    durationInFrames: 762,
    id: "electric-haze-248842",
    label: "Electric Haze",
    posterSrc: overlayCdnSrc("bg-video-poster/720p/248842.jpg"),
    src: overlayCdnSrc("bg-video/720p/248842.mp4"),
  },
  {
    durationInFrames: 255,
    id: "magma-fall-265607",
    label: "Magma Fall",
    posterSrc: overlayCdnSrc("bg-video-poster/720p/265607.jpg"),
    src: overlayCdnSrc("bg-video/720p/265607.mp4"),
  },
  {
    durationInFrames: 252,
    id: "aqua-ray-265648",
    label: "Aqua Ray",
    posterSrc: overlayCdnSrc("bg-video-poster/265648.jpg"),
    src: overlayCdnSrc("bg-video/265648.mp4"),
  },
  {
    durationInFrames: 912,
    id: "vertical-lights-266987",
    label: "Vertical Lights",
    posterSrc: overlayCdnSrc("bg-video-poster/720p/266987.jpg"),
    src: overlayCdnSrc("bg-video/720p/266987.mp4"),
  },
  {
    durationInFrames: 1024,
    id: "blue-current-277316",
    label: "Blue Current",
    posterSrc: overlayCdnSrc("bg-video-poster/720p/277316.jpg"),
    src: overlayCdnSrc("bg-video/720p/277316.mp4"),
  },
  {
    durationInFrames: 481,
    id: "flare-canopy-284542",
    label: "Flare Canopy",
    posterSrc: overlayCdnSrc("bg-video-poster/284542.jpg"),
    src: overlayCdnSrc("bg-video/284542.mp4"),
  },
  {
    durationInFrames: 207,
    id: "neon-tunnel-302596",
    label: "Neon Tunnel",
    posterSrc: overlayCdnSrc("bg-video-poster/302596.jpg"),
    src: overlayCdnSrc("bg-video/302596.mp4"),
  },
  {
    durationInFrames: 313,
    id: "vertical-aura-315351",
    label: "Vertical Aura",
    posterSrc: overlayCdnSrc("bg-video-poster/315351.jpg"),
    src: overlayCdnSrc("bg-video/315351.mp4"),
  },
  {
    durationInFrames: 1782,
    id: "comet-stream-45316",
    label: "Comet Stream",
    posterSrc: overlayCdnSrc("bg-video-poster/45316-442643130.jpg"),
    src: overlayCdnSrc("bg-video/45316-442643130.mp4"),
  },
  {
    durationInFrames: 324,
    id: "sunset-grain-58142",
    label: "Sunset Grain",
    posterSrc: overlayCdnSrc("bg-video-poster/720p/58142-487508532.jpg"),
    src: overlayCdnSrc("bg-video/720p/58142-487508532.mp4"),
  },
  {
    durationInFrames: 450,
    id: "light-leak-62666",
    label: "Light Leak",
    posterSrc: overlayCdnSrc("bg-video-poster/62666-504665647.jpg"),
    src: overlayCdnSrc("bg-video/62666-504665647.mp4"),
  },
  {
    durationInFrames: 141,
    id: "prism-bloom-6962",
    label: "Prism Bloom",
    posterSrc: overlayCdnSrc("bg-video-poster/6962-197634410.jpg"),
    src: overlayCdnSrc("bg-video/6962-197634410.mp4"),
  },
  {
    durationInFrames: 444,
    id: "ember-cloud-84916",
    label: "Ember Cloud",
    posterSrc: overlayCdnSrc("bg-video-poster/84916-587646675.jpg"),
    src: overlayCdnSrc("bg-video/84916-587646675.mp4"),
  },
  {
    durationInFrames: 301,
    id: "131999-751915336",
    label: "Background 131999-751915336",
    posterSrc: overlayCdnSrc("bg-video-poster/131999-751915336.jpg"),
    src: overlayCdnSrc("bg-video/131999-751915336.mp4"),
  },
  {
    durationInFrames: 600,
    id: "13306-246909929",
    label: "Background 13306-246909929",
    posterSrc: overlayCdnSrc("bg-video-poster/13306-246909929.jpg"),
    src: overlayCdnSrc("bg-video/13306-246909929.mp4"),
  },
  {
    durationInFrames: 264,
    id: "137614-767056227",
    label: "Background 137614-767056227",
    posterSrc: overlayCdnSrc("bg-video-poster/137614-767056227.jpg"),
    src: overlayCdnSrc("bg-video/137614-767056227.mp4"),
  },
  {
    durationInFrames: 313,
    id: "140151-865442951",
    label: "Background 140151-865442951",
    posterSrc: overlayCdnSrc("bg-video-poster/140151-865442951.jpg"),
    src: overlayCdnSrc("bg-video/140151-865442951.mp4"),
  },
  {
    durationInFrames: 300,
    id: "14572459",
    label: "Background 14572459",
    posterSrc: overlayCdnSrc("bg-video-poster/14572459.jpg"),
    src: overlayCdnSrc("bg-video/14572459.mp4"),
  },
  {
    durationInFrames: 601,
    id: "15283166",
    label: "Background 15283166",
    posterSrc: overlayCdnSrc("bg-video-poster/15283166.jpg"),
    src: overlayCdnSrc("bg-video/15283166.mp4"),
  },
  {
    durationInFrames: 300,
    id: "16945380",
    label: "Background 16945380",
    posterSrc: overlayCdnSrc("bg-video-poster/16945380.jpg"),
    src: overlayCdnSrc("bg-video/16945380.mp4"),
  },
  {
    durationInFrames: 450,
    id: "171422-845465103",
    label: "Background 171422-845465103",
    posterSrc: overlayCdnSrc("bg-video-poster/171422-845465103.jpg"),
    src: overlayCdnSrc("bg-video/171422-845465103.mp4"),
  },
  {
    durationInFrames: 302,
    id: "183279-870457579",
    label: "Background 183279-870457579",
    posterSrc: overlayCdnSrc("bg-video-poster/183279-870457579.jpg"),
    src: overlayCdnSrc("bg-video/183279-870457579.mp4"),
  },
  {
    durationInFrames: 452,
    id: "203336-920723750",
    label: "Background 203336-920723750",
    posterSrc: overlayCdnSrc("bg-video-poster/203336-920723750.jpg"),
    src: overlayCdnSrc("bg-video/203336-920723750.mp4"),
  },
  {
    durationInFrames: 1801,
    id: "2114-154902076",
    label: "Background 2114-154902076",
    posterSrc: overlayCdnSrc("bg-video-poster/2114-154902076.jpg"),
    src: overlayCdnSrc("bg-video/2114-154902076.mp4"),
  },
  {
    durationInFrames: 901,
    id: "214405",
    label: "Background 214405",
    posterSrc: overlayCdnSrc("bg-video-poster/214405.jpg"),
    src: overlayCdnSrc("bg-video/214405.mp4"),
  },
  {
    durationInFrames: 1795,
    id: "218714",
    label: "Background 218714",
    posterSrc: overlayCdnSrc("bg-video-poster/218714.jpg"),
    src: overlayCdnSrc("bg-video/218714.mp4"),
  },
  {
    durationInFrames: 344,
    id: "22908-331768732",
    label: "Background 22908-331768732",
    posterSrc: overlayCdnSrc("bg-video-poster/22908-331768732.jpg"),
    src: overlayCdnSrc("bg-video/22908-331768732.mp4"),
  },
  {
    durationInFrames: 447,
    id: "2527977",
    label: "Background 2527977",
    posterSrc: overlayCdnSrc("bg-video-poster/2527977.jpg"),
    src: overlayCdnSrc("bg-video/2527977.mp4"),
  },
  {
    durationInFrames: 361,
    id: "26007-353916139",
    label: "Background 26007-353916139",
    posterSrc: overlayCdnSrc("bg-video-poster/26007-353916139.jpg"),
    src: overlayCdnSrc("bg-video/26007-353916139.mp4"),
  },
  {
    durationInFrames: 756,
    id: "268528",
    label: "Background 268528",
    posterSrc: overlayCdnSrc("bg-video-poster/268528.jpg"),
    src: overlayCdnSrc("bg-video/268528.mp4"),
  },
  {
    durationInFrames: 301,
    id: "27669-365224683",
    label: "Background 27669-365224683",
    posterSrc: overlayCdnSrc("bg-video-poster/27669-365224683.jpg"),
    src: overlayCdnSrc("bg-video/27669-365224683.mp4"),
  },
  {
    durationInFrames: 3340,
    id: "4194964",
    label: "Background 4194964",
    posterSrc: overlayCdnSrc("bg-video-poster/4194964.jpg"),
    src: overlayCdnSrc("bg-video/4194964.mp4"),
  },
  {
    durationInFrames: 301,
    id: "48569-454825064",
    label: "Background 48569-454825064",
    posterSrc: overlayCdnSrc("bg-video-poster/48569-454825064.jpg"),
    src: overlayCdnSrc("bg-video/48569-454825064.mp4"),
  },
  {
    durationInFrames: 871,
    id: "5192-183786490",
    label: "Background 5192-183786490",
    posterSrc: overlayCdnSrc("bg-video-poster/5192-183786490.jpg"),
    src: overlayCdnSrc("bg-video/5192-183786490.mp4"),
  },
  {
    durationInFrames: 1783,
    id: "67358-521707474",
    label: "Background 67358-521707474",
    posterSrc: overlayCdnSrc("bg-video-poster/67358-521707474.jpg"),
    src: overlayCdnSrc("bg-video/67358-521707474.mp4"),
  },
  {
    durationInFrames: 1649,
    id: "7077358",
    label: "Background 7077358",
    posterSrc: overlayCdnSrc("bg-video-poster/7077358.jpg"),
    src: overlayCdnSrc("bg-video/7077358.mp4"),
  },
  {
    durationInFrames: 563,
    id: "71122-537102350",
    label: "Background 71122-537102350",
    posterSrc: overlayCdnSrc("bg-video-poster/71122-537102350.jpg"),
    src: overlayCdnSrc("bg-video/71122-537102350.mp4"),
  },
  {
    durationInFrames: 299,
    id: "7230819",
    label: "Background 7230819",
    posterSrc: overlayCdnSrc("bg-video-poster/7230819.jpg"),
    src: overlayCdnSrc("bg-video/7230819.mp4"),
  },
  {
    durationInFrames: 901,
    id: "7606423",
    label: "Background 7606423",
    posterSrc: overlayCdnSrc("bg-video-poster/7606423.jpg"),
    src: overlayCdnSrc("bg-video/7606423.mp4"),
  },
  {
    durationInFrames: 1136,
    id: "8462519",
    label: "Background 8462519",
    posterSrc: overlayCdnSrc("bg-video-poster/8462519.jpg"),
    src: overlayCdnSrc("bg-video/8462519.mp4"),
  },
  {
    durationInFrames: 1774,
    id: "106383-673007978",
    label: "Background 106383-673007978",
    posterSrc: overlayCdnSrc("bg-video-poster/106383-673007978.jpg"),
    src: overlayCdnSrc("bg-video/106383-673007978.mp4"),
  },
  {
    durationInFrames: 752,
    id: "111643-691223143",
    label: "Background 111643-691223143",
    posterSrc: overlayCdnSrc("bg-video-poster/111643-691223143.jpg"),
    src: overlayCdnSrc("bg-video/111643-691223143.mp4"),
  },
  {
    durationInFrames: 958,
    id: "153908-806526834",
    label: "Background 153908-806526834",
    posterSrc: overlayCdnSrc("bg-video-poster/153908-806526834.jpg"),
    src: overlayCdnSrc("bg-video/153908-806526834.mp4"),
  },
  {
    durationInFrames: 1776,
    id: "156117-811878070",
    label: "Background 156117-811878070",
    posterSrc: overlayCdnSrc("bg-video-poster/156117-811878070.jpg"),
    src: overlayCdnSrc("bg-video/156117-811878070.mp4"),
  },
  {
    durationInFrames: 903,
    id: "16453-272487468",
    label: "Background 16453-272487468",
    posterSrc: overlayCdnSrc("bg-video-poster/16453-272487468.jpg"),
    src: overlayCdnSrc("bg-video/16453-272487468.mp4"),
  },
  {
    durationInFrames: 213,
    id: "173531-849610811",
    label: "Background 173531-849610811",
    posterSrc: overlayCdnSrc("bg-video-poster/173531-849610811.jpg"),
    src: overlayCdnSrc("bg-video/173531-849610811.mp4"),
  },
  {
    durationInFrames: 473,
    id: "208813",
    label: "Background 208813",
    posterSrc: overlayCdnSrc("bg-video-poster/208813.jpg"),
    src: overlayCdnSrc("bg-video/208813.mp4"),
  },
  {
    durationInFrames: 198,
    id: "258220",
    label: "Background 258220",
    posterSrc: overlayCdnSrc("bg-video-poster/258220.jpg"),
    src: overlayCdnSrc("bg-video/258220.mp4"),
  },
  {
    durationInFrames: 256,
    id: "preview-1",
    label: "Background preview-1",
    posterSrc: overlayCdnSrc("bg-video-poster/preview-1.jpg"),
    src: overlayCdnSrc("bg-video/preview-1.mp4"),
  },
  {
    durationInFrames: 1646,
    id: "preview",
    label: "Background preview",
    posterSrc: overlayCdnSrc("bg-video-poster/preview.jpg"),
    src: overlayCdnSrc("bg-video/preview.mp4"),
  },
  {
    durationInFrames: 7533,
    id: "steady-light-mv",
    label: "Background steady-light-mv",
    posterSrc: overlayCdnSrc("bg-video-poster/steady-light-mv.jpg"),
    src: overlayCdnSrc("bg-video/steady-light-mv.mp4"),
  },
];
export const DEFAULT_WAVE_RADIO_BACKGROUND = WAVE_RADIO_BACKGROUND_OPTIONS[0];
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

function normalizeRenderDimension(
  value: number | null | undefined,
  fallback: number,
) {
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

export function normalizeCaptionThemeId(
  theme?: string | null,
): CaptionThemeId {
  return CAPTION_THEME_IDS.includes(theme as CaptionThemeId)
    ? (theme as CaptionThemeId)
    : "classic";
}

function normalizeOverlayOpacity(opacity?: number | null) {
  return typeof opacity === "number" && Number.isFinite(opacity)
    ? Math.min(Math.max(opacity, 0), 1)
    : DEFAULT_ATMOSPHERE_OVERLAY.opacity;
}

function normalizeHexColor(color: string | null | undefined, fallback: string) {
  const normalized = color?.trim();

  return normalized && /^#[0-9a-f]{6}$/i.test(normalized)
    ? normalized
    : fallback;
}

export function normalizeMinimalVinylBackgroundOverlayConfig(
  overlay?: MinimalVinylBackgroundOverlayInput,
): MinimalVinylBackgroundOverlayConfig {
  return {
    color: normalizeHexColor(
      overlay?.color,
      DEFAULT_MINIMAL_VINYL_BACKGROUND_OVERLAY.color,
    ),
    opacity:
      typeof overlay?.opacity === "number" && Number.isFinite(overlay.opacity)
        ? Math.min(Math.max(overlay.opacity, 0), 1)
        : DEFAULT_MINIMAL_VINYL_BACKGROUND_OVERLAY.opacity,
  };
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
    .filter(
      (line) =>
        line && !SECTION_LABEL.test(line) && !LYRIC_METADATA_LINE.test(line),
    );
}

function normalizeLyricWords(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

// KIE occasionally combines a section marker with the first spoken word in a
// single alignment item: "[Spoken Intro / Narration]\\nHey". The marker is not
// lyric content, but the word after it still has a valid timestamp.
function stripAlignedWordSectionPrefix(text: string) {
  return text
    .replace(/^\s*\[[^\]\r\n]+\]\s*(?:\r?\n)+/, "")
    .trim();
}

const ZERO_LENGTH_ALIGNMENT_MAX_DURATION_SECONDS = 0.12;

function normalizeAlignedCaptionWords(
  alignedWords: AlignedLyricWord[],
): AlignedLyricWord[] | undefined {
  const words: AlignedLyricWord[] = [];

  for (const [index, alignedWord] of alignedWords.entries()) {
    const word = stripAlignedWordSectionPrefix(alignedWord.word);
    const startS = Number(alignedWord.startS);
    let endS = Number(alignedWord.endS);

    if (!word || !Number.isFinite(startS) || !Number.isFinite(endS) || startS < 0) {
      return undefined;
    }

    // KIE occasionally emits zero-length timings for short tokens such as
    // "a", "I", and "'s". Use only the immediate next word boundary, so the
    // repaired interval stays in order and never overlaps the following word.
    if (endS === startS) {
      const nextStartS = Number(alignedWords[index + 1]?.startS);
      if (!Number.isFinite(nextStartS) || nextStartS <= startS) {
        return undefined;
      }
      endS = Math.min(
        nextStartS,
        startS + ZERO_LENGTH_ALIGNMENT_MAX_DURATION_SECONDS,
      );
    }

    if (endS <= startS) return undefined;
    words.push({ word, startS, endS });
  }

  return words;
}

function normalizeCueEnd(
  start: number,
  nextStart: number | undefined,
  duration: number,
) {
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

export function buildLyricsCaptionData({
  lyrics,
  alignedWords,
}: {
  lyrics: string;
  alignedWords?: AlignedLyricWord[] | null;
}): LyricsCaptionData | undefined {
  const lyricLines = cleanUntimedLines(lyrics);
  if (!lyricLines.length || !alignedWords?.length) return undefined;

  const words = normalizeAlignedCaptionWords(alignedWords);
  if (!words) return undefined;

  let cursor = 0;
  const lines: CaptionLine[] = [];
  for (const line of lyricLines) {
    const expectedWords = normalizeLyricWords(line);
    if (!expectedWords.length) continue;

    const lineWords: typeof words = [];
    let expectedCursor = 0;
    while (expectedCursor < expectedWords.length) {
      const word = words[cursor];
      const normalizedWord = word ? normalizeLyricWords(word.word) : [];
      if (
        !word ||
        !normalizedWord.length ||
        normalizedWord.length > expectedWords.length - expectedCursor ||
        normalizedWord.some(
          (token, index) => token !== expectedWords[expectedCursor + index],
        )
      ) {
        return undefined;
      }

      lineWords.push(word);
      cursor += 1;
      expectedCursor += normalizedWord.length;
    }

    lines.push({
      words: lineWords.map((word) => ({
        text: word.word,
        start: word.startS,
        end: word.endS,
      })),
    });
  }

  return cursor === words.length && lines.length ? { lines } : undefined;
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
  dimensions,
  lyrics,
  photos,
  assignments,
  fallbackImageUrl,
  timestampedLyrics,
  transitions,
  lyricsStyle,
  atmosphereOverlay,
  captionTheme,
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
  captionTheme?: string | null;
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
  const captions = buildLyricsCaptionData({
    lyrics,
    alignedWords: timestampedLyrics?.alignedWords,
  });
  const normalizedCaptionTheme = captions
    ? normalizeCaptionThemeId(captionTheme)
    : "classic";

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
        ? (createCoverPhoto(fallbackImageUrl) ?? undefined)
        : undefined,
    lyricsStyle: normalizeLyricsStyleConfig(lyricsStyle),
    captionTheme: normalizedCaptionTheme,
    captions,
    transitions: normalizeTransitions({ cues: lyricCues, transitions }),
  };
}

export function buildMinimalVinylTimeline({
  songTitle,
  audioUrl,
  backgroundBlur,
  backgroundOverlay,
  backgroundPhoto,
  duration,
  dimensions,
  lyrics,
  fallbackImageUrl,
  coverPhoto,
  timestampedLyrics,
  lyricsStyle,
  captionTheme,
}: {
  songTitle: string;
  audioUrl: string;
  backgroundBlur?: number | null;
  backgroundOverlay?: MinimalVinylBackgroundOverlayInput;
  backgroundPhoto?: UploadedPhoto | null;
  duration?: number | null;
  dimensions?: Partial<MusicVideoRenderDimensions> | null;
  lyrics: string;
  fallbackImageUrl?: string | null;
  coverPhoto?: UploadedPhoto | null;
  timestampedLyrics?: { alignedWords: AlignedLyricWord[] } | null;
  lyricsStyle?: LyricsStyleConfig;
  captionTheme?: string | null;
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
  const captions = buildLyricsCaptionData({
    lyrics,
    alignedWords: timestampedLyrics?.alignedWords,
  });

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
        : DEFAULT_MINIMAL_VINYL_BACKGROUND_BLUR,
    backgroundOverlay:
      normalizeMinimalVinylBackgroundOverlayConfig(backgroundOverlay),
    backgroundPhoto: backgroundPhoto ?? undefined,
    coverPhoto: coverPhoto ?? createCoverPhoto(fallbackImageUrl) ?? undefined,
    lyricsStyle: normalizeLyricsStyleConfig(lyricsStyle),
    captionTheme: captions ? normalizeCaptionThemeId(captionTheme) : "classic",
    captions,
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
  captionTheme,
}: {
  songTitle: string;
  audioUrl: string;
  duration?: number | null;
  dimensions?: Partial<MusicVideoRenderDimensions> | null;
  lyrics: string;
  timestampedLyrics?: { alignedWords: AlignedLyricWord[] } | null;
  lyricsStyle?: LyricsStyleConfig;
  waveRadioBackgroundId?: string | null;
  captionTheme?: string | null;
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
  const captions = buildLyricsCaptionData({
    lyrics,
    alignedWords: timestampedLyrics?.alignedWords,
  });

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
    captionTheme: captions ? normalizeCaptionThemeId(captionTheme) : "classic",
    captions,
    transitions: [],
    waveRadioBackgroundId: normalizeWaveRadioBackgroundId(
      waveRadioBackgroundId,
    ),
  };
}
