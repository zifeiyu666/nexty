"use client";

import {
  DiscArtworkCropDialog,
  DISC_IMAGE_CROP_PREVIEW_WIDTH,
  type DiscImageCropDraft,
} from "@/components/song/DiscArtworkCropDialog";
import {
  getStudioPillButtonClassName,
  getStudioTemplateCardClassName,
  StudioBlurBackdrop,
  studioGlassStyles,
  StudioHeader,
} from "@/components/song/StudioGlassPrimitives";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ATMOSPHERE_OVERLAY_OPTIONS,
  buildEvenPhotoAssignments,
  buildLyricCuesFromAlignedWords,
  buildMinimalVinylTimeline,
  buildPhotoSlideshowTimeline,
  buildRandomTransitionAssignments,
  buildWaveRadioTimeline,
  createCoverPhoto,
  DEFAULT_ATMOSPHERE_OVERLAY,
  DEFAULT_LYRICS_STYLE,
  DEFAULT_MINIMAL_VINYL_BACKGROUND_BLUR,
  DEFAULT_MINIMAL_VINYL_BACKGROUND_OVERLAY,
  DEFAULT_WAVE_RADIO_BACKGROUND,
  getUploadedMediaType,
  normalizeLyricsStyleConfig,
  normalizeTransitions,
  parseTimestampedLyrics,
  resolveCuePhotos,
  shouldShowPhotoTransition,
  WAVE_RADIO_BACKGROUND_OPTIONS,
  type AlignedLyricWord,
  type AtmosphereOverlayConfig,
  type LyricsEntranceMode,
  type LyricsPosition,
  type LyricsStyleConfig,
  type MinimalVinylBackgroundOverlayConfig,
  type MusicVideoRenderDimensions,
  type MusicVideoTimeline,
  type PhotoAssignment,
  type TransitionAssignment,
  type TransitionType,
  type UploadedPhoto,
  type WaveRadioBackgroundOption,
} from "@/lib/music-video/photo-slideshow";
import {
  PHOTO_SLIDESHOW_FPS,
  PHOTO_SLIDESHOW_HEIGHT,
  PHOTO_SLIDESHOW_WIDTH,
} from "@/lib/music-video/remotion-constants";
import { cn } from "@/lib/utils";
import { wallArtFontFiles, wallArtFonts } from "@/lib/wall-art/fonts";
import {
  buildInitialImageCrop,
  clampImageCrop,
} from "@/lib/wall-art/image-lyrics";
import { MinimalVinylComposition } from "@/remotion-src/MinimalVinylComposition";
import { PhotoSlideshowComposition } from "@/remotion-src/PhotoSlideshowComposition";
import { WaveRadioComposition } from "@/remotion-src/WaveRadioComposition";
import { Player, type PlayerRef } from "@remotion/player";
import {
  Check,
  ChevronsUpDown,
  Circle,
  Clapperboard,
  Download,
  Film,
  ImagePlus,
  Images,
  Loader2,
  Music2,
  Pause,
  Play,
  Radio,
  RectangleHorizontal,
  RectangleVertical,
  Sparkles,
  Sun,
  Trash2,
  Type,
  UploadCloud,
  Video,
  Wand2,
  Waves,
  Wind,
  ZoomIn,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import {
  Fragment,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

type MusicVideoEditorDrawerProps = {
  emptyState?: ReactNode;
  initialSong?: MusicVideoSongOption;
  songOptions?: MusicVideoSongOption[];
  trigger: ReactNode;
};

export type MusicVideoSongOption = {
  audioUrl: string;
  duration?: number | null;
  id: string;
  imageUrl?: string | null;
  lyrics: string;
  shareUrl?: string;
  title: string;
  timestampedLyrics?: {
    alignedWords: AlignedLyricWord[];
  } | null;
};

type ApiEnvelope<T> = {
  data?: T;
  error?: string;
  success: boolean;
};

type PresignedUploadResponse = {
  key: string;
  presignedUrl: string;
  publicObjectUrl: string;
};

type MusicVideoRenderRecord = {
  error?: string | null;
  id: string;
  status: "queued" | "rendering" | "completed" | "failed";
  temporaryVideoUrl?: string | null;
  videoUrl?: string | null;
};

type MusicVideoRefreshResponse = {
  progress: number;
  video: MusicVideoRenderRecord | null;
};

type TransitionPreviewLoop = {
  endFrame: number;
  nonce: number;
  startFrame: number;
};

const PREVIEW_TIME_UPDATE_INTERVAL_SECONDS = 0.25;

function logMusicVideoPreviewDebug(
  message: string,
  payload?: Record<string, unknown>,
) {
  if (process.env.NODE_ENV === "production") return;
  console.debug(`[MusicVideoPreview] ${message}`, payload ?? {});
}

type PreviewAspectRatio = "portrait" | "landscape";

type TemplateId = "photo-slideshow" | "minimal-vinyl" | "wave-radio";

type TemplateCard = {
  id: TemplateId;
  title: string;
  description: string;
  demoImageAlt?: string;
  demoImageSrc?: string;
  icon: typeof Images;
  status: "available" | "coming-soon";
};

const templates: TemplateCard[] = [
  {
    id: "photo-slideshow",
    title: "Photo Stream Memory Slideshow",
    description: "Warm lyric-led media, glass blur, soft breathing motion.",
    demoImageAlt: "Photo lyric MV template demo",
    demoImageSrc: "/images/features/photo-lyric-mv-template.webp",
    icon: Images,
    status: "available",
  },
  {
    id: "minimal-vinyl",
    title: "Minimal Vinyl Record",
    description: "Spinning vinyl, synced lyric roll, and red-gold light leaks.",
    demoImageAlt: "Minimal vinyl record music visualizer template demo",
    demoImageSrc: "/images/features/minimal-vinyl-record-template.webp",
    icon: Music2,
    status: "available",
  },
  {
    id: "wave-radio",
    title: "Dynamic Lyrics Video",
    description: "Blurred motion video with bold lyric captions and neon glow.",
    demoImageAlt: "Dynamic lyrics video template demo",
    demoImageSrc: "/images/features/dynamic-wave-radio-template.webp",
    icon: Radio,
    status: "available",
  },
];

const DEFAULT_DURATION = 30;
const DEFAULT_EDITOR_WIDTH = 560;
const MIN_EDITOR_WIDTH = 380;
const MAX_EDITOR_WIDTH = 760;
const MAX_EDITOR_VIEWPORT_RATIO = 0.44;
const MAX_MEDIA_BYTES = 80 * 1024 * 1024;
const MV_RENDER_POLL_INTERVAL_MS = 4000;
const MV_RENDER_TEMP_URL_POLL_INTERVAL_MS = 2500;
const TRANSITION_PREVIEW_SECONDS = 1;
const TRANSITION_PREVIEW_TAIL_SECONDS = 1;
const wallArtFontFaceCss = wallArtFontFiles
  .map(
    ([family, src, weight]) =>
      `@font-face{font-family:'${family}';src:url('${src}') format('truetype');font-style:normal;font-weight:${weight};font-display:swap;}`,
  )
  .join("");
const musicVideoMotionCss = `
  @keyframes music-video-breathe {
    0% { transform: scale(1.03); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1.03); }
  }
  @keyframes music-video-wand-float {
    0% { transform: translateY(0) rotate(0deg); }
    42% { transform: translateY(-1px) rotate(-8deg); }
    100% { transform: translateY(0) rotate(0deg); }
  }
`;
const musicVideoFieldClassName = studioGlassStyles.field;
const musicVideoPopoverClassName = studioGlassStyles.popover;
const musicVideoPanelClassName = studioGlassStyles.panel;
const musicVideoSubtlePanelClassName = studioGlassStyles.subtlePanel;
const musicVideoScrollAreaClassName = studioGlassStyles.scrollArea;
const musicVideoScrollAreaViewportClassName =
  studioGlassStyles.scrollAreaViewport;
const musicVideoEditorSectionClassName = studioGlassStyles.editorSection;
const musicVideoInfoCardClassName = studioGlassStyles.infoCard;
const musicVideoSectionHeadingClassName = studioGlassStyles.sectionHeading;
const musicVideoControlTitleClassName = studioGlassStyles.controlTitle;
const musicVideoControlDescriptionClassName =
  studioGlassStyles.controlDescription;
const musicVideoPrimaryButtonClassName = studioGlassStyles.primaryButton;
const musicVideoSecondaryButtonClassName = studioGlassStyles.secondaryButton;
const musicVideoMicroButtonClassName = studioGlassStyles.microButton;
const musicVideoPillButtonClassName = getStudioPillButtonClassName(false);
const musicVideoPillButtonActiveClassName = getStudioPillButtonClassName(true);
const musicVideoEditorTabsListClassName =
  "h-7 w-fit rounded-full bg-white/55 p-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.66),inset_0_0_12px_rgba(70,53,38,0.04)] backdrop-blur-xl";
const musicVideoEditorTabsTriggerClassName =
  "h-6 flex-none gap-1 rounded-full px-2.5 text-[10.5px] font-black tracking-[0.01em] text-[#6d5f53] data-[state=active]:bg-[#2d2622] data-[state=active]:text-[#f7f0e6] data-[state=active]:shadow-[0_7px_14px_rgba(45,38,34,0.16)]";
const previewAspectRatioOptions: Record<
  PreviewAspectRatio,
  MusicVideoRenderDimensions & {
    label: string;
  }
> = {
  landscape: {
    height: PHOTO_SLIDESHOW_WIDTH,
    label: "16:9",
    width: PHOTO_SLIDESHOW_HEIGHT,
  },
  portrait: {
    height: PHOTO_SLIDESHOW_HEIGHT,
    label: "9:16",
    width: PHOTO_SLIDESHOW_WIDTH,
  },
};

const transitionOptions: Array<{
  description: string;
  icon: LucideIcon;
  label: string;
  type: TransitionType;
}> = [
  {
    description: "Classic overlap for tender scenes.",
    icon: Circle,
    label: "Cross Dissolve",
    type: "cross-dissolve",
  },
  {
    description: "A fast blur sweep for rhythm changes.",
    icon: Wind,
    label: "Motion Blur",
    type: "motion-blur",
  },
  {
    description: "Warm film flare across the cut.",
    icon: Sun,
    label: "Light Leak",
    type: "light-leak",
  },
  {
    description: "Pushes the lens into the next memory.",
    icon: ZoomIn,
    label: "Zoom In/Out",
    type: "zoom-push",
  },
];

const lyricsPositionOptions: Array<{
  label: string;
  value: LyricsPosition;
}> = [
  { label: "Top", value: "top" },
  { label: "Center", value: "center" },
  { label: "Bottom", value: "bottom" },
];

const lyricsEntranceOptions: Array<{
  label: string;
  value: LyricsEntranceMode;
}> = [
  { label: "Motion Blur Slip", value: "motion-blur-slip" },
  { label: "Staggered Glow Reveal", value: "staggered-glow-reveal" },
  { label: "Rolling Flow", value: "rolling-flow" },
];

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function createPhotoId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `photo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createUploadedPhoto(file: File): UploadedPhoto {
  return {
    id: createPhotoId(),
    mediaType: file.type.startsWith("video/") ? "video" : "image",
    name: file.name,
    objectUrl: URL.createObjectURL(file),
  };
}

function createUploadedPhotoFromObjectUrl({
  fileName,
  objectUrl,
}: {
  fileName: string;
  objectUrl: string;
}): UploadedPhoto {
  return {
    id: createPhotoId(),
    mediaType: "image",
    name: fileName,
    objectUrl,
  };
}

async function dataUrlToFile(dataUrl: string, fileName: string) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();

  return new File([blob], fileName, {
    type: blob.type || "image/png",
  });
}

function MediaAssetPreview({
  className,
  media,
}: {
  className?: string;
  media: UploadedPhoto;
}) {
  if (getUploadedMediaType(media) === "video") {
    return (
      <video
        muted
        playsInline
        className={className}
        preload="metadata"
        src={media.objectUrl}
      />
    );
  }

  return (
    <img
      alt={media.name}
      className={className}
      draggable={false}
      src={media.objectUrl}
    />
  );
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.error ?? "Request failed.");
  }

  return payload.data;
}

function logMusicVideoRenderError(message: string, error?: unknown) {
  console.error("[MusicVideoEditorDrawer] Render failed", {
    error,
    message,
  });
}

function getAssignedPhotoId(assignments: PhotoAssignment[], cueId: string) {
  return assignments.find((assignment) => assignment.cueId === cueId)?.photoId;
}

function upsertAssignment(
  assignments: PhotoAssignment[],
  cueId: string,
  photoId: string,
) {
  const nextAssignment = { cueId, photoId };
  const existingIndex = assignments.findIndex(
    (assignment) => assignment.cueId === cueId,
  );

  if (existingIndex === -1) return [...assignments, nextAssignment];

  return assignments.map((assignment, index) =>
    index === existingIndex ? nextAssignment : assignment,
  );
}

function removePhotoAssignments(
  assignments: PhotoAssignment[],
  photoId: string,
) {
  return assignments.filter((assignment) => assignment.photoId !== photoId);
}

function getResponsiveEditorMaxWidth(viewportWidth?: number) {
  const width =
    viewportWidth ??
    (typeof window === "undefined" ? MAX_EDITOR_WIDTH : window.innerWidth);

  return Math.min(
    MAX_EDITOR_WIDTH,
    Math.max(MIN_EDITOR_WIDTH, Math.floor(width * MAX_EDITOR_VIEWPORT_RATIO)),
  );
}

function clampEditorWidth(width: number, viewportWidth?: number) {
  return Math.min(
    Math.max(width, MIN_EDITOR_WIDTH),
    getResponsiveEditorMaxWidth(viewportWidth),
  );
}

function TemplateRail({
  activeTemplate,
  onSelectTemplate,
}: {
  activeTemplate: TemplateId;
  onSelectTemplate: (template: TemplateCard) => void;
}) {
  return (
    <aside
      className={cn(musicVideoPanelClassName, "flex min-h-0 flex-col p-1.5")}
    >
      <div className="flex shrink-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#74685d]">
        <span className="flex size-6 items-center justify-center rounded-full bg-white/72 text-[#b56e4f] shadow-[inset_0_1px_0_rgba(255,255,255,0.76)]">
          <Clapperboard className="size-3" />
        </span>
        Templates
      </div>
      <ScrollArea
        className={cn(
          musicVideoScrollAreaClassName,
          musicVideoScrollAreaViewportClassName,
          "mt-2 flex-1 overflow-hidden",
        )}
      >
        <div className="space-y-1.5 pr-2">
          {templates.map((template) => {
            const Icon = template.icon;
            const isActive = activeTemplate === template.id;
            const isDisabled = template.status === "coming-soon";

            return (
              <button
                key={template.id}
                className={cn(
                  getStudioTemplateCardClassName(isActive),
                  isDisabled && "cursor-not-allowed opacity-60 hover:bg-white",
                )}
                disabled={isDisabled}
                type="button"
                onClick={() => onSelectTemplate(template)}
              >
                <div className="overflow-hidden bg-[#241d1b] shadow-inner shadow-black/20">
                  <div className="relative aspect-[4/3]">
                    {template.demoImageSrc ? (
                      <>
                        <Image
                          fill
                          alt={template.demoImageAlt ?? template.title}
                          className="object-cover transition duration-500 ease-out group-hover:scale-[1.035]"
                          sizes="(min-width: 1024px) 156px, calc(100vw - 48px)"
                          src={template.demoImageSrc}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/10 transition duration-300 group-hover:from-black/20 group-hover:to-white/20" />
                      </>
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_18%,#fee2e2_0_18%,transparent_19%),linear-gradient(160deg,#fb7185_0%,#f8fafc_42%,#292524_43%,#0c0a09_100%)]" />
                        <div className="absolute inset-x-4 bottom-5 space-y-2">
                          <div className="h-16 rounded-lg bg-white/18 shadow-xl backdrop-blur" />
                          <div className="h-2 w-3/4 rounded-full bg-white/65" />
                          <div className="h-2 w-1/2 rounded-full bg-white/35" />
                        </div>
                      </>
                    )}
                    <span className="absolute left-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-white/78 text-[#b56e4f] shadow-[0_6px_12px_rgba(29,22,19,0.12)] backdrop-blur-xl transition duration-300 group-hover:scale-105 group-hover:bg-white">
                      <Icon className="size-3.5" />
                    </span>
                    {isActive ? (
                      <span className="pointer-events-none absolute right-1.5 top-1.5 rounded-full bg-[#e59622] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-white shadow-[0_8px_14px_rgba(149,94,16,0.24)]">
                        Selected
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="px-1.5 py-1.5">
                  <p className="line-clamp-2 text-[10.5px] font-black leading-3.5 text-[#241b16]">
                    {template.title}
                  </p>
                  {isDisabled ? (
                    <Badge
                      className="mt-1 rounded-full border-none bg-white/64 px-1.5 py-0 text-[9px] text-[#7a6d62]"
                      variant="secondary"
                    >
                      Coming soon
                    </Badge>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </aside>
  );
}

function MusicVideoPreview({
  aspectRatio,
  duration,
  isPlaying,
  latestVideo,
  latestVideoTemplate,
  onGenerateVideo,
  onPause,
  onPlay,
  onPlayerDuration,
  onClearTransitionPreview,
  onToggleAspectRatio,
  previewTransitionLoop,
  renderProgress,
  renderStatus,
  songTitle,
  timeline,
}: {
  aspectRatio: PreviewAspectRatio;
  duration: number;
  isPlaying: boolean;
  latestVideo: MusicVideoRenderRecord | null;
  latestVideoTemplate: TemplateId | null;
  onGenerateVideo: () => void;
  onPause: () => void;
  onPlay: () => void;
  onPlayerDuration: (duration: number) => void;
  onClearTransitionPreview: () => void;
  onToggleAspectRatio: () => void;
  previewTransitionLoop: TransitionPreviewLoop | null;
  renderProgress: number;
  renderStatus: "idle" | "uploading" | "rendering" | "completed" | "failed";
  songTitle: string;
  timeline: MusicVideoTimeline;
}) {
  const playerRef = useRef<PlayerRef | null>(null);
  const onPlayRef = useRef(onPlay);
  const previewTransitionLoopRef = useRef<TransitionPreviewLoop | null>(null);
  const [previewTime, setPreviewTime] = useState(0);
  const [showPhotoSlideshowPoster, setShowPhotoSlideshowPoster] = useState(
    timeline.templateId === "photo-slideshow",
  );
  const lastPreviewTimeRef = useRef(0);
  const previousTimelineRef = useRef<MusicVideoTimeline | null>(null);
  const progress = duration ? Math.min(previewTime / duration, 1) * 100 : 0;
  const renderProgressPercent = Math.min(
    Math.max(renderProgress * 100, 0),
    100,
  );
  const matchesCurrentTemplate = latestVideoTemplate === timeline.templateId;
  const latestVideoDownloadUrl = latestVideo
    ? `/api/musicvideos/${latestVideo.id}/download`
    : null;
  const previewDimensions = previewAspectRatioOptions[aspectRatio];
  const AspectIcon =
    aspectRatio === "portrait" ? RectangleHorizontal : RectangleVertical;
  const nextAspectRatioLabel =
    previewAspectRatioOptions[
      aspectRatio === "portrait" ? "landscape" : "portrait"
    ].label;
  const durationInFrames = Math.max(
    PHOTO_SLIDESHOW_FPS,
    Math.ceil(duration * PHOTO_SLIDESHOW_FPS),
  );
  const isRendering = renderStatus === "rendering";
  const PreviewComposition =
    timeline.templateId === "minimal-vinyl"
      ? MinimalVinylComposition
      : timeline.templateId === "wave-radio"
        ? WaveRadioComposition
        : PhotoSlideshowComposition;
  const playerInputProps = useMemo(
    () => ({
      mediaQuality:
        timeline.templateId === "wave-radio" ? ("preview" as const) : undefined,
      timeline,
    }),
    [timeline],
  );
  const previewBackdropUrl =
    timeline.coverPhoto?.url ??
    timeline.coverPhoto?.objectUrl ??
    timeline.photos.find((photo) => getUploadedMediaType(photo) === "image")
      ?.url ??
    timeline.photos.find((photo) => getUploadedMediaType(photo) === "image")
      ?.objectUrl;
  const shouldShowInitialPoster =
    timeline.templateId === "photo-slideshow" &&
    showPhotoSlideshowPoster &&
    Boolean(previewBackdropUrl);
  const previewLyricsStyle = normalizeLyricsStyleConfig(timeline.lyricsStyle);
  const initialPosterTitleStyle =
    timeline.templateId === "photo-slideshow" ||
    timeline.templateId === "minimal-vinyl"
      ? {
          WebkitTextStroke:
            previewLyricsStyle.strokeWidth > 0
              ? `${Math.max(1, Math.round(previewLyricsStyle.strokeWidth * 0.55))}px ${previewLyricsStyle.strokeColor}`
              : undefined,
          color: previewLyricsStyle.color,
          fontFamily: previewLyricsStyle.fontFamily,
          fontSize:
            timeline.templateId === "minimal-vinyl"
              ? `clamp(16px, ${Math.round(previewLyricsStyle.fontSize * 0.58)}px, 34px)`
              : `clamp(16px, ${Math.round(previewLyricsStyle.fontSize * 0.58)}px, 34px)`,
          fontWeight: 900,
          lineHeight: 1.1,
          paintOrder: "stroke fill" as const,
          textShadow:
            previewLyricsStyle.strokeWidth > 0
              ? `0 2px ${previewLyricsStyle.strokeColor}`
              : "0 6px 20px rgba(0,0,0,0.52)",
        }
      : null;

  useEffect(() => {
    onPlayRef.current = onPlay;
  }, [onPlay]);

  useEffect(() => {
    previewTransitionLoopRef.current = previewTransitionLoop;
  }, [previewTransitionLoop]);

  useEffect(() => {
    setShowPhotoSlideshowPoster(
      timeline.templateId === "photo-slideshow" ||
        timeline.templateId === "minimal-vinyl",
    );
    setPreviewTime(0);
    lastPreviewTimeRef.current = 0;
  }, [timeline.templateId, songTitle]);

  useEffect(() => {
    if (
      previousTimelineRef.current &&
      previousTimelineRef.current !== timeline
    ) {
      logMusicVideoPreviewDebug("Timeline props changed", {
        isPlaying,
        templateId: timeline.templateId,
        lyricCues: timeline.lyrics.length,
        photos: timeline.photos.length,
        transitions: timeline.transitions.length,
      });
    }

    previousTimelineRef.current = timeline;
  }, [isPlaying, timeline]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !previewTransitionLoop) return;

    setShowPhotoSlideshowPoster(false);
    logMusicVideoPreviewDebug("seekTo", {
      frame: previewTransitionLoop.startFrame,
      source: "transitionLoopStart",
    });
    player.seekTo(previewTransitionLoop.startFrame);
    player.play();
    onPlayRef.current();
  }, [previewTransitionLoop]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const updatePreviewTime = (time: number, force = false) => {
      const safeTime = Math.min(Math.max(time, 0), duration);
      if (
        !force &&
        Math.abs(safeTime - lastPreviewTimeRef.current) <
          PREVIEW_TIME_UPDATE_INTERVAL_SECONDS
      ) {
        return;
      }

      lastPreviewTimeRef.current = safeTime;
      setPreviewTime(safeTime);
    };

    const handleFrameUpdate = ({ detail }: { detail: { frame: number } }) => {
      const loop = previewTransitionLoopRef.current;
      if (loop && detail.frame >= loop.endFrame) {
        logMusicVideoPreviewDebug("seekTo", {
          frame: loop.startFrame,
          source: "transitionLoopWrap",
        });
        player.seekTo(loop.startFrame);
        updatePreviewTime(loop.startFrame / PHOTO_SLIDESHOW_FPS, true);
        return;
      }

      updatePreviewTime(detail.frame / PHOTO_SLIDESHOW_FPS);
    };
    const handlePause = () => onPause();
    const handlePlay = () => onPlay();
    const handleEnded = () => onPause();

    player.addEventListener("frameupdate", handleFrameUpdate);
    player.addEventListener("pause", handlePause);
    player.addEventListener("play", handlePlay);
    player.addEventListener("ended", handleEnded);

    return () => {
      player.removeEventListener("frameupdate", handleFrameUpdate);
      player.removeEventListener("pause", handlePause);
      player.removeEventListener("play", handlePlay);
      player.removeEventListener("ended", handleEnded);
    };
  }, [duration, onPause, onPlay]);

  useEffect(() => {
    onPlayerDuration(duration);
  }, [duration, onPlayerDuration]);

  function clearTransitionPreview() {
    previewTransitionLoopRef.current = null;
    onClearTransitionPreview();
  }

  function togglePlayback() {
    const player = playerRef.current;
    if (!player) return;

    if (isPlaying) {
      clearTransitionPreview();
      player.pause();
      onPause();
      return;
    }

    setShowPhotoSlideshowPoster(false);
    player.play();
    clearTransitionPreview();
    onPlay();
  }

  function handleSeek(nextTime: number) {
    const player = playerRef.current;
    const safeTime = Math.min(Math.max(nextTime, 0), duration);

    clearTransitionPreview();
    setShowPhotoSlideshowPoster(false);
    lastPreviewTimeRef.current = safeTime;
    setPreviewTime(safeTime);
    if (player) {
      const targetFrame = Math.round(safeTime * PHOTO_SLIDESHOW_FPS);
      logMusicVideoPreviewDebug("seekTo", {
        frame: targetFrame,
        source: "manualSeek",
      });
      player.seekTo(targetFrame);
    }
  }

  return (
    <section
      className={cn(
        musicVideoPanelClassName,
        "relative flex min-h-0 flex-col overflow-hidden px-2.5 py-2.5 xl:px-3",
      )}
    >
      {previewBackdropUrl ? (
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-[-9%] bg-cover bg-center opacity-45 blur-[26px] saturate-[1.08]"
            style={{ backgroundImage: `url(${previewBackdropUrl})` }}
          />
          <div className="absolute inset-0 bg-[#f7f0e8]/64 backdrop-blur-[2px]" />
        </div>
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.78),transparent_34%),linear-gradient(180deg,#faf7f2_0%,#f4eee7_100%)]"
        />
      )}
      <div className="relative z-10 flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="h-px w-5 bg-[#8f7f72]/70" />
            <p className={musicVideoSectionHeadingClassName}>
              Remotion Preview
            </p>
          </div>
          <h3 className="mt-0.5 truncate text-[14px] font-black tracking-[-0.02em] text-[#241b16]">
            {songTitle}
          </h3>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          <Button
            className={cn(
              musicVideoPrimaryButtonClassName,
              "group h-8 px-3 text-[10.5px]",
            )}
            disabled={isRendering || renderStatus === "uploading"}
            type="button"
            onClick={onGenerateVideo}
          >
            {isRendering ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Wand2 className="size-3.5 group-hover:[animation:music-video-wand-float_0.85s_ease-in-out_infinite]" />
            )}
            Generate Video
          </Button>
          <Button
            aria-label="Switch preview aspect ratio"
            className={cn(
              getStudioPillButtonClassName(false),
              "h-8 px-2.5 text-[10.5px]",
            )}
            title={`Switch to ${nextAspectRatioLabel}`}
            type="button"
            variant="ghost"
            onClick={onToggleAspectRatio}
          >
            <AspectIcon className="size-3.5" />
            {previewDimensions.label}
          </Button>
          <Button
            className={cn(
              getStudioPillButtonClassName(false),
              "h-8 px-2.5 text-[10.5px]",
            )}
            type="button"
            variant="ghost"
            onClick={togglePlayback}
          >
            {isPlaying ? (
              <Pause className="size-3.5" />
            ) : (
              <Play className="size-3.5" />
            )}
            {isPlaying ? "Pause" : "Play"}
          </Button>
        </div>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center py-2.5 xl:py-3">
        <div
          className={cn(
            "relative overflow-hidden bg-[#171412] shadow-[0_18px_42px_rgba(28,22,18,0.24)]",
            aspectRatio === "portrait"
              ? "aspect-[9/16] h-full max-h-[min(72vh,760px)] min-h-[360px] rounded-[14px] p-1.5"
              : "aspect-[16/9] w-full max-w-[min(100%,1180px,calc(177.78vh-21rem))] rounded-[13px] p-1.5",
          )}
        >
          <div className="absolute inset-1.5 overflow-hidden rounded-[9px] bg-black">
            <Player
              ref={playerRef}
              key={`${timeline.templateId}-${previewDimensions.label}`}
              acknowledgeRemotionLicense
              component={PreviewComposition}
              compositionHeight={previewDimensions.height}
              compositionWidth={previewDimensions.width}
              controls={false}
              durationInFrames={durationInFrames}
              fps={PHOTO_SLIDESHOW_FPS}
              inputProps={playerInputProps}
              style={{ height: "100%", width: "100%" }}
            />
            {shouldShowInitialPoster ? (
              <div
                aria-label="Photo slideshow cover poster"
                className="pointer-events-none absolute inset-0"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${previewBackdropUrl})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/52 via-black/14 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center px-8">
                  <div className="w-full max-w-[76%] text-center">
                    <div
                      className="font-black tracking-[-0.03em]"
                      style={initialPosterTitleStyle ?? undefined}
                    >
                      {songTitle}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          <div className="absolute left-1/2 top-2 h-0.5 w-10 -translate-x-1/2 rounded-full bg-white/18" />
        </div>
      </div>

      <div className="relative z-10 shrink-0">
        <div className="mb-2 flex flex-wrap items-center justify-center gap-1.5">
          {matchesCurrentTemplate && latestVideo?.videoUrl ? (
            <Button
              asChild
              className={cn(
                musicVideoSecondaryButtonClassName,
                "h-8 px-3 text-[10.5px]",
              )}
              type="button"
              variant="ghost"
            >
              <a download href={latestVideoDownloadUrl ?? latestVideo.videoUrl}>
                <Download className="size-3.5" />
                Download MP4
              </a>
            </Button>
          ) : matchesCurrentTemplate && latestVideo?.temporaryVideoUrl ? (
            <Button
              asChild
              className={cn(
                musicVideoPrimaryButtonClassName,
                "h-8 px-3 text-[10.5px]",
              )}
              type="button"
            >
              <a
                download
                href={latestVideoDownloadUrl ?? latestVideo.temporaryVideoUrl}
              >
                <Download className="size-3.5" />
                Download Now (Temporary)
              </a>
            </Button>
          ) : null}
        </div>
        {isRendering && !latestVideo?.temporaryVideoUrl ? (
          <RenderProgressBar progress={renderProgressPercent} />
        ) : null}
        <div className="relative h-4">
          <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-white/80 shadow-inner shadow-stone-200/70">
            <div
              className="h-full rounded-full bg-[#362e28] transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <input
            aria-label="Seek music video preview"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            max={duration}
            min={0}
            step={1 / PHOTO_SLIDESHOW_FPS}
            type="range"
            value={Math.min(previewTime, duration)}
            onChange={(event) => handleSeek(event.currentTarget.valueAsNumber)}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fff8f1] shadow-[0_6px_12px_rgba(53,40,30,0.18),0_0_0_1px_rgba(255,255,255,0.72)_inset]"
            style={{ left: `${progress}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[10px] font-bold tabular-nums text-[#76695d]">
          <span>{formatTime(previewTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </section>
  );
}

function RenderProgressBar({ progress }: { progress: number }) {
  const safeProgress = Math.min(Math.max(progress, 0), 100);
  const indicatorStyle = {
    width: `${safeProgress}%`,
    "--render-progress": `${safeProgress}%`,
  } as CSSProperties;
  const dots = [0, 1, 2];

  return (
    <div
      className={cn(
        musicVideoInfoCardClassName,
        "relative mb-2 overflow-hidden rounded-[22px] bg-[linear-gradient(135deg,rgba(255,255,255,0.5),rgba(250,243,234,0.22)_52%,rgba(232,214,201,0.18))] px-3.5 py-3 text-[#4f4339] shadow-[0_16px_34px_rgba(66,51,37,0.11),inset_0_1px_0_rgba(255,255,255,0.72),inset_0_0_0_1px_rgba(255,255,255,0.08)] backdrop-blur-2xl",
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.45),transparent_32%),linear-gradient(120deg,rgba(255,255,255,0.12),transparent_55%)]"
      />
      <div className="relative z-10 flex items-end justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center text-[12px] font-black tracking-[-0.02em] text-[#463930]">
            <span>Rendering video</span>
            <span
              aria-hidden="true"
              className="ml-0.5 inline-flex items-end motion-reduce:hidden"
            >
              {dots.map((dot) => (
                <span
                  key={dot}
                  className="render-progress-dot w-[0.32em] text-center"
                  style={{ animationDelay: `${dot * 0.18}s` }}
                >
                  .
                </span>
              ))}
            </span>
          </div>
          <div className="text-[10px] font-semibold text-[#7c6d61]">
            Frames are being exported and stitched in sequence.
          </div>
        </div>
        <div className="rounded-full border border-white/45 bg-white/40 px-2.5 py-1 text-[11px] font-black tabular-nums text-[#382d26] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
          {Math.round(safeProgress)}%
        </div>
      </div>
      <div className="relative z-10 mt-3">
        <div className="relative h-3 overflow-hidden rounded-[4px] bg-[linear-gradient(180deg,rgba(255,255,255,0.44),rgba(233,223,214,0.26))] shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),inset_0_-6px_12px_rgba(87,68,52,0.08)]">
          <div
            className="render-progress-indicator absolute inset-y-0 left-0 overflow-hidden rounded-[4px] bg-[linear-gradient(90deg,rgba(116,87,68,0.92)_0%,rgba(168,130,101,0.98)_36%,rgba(244,214,173,0.96)_68%,rgba(255,244,225,0.88)_100%)] shadow-[0_0_20px_rgba(217,180,128,0.22),inset_0_1px_0_rgba(255,255,255,0.34)] transition-[width] duration-700 ease-out motion-reduce:transition-none"
            style={indicatorStyle}
          >
            <div className="render-progress-sheen absolute inset-0 opacity-90 motion-reduce:hidden" />
            <div className="render-progress-beam absolute inset-y-[-35%] w-20 rounded-full bg-[radial-gradient(circle,rgba(255,252,245,0.94)_0%,rgba(255,234,204,0.8)_28%,rgba(255,227,190,0.22)_60%,transparent_76%)] blur-[1px] motion-reduce:hidden" />
            <div className="render-progress-glow absolute right-0 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.98)_0%,rgba(255,241,219,0.8)_32%,rgba(255,215,170,0.3)_58%,transparent_78%)] motion-reduce:hidden" />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-[18%] left-2 right-2 rounded-[3px] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.34),transparent)] opacity-70"
          />
        </div>
      </div>
      <style jsx>{`
        .render-progress-indicator::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.36) 0%,
            rgba(255, 255, 255, 0.08) 36%,
            rgba(120, 77, 52, 0.12) 100%
          );
          mix-blend-mode: screen;
        }

        .render-progress-sheen {
          background-image: linear-gradient(
            105deg,
            transparent 0%,
            rgba(255, 255, 255, 0.12) 18%,
            rgba(255, 250, 241, 0.82) 38%,
            rgba(255, 255, 255, 0.14) 58%,
            transparent 78%
          );
          background-size: 180% 100%;
          animation: renderProgressSheen 2.8s linear infinite;
        }

        .render-progress-dot {
          animation: renderProgressDot 1.2s ease-in-out infinite;
        }

        .render-progress-beam {
          left: -4rem;
          animation: renderProgressBeam 2.2s ease-in-out infinite;
          box-shadow: 0 0 22px rgba(255, 226, 187, 0.44);
        }

        .render-progress-glow {
          animation: renderProgressGlow 1.35s ease-in-out infinite;
          box-shadow: 0 0 18px rgba(255, 236, 205, 0.46);
        }

        @keyframes renderProgressSheen {
          0% {
            transform: translateX(-42%);
          }
          100% {
            transform: translateX(42%);
          }
        }

        @keyframes renderProgressBeam {
          0% {
            transform: translateX(0) scaleX(0.72);
            opacity: 0;
          }
          18% {
            opacity: 0.88;
          }
          100% {
            transform: translateX(calc(var(--render-progress) + 4.5rem))
              scaleX(1.08);
            opacity: 0;
          }
        }

        @keyframes renderProgressDot {
          0%,
          80%,
          100% {
            opacity: 0.28;
            transform: translateY(0);
          }
          40% {
            opacity: 1;
            transform: translateY(-1px);
          }
        }

        @keyframes renderProgressGlow {
          0%,
          100% {
            opacity: 0.7;
            transform: translateY(-50%) scale(0.92);
          }
          50% {
            opacity: 1;
            transform: translateY(-50%) scale(1.08);
          }
        }
      `}</style>
    </div>
  );
}

function PhotoUploadPool({
  photos,
  onDropPhotos,
}: {
  photos: UploadedPhoto[];
  onDropPhotos: (files: File[]) => void;
}) {
  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    accept: {
      "image/gif": [".gif"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "video/mp4": [".mp4", ".m4v"],
      "video/quicktime": [".mov"],
      "video/webm": [".webm"],
      "video/x-m4v": [".m4v"],
    },
    maxSize: MAX_MEDIA_BYTES,
    multiple: true,
    onDrop: onDropPhotos,
    onDropRejected: () => {
      toast.error("Please upload common image or video files under 80MB.");
    },
  });

  return (
    <section className="min-w-0">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1.5 text-[11.5px] font-black text-[#241b16]">
          <Images className="size-3.5 shrink-0 text-[#b56e4f]" />
          <span className="leading-tight break-words">Media Assets</span>
        </div>
        <Badge
          className="shrink-0 rounded-full border-none bg-white/64 px-2 py-0.5 text-[10px] font-black text-[#5b5047]"
          variant="secondary"
        >
          {photos.length} assets
        </Badge>
      </div>
      <div
        {...getRootProps()}
        className={cn(
          "mt-2 flex min-w-0 cursor-pointer flex-col items-center justify-center rounded-[10px] bg-white/48 px-3 py-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.68),0_8px_18px_rgba(70,53,38,0.045)] backdrop-blur-xl transition",
          isDragActive ? "bg-white/78" : "hover:bg-white/66",
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="size-6 shrink-0 text-[#8f7f72]" />
        <p className="mt-2 max-w-[24rem] text-balance text-[12px] font-black leading-4 text-[#241b16]">
          Drag media here or click to upload
        </p>
        <p className="mt-1 max-w-[28rem] text-pretty text-[10px] leading-3.5 text-[#76695d]">
          JPG, PNG, WebP, GIF, MP4, MOV, or WebM. Up to 80MB each.
        </p>
      </div>
    </section>
  );
}

function LyricsFontPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedFont =
    wallArtFonts.find((font) => font.value === value) ?? wallArtFonts[0];

  function handleFontListWheel(event: React.WheelEvent<HTMLDivElement>) {
    event.stopPropagation();
  }

  return (
    <div className="space-y-1.5">
      <Label className={musicVideoSectionHeadingClassName}>Font</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            aria-expanded={open}
            className={cn(
              musicVideoFieldClassName,
              "w-full justify-between px-2.5 text-left",
            )}
            role="combobox"
            type="button"
            variant="ghost"
          >
            <span
              className="min-w-0 truncate text-[11.5px]"
              style={{ fontFamily: selectedFont?.previewFamily }}
            >
              {selectedFont?.label ?? "Select font"}
            </span>
            <ChevronsUpDown className="size-3.5 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className={cn(
            musicVideoPopoverClassName,
            "flex max-h-[min(20rem,var(--radix-popover-content-available-height))] w-[--radix-popover-trigger-width] flex-col p-1 [&_[data-slot=command-group]]:p-1 [&_[data-slot=command-input-wrapper]]:h-9 [&_[data-slot=command-input-wrapper]]:rounded-[10px] [&_[data-slot=command-input-wrapper]]:border-none [&_[data-slot=command-input-wrapper]]:bg-white/72 [&_[data-slot=command-input-wrapper]]:px-2.5 [&_[data-slot=command-input]]:h-8 [&_[data-slot=command-item]]:rounded-[9px] [&_[data-slot=command-item]]:px-2.5 [&_[data-slot=command-item][data-selected=true]]:bg-[#2d2622] [&_[data-slot=command-item][data-selected=true]]:text-[#f7f0e6]",
          )}
        >
          <Command className="min-h-0">
            <CommandInput placeholder="Search fonts..." />
            <CommandList
              className="min-h-0 flex-1 overscroll-contain"
              onWheel={handleFontListWheel}
            >
              <CommandEmpty>No font found.</CommandEmpty>
              <CommandGroup>
                {wallArtFonts.map((font) => (
                  <CommandItem
                    key={font.value}
                    value={font.label}
                    onSelect={() => {
                      onChange(font.value);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "size-3.5",
                        font.value === value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span
                      className="min-w-0 truncate text-[12px] leading-6"
                      style={{ fontFamily: font.previewFamily }}
                    >
                      {font.label}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function LyricsSliderField({
  label,
  max,
  min,
  step,
  value,
  onChange,
}: {
  label: string;
  max: number;
  min: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-1 rounded-[8px] bg-white/38 px-2 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.68),0_6px_14px_rgba(70,53,38,0.04)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <Label className={musicVideoSectionHeadingClassName}>{label}</Label>
        <Input
          aria-label={label}
          className={cn(
            musicVideoFieldClassName,
            "h-7 w-14 px-1.5 text-right text-[10px] tabular-nums",
          )}
          max={max}
          min={min}
          step={step}
          type="number"
          value={value}
          onChange={(event) => {
            const nextValue = event.currentTarget.valueAsNumber;
            if (Number.isFinite(nextValue)) {
              onChange(Math.min(Math.max(nextValue, min), max));
            }
          }}
        />
      </div>
      <Slider
        className={studioGlassStyles.slider}
        max={max}
        min={min}
        step={step}
        value={[value]}
        onValueChange={(next) => onChange(next[0] ?? value)}
      />
    </div>
  );
}

function LyricsColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className={musicVideoSectionHeadingClassName}>{label}</Label>
      <div className="grid min-w-0 grid-cols-[36px_minmax(0,1fr)] gap-1.5">
        <Input
          aria-label={`${label} swatch`}
          className="h-8 cursor-pointer rounded-[8px] border-none bg-white/76 p-1 shadow-[0_6px_14px_rgba(70,53,38,0.075),inset_0_1px_0_rgba(255,255,255,0.74),0_0_0_1px_rgba(255,255,255,0.1)_inset]"
          type="color"
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
        <Input
          aria-label={label}
          className={cn(
            musicVideoFieldClassName,
            "h-8 px-2 text-[10.5px] font-bold uppercase",
          )}
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
      </div>
    </div>
  );
}

function LyricsStyleSettings({
  forceCenterPosition = false,
  lyricsStyle,
  onChangeLyricsStyle,
}: {
  forceCenterPosition?: boolean;
  lyricsStyle: LyricsStyleConfig;
  onChangeLyricsStyle: (patch: Partial<LyricsStyleConfig>) => void;
}) {
  const isRollingFlow = lyricsStyle.entrance === "rolling-flow";
  const lockCenterPosition = forceCenterPosition || isRollingFlow;

  return (
    <div className="space-y-2.5">
      <LyricsFontPicker
        value={lyricsStyle.fontFamily}
        onChange={(fontFamily) => onChangeLyricsStyle({ fontFamily })}
      />
      <LyricsSliderField
        label="Size"
        max={120}
        min={24}
        step={1}
        value={lyricsStyle.fontSize}
        onChange={(fontSize) => onChangeLyricsStyle({ fontSize })}
      />
      <div className="grid min-w-0 gap-2 sm:grid-cols-2">
        <LyricsColorField
          label="Text color"
          value={lyricsStyle.color}
          onChange={(color) => onChangeLyricsStyle({ color })}
        />
        <LyricsColorField
          label="Border color"
          value={lyricsStyle.strokeColor}
          onChange={(strokeColor) => onChangeLyricsStyle({ strokeColor })}
        />
      </div>
      <LyricsSliderField
        label="Border"
        max={15}
        min={0}
        step={1}
        value={lyricsStyle.strokeWidth}
        onChange={(strokeWidth) => onChangeLyricsStyle({ strokeWidth })}
      />
      <div className="grid min-w-0 gap-2 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className={musicVideoSectionHeadingClassName}>Position</Label>
          <Select
            value={lockCenterPosition ? "center" : lyricsStyle.position}
            onValueChange={(position) =>
              onChangeLyricsStyle({ position: position as LyricsPosition })
            }
          >
            <SelectTrigger
              className={cn(musicVideoFieldClassName, "w-full")}
              disabled={lockCenterPosition}
            >
              <SelectValue
                placeholder={lockCenterPosition ? "Center only" : undefined}
              />
            </SelectTrigger>
            <SelectContent
              className={cn(
                musicVideoPopoverClassName,
                studioGlassStyles.selectContentItems,
              )}
            >
              {lyricsPositionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className={musicVideoSectionHeadingClassName}>Entrance</Label>
          <Select
            value={lyricsStyle.entrance}
            onValueChange={(entrance) =>
              onChangeLyricsStyle({
                entrance: entrance as LyricsEntranceMode,
              })
            }
          >
            <SelectTrigger className={cn(musicVideoFieldClassName, "w-full")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              className={cn(
                musicVideoPopoverClassName,
                studioGlassStyles.selectContentItems,
              )}
            >
              {lyricsEntranceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function PhotoUploadLyricsTabs({
  atmosphereOverlay,
  lyricsStyle,
  photos,
  selectedUploadedPhoto,
  onChangeAtmosphereOverlay,
  onChangeLyricsStyle,
  onDropPhotos,
}: {
  atmosphereOverlay: AtmosphereOverlayConfig;
  lyricsStyle: LyricsStyleConfig;
  photos: UploadedPhoto[];
  selectedUploadedPhoto: UploadedPhoto | null;
  onChangeAtmosphereOverlay: (patch: Partial<AtmosphereOverlayConfig>) => void;
  onChangeLyricsStyle: (patch: Partial<LyricsStyleConfig>) => void;
  onDropPhotos: (files: File[]) => void;
}) {
  const selectedOverlay =
    ATMOSPHERE_OVERLAY_OPTIONS.find(
      (option) => option.id === atmosphereOverlay.overlayId,
    ) ?? null;

  return (
    <Tabs
      defaultValue="photos"
      className={cn(musicVideoEditorSectionClassName, "min-w-0")}
    >
      <div className="flex items-center justify-center">
        <TabsList className={musicVideoEditorTabsListClassName}>
          <TabsTrigger
            className={musicVideoEditorTabsTriggerClassName}
            value="photos"
          >
            <ImagePlus className="size-3" />
            Media
          </TabsTrigger>
          <TabsTrigger
            className={musicVideoEditorTabsTriggerClassName}
            value="lyrics"
          >
            <Type className="size-3" />
            Lyrics
          </TabsTrigger>
          <TabsTrigger
            className={musicVideoEditorTabsTriggerClassName}
            value="overlay"
          >
            <Sparkles className="size-3" />
            FX
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent className="mt-2 space-y-2" value="photos">
        <PhotoUploadPool photos={photos} onDropPhotos={onDropPhotos} />
        {selectedUploadedPhoto ? (
          <div
            className={cn(
              musicVideoInfoCardClassName,
              "flex min-w-0 items-center gap-1.5 text-[10.5px] font-bold text-[#5d5045]",
            )}
          >
            <Waves className="size-3.5 shrink-0 text-[#b56e4f]" />
            <span className="truncate">
              Selected: {selectedUploadedPhoto.name}
            </span>
          </div>
        ) : null}
      </TabsContent>

      <TabsContent className="mt-2 space-y-2.5" value="lyrics">
        <LyricsStyleSettings
          lyricsStyle={lyricsStyle}
          onChangeLyricsStyle={onChangeLyricsStyle}
        />
      </TabsContent>

      <TabsContent className="mt-2 space-y-2.5" value="overlay">
        <div className="space-y-1.5">
          <Label className={musicVideoSectionHeadingClassName}>
            Atmosphere overlay
          </Label>
          <Select
            value={atmosphereOverlay.overlayId ?? "none"}
            onValueChange={(overlayId) =>
              onChangeAtmosphereOverlay({
                overlayId: overlayId === "none" ? null : overlayId,
              })
            }
          >
            <SelectTrigger className={cn(musicVideoFieldClassName, "w-full")}>
              <SelectValue placeholder="No Overlay" />
            </SelectTrigger>
            <SelectContent
              className={cn(
                musicVideoPopoverClassName,
                studioGlassStyles.selectContentItems,
              )}
            >
              <SelectItem value="none">No Overlay</SelectItem>
              {ATMOSPHERE_OVERLAY_OPTIONS.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedOverlay ? (
          <div className="overflow-hidden rounded-[9px] bg-stone-950 shadow-[0_10px_22px_rgba(28,25,23,0.12)]">
            <video
              muted
              loop
              playsInline
              className="aspect-video w-full object-cover opacity-85"
              src={selectedOverlay.src}
            />
          </div>
        ) : null}

        <LyricsSliderField
          label="Overlay opacity"
          max={1}
          min={0}
          step={0.01}
          value={atmosphereOverlay.opacity}
          onChange={(opacity) => onChangeAtmosphereOverlay({ opacity })}
        />
      </TabsContent>
    </Tabs>
  );
}

function PhotoMediaRail({
  media,
  selectedPhotoId,
  onRemovePhoto,
  onSelectPhoto,
}: {
  media: UploadedPhoto[];
  selectedPhotoId: string | null;
  onRemovePhoto: (photo: UploadedPhoto) => void;
  onSelectPhoto: (photoId: string) => void;
}) {
  function setPhotoDragData(
    event: React.DragEvent<HTMLElement>,
    photoId: string,
  ) {
    event.dataTransfer.setData("text/plain", photoId);
    event.dataTransfer.effectAllowed = "copy";
  }

  return (
    <section
      className={cn(
        musicVideoEditorSectionClassName,
        "flex min-h-0 flex-col p-1.5",
      )}
      data-photo-media-rail
    >
      <div className="flex shrink-0 items-center justify-between gap-2 px-1">
        <div className="flex min-w-0 items-center gap-1 text-[9px] font-black uppercase tracking-[0.14em] text-[#8f7f72]">
          <Images className="size-3 text-[#b56e4f]" />
          Media
        </div>
        <Badge
          className="h-5 rounded-full border-none bg-white/64 px-1.5 text-[9px] text-[#5b5047]"
          variant="secondary"
        >
          {media.length}
        </Badge>
      </div>

      <ScrollArea
        className={cn(
          musicVideoScrollAreaClassName,
          musicVideoScrollAreaViewportClassName,
          "mt-2 flex-1 overflow-hidden",
        )}
        data-photo-media-rail-scroll
      >
        <div className="space-y-1.5 pb-2 pr-2">
          {media.length === 0 ? (
            <div className="flex min-h-[150px] flex-col items-center justify-center rounded-[8px] bg-white/42 px-2 text-center shadow-inner shadow-stone-950/[0.04]">
              <ImagePlus className="size-5 text-[#a99b8f]" />
              <p className="mt-2 text-[10px] font-black leading-3.5 text-[#76695d]">
                No media
              </p>
            </div>
          ) : null}

          {media.length > 0
            ? media.map((photo, index) => (
                <div
                  key={photo.id}
                  className={cn(
                    "group relative overflow-hidden rounded-[8px] bg-white/72 text-left shadow-[0_8px_17px_rgba(70,53,38,0.06)] transition",
                    selectedPhotoId === photo.id
                      ? "shadow-[0_12px_24px_rgba(45,38,34,0.15),inset_0_0_0_2px_rgba(45,38,34,0.16)]"
                      : "hover:shadow-[0_12px_22px_rgba(70,53,38,0.10)]",
                  )}
                  data-cover-photo={photo.isCover ? true : undefined}
                  draggable
                  title={photo.name}
                  onDragStart={(event) => setPhotoDragData(event, photo.id)}
                >
                  <button
                    className={cn(
                      "block aspect-square w-full overflow-hidden text-left",
                      "cursor-grab active:cursor-grabbing",
                    )}
                    draggable
                    title={photo.name}
                    type="button"
                    onDragStart={(event) => setPhotoDragData(event, photo.id)}
                    onClick={() => onSelectPhoto(photo.id)}
                  >
                    <MediaAssetPreview
                      className="size-full object-cover transition duration-300 group-hover:scale-105"
                      media={photo}
                    />
                  </button>
                  <span className="absolute left-1 top-1 rounded-full bg-black/62 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur">
                    {photo.isCover
                      ? "Cover"
                      : getUploadedMediaType(photo) === "video"
                        ? "Video"
                        : index + 1}
                  </span>
                  {selectedPhotoId === photo.id ? (
                    <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-[#2d2622] text-[#f7f0e6] shadow-sm">
                      <Check className="size-3" />
                    </span>
                  ) : null}
                  {photo.isCover ? null : (
                    <button
                      aria-label={`Remove ${photo.name}`}
                      className="absolute bottom-1 right-1 flex size-6 items-center justify-center rounded-full bg-black/70 text-white opacity-0 backdrop-blur transition hover:bg-[#2d2622] group-hover:opacity-100"
                      title={`Remove ${photo.name}`}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onRemovePhoto(photo);
                      }}
                    >
                      <Trash2 className="size-3" />
                    </button>
                  )}
                </div>
              ))
            : null}
        </div>
      </ScrollArea>
    </section>
  );
}

function getTransitionLabel(type: TransitionType) {
  return (
    transitionOptions.find((option) => option.type === type)?.label ??
    "Cross Dissolve"
  );
}

function TransitionNode({
  activeType,
  fromCueId,
  onPreviewTransition,
  onSelectTransition,
  toCueId,
}: {
  activeType: TransitionType;
  fromCueId: string;
  onPreviewTransition: (toCueId: string) => void;
  onSelectTransition: (
    fromCueId: string,
    toCueId: string,
    type: TransitionType,
  ) => void;
  toCueId: string;
}) {
  return (
    <div
      aria-label="Transition Node"
      className="relative flex items-center justify-center py-1"
    >
      <div className="absolute left-7 top-0 h-full w-px bg-white/45" />
      <Popover>
        <PopoverTrigger asChild>
          <button
            className={cn(
              musicVideoMicroButtonClassName,
              "relative z-10 inline-flex max-w-full cursor-pointer items-center gap-1.5 px-2 py-1 text-[10px]",
            )}
            type="button"
            onClick={() => onPreviewTransition(toCueId)}
          >
            <Film className="size-3 text-[#b56e4f]" />
            <span className="truncate">{getTransitionLabel(activeType)}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="center"
          className={cn(
            musicVideoPopoverClassName,
            "w-auto max-w-[min(420px,calc(100vw-32px))] p-1.5",
          )}
          side="top"
        >
          <div className="flex gap-2">
            {transitionOptions.map((option) => {
              const Icon = option.icon;
              const isActive = option.type === activeType;

              return (
                <button
                  key={option.type}
                  className={cn(
                    "group flex w-[86px] cursor-pointer flex-col items-center gap-1 rounded-[8px] px-2 py-2 text-center shadow-[0_7px_15px_rgba(70,53,38,0.055)] transition",
                    isActive
                      ? "bg-[#2d2622] text-[#f7f0e6] shadow-[0_10px_20px_rgba(45,38,34,0.18)]"
                      : "bg-white/72 text-[#5b5047] hover:bg-white hover:shadow-[0_10px_20px_rgba(70,53,38,0.09)]",
                  )}
                  title={option.description}
                  type="button"
                  onClick={() => {
                    onSelectTransition(fromCueId, toCueId, option.type);
                    onPreviewTransition(toCueId);
                  }}
                >
                  <Icon className="size-4" />
                  <span className="text-[10px] font-black leading-3">
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function LyricPhotoTimeline({
  assignments,
  cues,
  photos,
  resolvedPhotoByCueId,
  selectedPhotoId,
  transitions,
  onAssignPhoto,
  onPreviewTransition,
  onSelectPhoto,
  onSelectTransition,
}: {
  assignments: PhotoAssignment[];
  cues: ReturnType<typeof parseTimestampedLyrics>;
  photos: UploadedPhoto[];
  resolvedPhotoByCueId: Map<string, UploadedPhoto | null>;
  selectedPhotoId: string | null;
  transitions: TransitionAssignment[];
  onAssignPhoto: (cueId: string, photoId: string) => void;
  onPreviewTransition: (toCueId: string) => void;
  onSelectPhoto: (photoId: string) => void;
  onSelectTransition: (
    fromCueId: string,
    toCueId: string,
    type: TransitionType,
  ) => void;
}) {
  const transitionByPair = useMemo(
    () =>
      new Map(
        transitions.map((transition) => [
          `${transition.fromCueId}:${transition.toCueId}`,
          transition,
        ]),
      ),
    [transitions],
  );

  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-[11.5px] font-black text-[#241b16]">
          <Film className="size-3.5 text-[#b56e4f]" />
          Lyrics Storyline
        </div>
        <Badge
          className="rounded-full border-none bg-white/64 px-2 py-0.5 text-[10px] font-black text-[#5b5047]"
          variant="secondary"
        >
          {cues.length} cues
        </Badge>
      </div>

      <div className="space-y-1.5 pb-3">
        {cues.map((cue, index) => {
          const assignedPhotoId = getAssignedPhotoId(assignments, cue.id);
          const resolvedPhoto = resolvedPhotoByCueId.get(cue.id) ?? null;
          const isInheritedPhoto = Boolean(
            resolvedPhoto && !resolvedPhoto.isCover && !assignedPhotoId,
          );
          const nextCue = cues[index + 1] ?? null;
          const nextResolvedPhoto = nextCue
            ? (resolvedPhotoByCueId.get(nextCue.id) ?? null)
            : null;
          const hasPhotoTransition = shouldShowPhotoTransition({
            fromPhotoId: resolvedPhoto?.id,
            toPhotoId: nextResolvedPhoto?.id,
          });
          const transition = nextCue
            ? transitionByPair.get(`${cue.id}:${nextCue.id}`)
            : null;

          return (
            <Fragment key={cue.id}>
              <div
                className={cn(
                  musicVideoInfoCardClassName,
                  "grid min-w-0 grid-cols-[50px_minmax(0,1fr)] gap-2 p-1.5 transition hover:bg-white/76 hover:shadow-[0_12px_24px_rgba(70,53,38,0.08)]",
                )}
                data-lyric-photo-card
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "copy";
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  const photoId = event.dataTransfer.getData("text/plain");
                  if (photoId) onAssignPhoto(cue.id, photoId);
                }}
              >
                <button
                  className={cn(
                    "relative aspect-square w-full cursor-pointer overflow-hidden rounded-[7px] bg-white/64 shadow-inner shadow-stone-950/[0.08] transition",
                    assignedPhotoId
                      ? "shadow-[inset_0_0_0_2px_rgba(45,38,34,0.22)]"
                      : "shadow-inner shadow-stone-950/[0.08]",
                    selectedPhotoId &&
                      "hover:shadow-[inset_0_0_0_2px_rgba(45,38,34,0.24)]",
                  )}
                  type="button"
                  onClick={() => {
                    if (selectedPhotoId) {
                      onAssignPhoto(cue.id, selectedPhotoId);
                      return;
                    }

                    if (resolvedPhoto?.id) onSelectPhoto(resolvedPhoto.id);
                  }}
                >
                  {resolvedPhoto ? (
                    <MediaAssetPreview
                      className={cn(
                        "size-full object-cover transition",
                        isInheritedPhoto && "opacity-55 grayscale-[35%]",
                      )}
                      media={resolvedPhoto}
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center px-1 text-center text-[10px] font-bold text-[#9a8e82]">
                      Drop
                    </span>
                  )}
                  {assignedPhotoId ? (
                    <span className="absolute bottom-1 left-1 rounded-full bg-[#2d2622] px-1.5 py-0.5 text-[9px] font-bold text-[#f7f0e6]">
                      Set
                    </span>
                  ) : null}
                  {resolvedPhoto?.isCover ? (
                    <span className="absolute bottom-1 left-1 rounded-full bg-black/65 px-1.5 py-0.5 text-[9px] font-bold text-white">
                      Cover
                    </span>
                  ) : null}
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-[9.5px] font-black uppercase tracking-[0.12em] text-[#8f7f72]">
                    <span>{formatTime(cue.start)}</span>
                    <span className="text-[#c3b6aa]">-</span>
                    <span>{formatTime(cue.end)}</span>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-[11.5px] font-black leading-4 text-[#241b16]">
                    {cue.text}
                  </p>
                  <p className="mt-0.5 text-[10px] leading-3.5 text-[#76695d]">
                    {assignedPhotoId
                      ? `Pinned ${getUploadedMediaType(resolvedPhoto)}`
                      : resolvedPhoto?.isCover
                        ? "Default cover"
                        : resolvedPhoto
                          ? "Inherits previous"
                          : "Waiting for media"}
                  </p>

                  <Select
                    value={assignedPhotoId ?? ""}
                    onValueChange={(photoId) => onAssignPhoto(cue.id, photoId)}
                  >
                    <SelectTrigger
                      aria-label={`Select media for lyric ${cue.text}`}
                      className={cn(
                        musicVideoFieldClassName,
                        "mt-1 h-7 w-32 min-w-0 px-2 text-[10.5px] text-[#5d5045] [&>span]:min-w-0 [&>span]:truncate",
                      )}
                      disabled={photos.length === 0}
                    >
                      <SelectValue placeholder="Media" />
                    </SelectTrigger>
                    <SelectContent
                      className={cn(
                        musicVideoPopoverClassName,
                        studioGlassStyles.selectContentItems,
                      )}
                    >
                      {photos.map((photo) => (
                        <SelectItem key={photo.id} value={photo.id}>
                          {photo.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {nextCue && transition && hasPhotoTransition ? (
                <TransitionNode
                  activeType={transition.type}
                  fromCueId={cue.id}
                  toCueId={nextCue.id}
                  onPreviewTransition={onPreviewTransition}
                  onSelectTransition={onSelectTransition}
                />
              ) : null}
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}

function MinimalVinylEditor({
  backgroundBlur,
  backgroundOverlay,
  backgroundImage,
  backgroundImageInputId,
  discArtwork,
  discArtworkInputId,
  lyricsStyle,
  onChangeBackgroundBlur,
  onChangeBackgroundOverlay,
  onChangeLyricsStyle,
  onUploadBackgroundImage,
  onUploadDiscArtwork,
}: {
  backgroundBlur: number;
  backgroundOverlay: MinimalVinylBackgroundOverlayConfig;
  backgroundImage: UploadedPhoto | null;
  backgroundImageInputId: string;
  discArtwork: UploadedPhoto | null;
  discArtworkInputId: string;
  lyricsStyle: LyricsStyleConfig;
  onChangeBackgroundBlur: (value: number) => void;
  onChangeBackgroundOverlay: (
    patch: Partial<MinimalVinylBackgroundOverlayConfig>,
  ) => void;
  onChangeLyricsStyle: (patch: Partial<LyricsStyleConfig>) => void;
  onUploadBackgroundImage: (event: ChangeEvent<HTMLInputElement>) => void;
  onUploadDiscArtwork: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <ScrollArea
      className={cn(
        musicVideoSubtlePanelClassName,
        musicVideoScrollAreaClassName,
        musicVideoScrollAreaViewportClassName,
        "min-h-0 min-w-0 flex-1 overflow-hidden p-1",
      )}
      data-minimal-vinyl-editor
      data-music-video-editor-scroll
      data-music-video-editor-main
    >
      <Tabs
        defaultValue="background"
        className={cn(musicVideoEditorSectionClassName, "min-h-full min-w-0")}
      >
        <div className="flex items-center justify-center">
          <TabsList className={musicVideoEditorTabsListClassName}>
            <TabsTrigger
              className={musicVideoEditorTabsTriggerClassName}
              value="background"
            >
              <Sparkles className="size-3" />
              Background
            </TabsTrigger>
            <TabsTrigger
              className={musicVideoEditorTabsTriggerClassName}
              value="disc"
            >
              <Music2 className="size-3" />
              Disc
            </TabsTrigger>
            <TabsTrigger
              className={musicVideoEditorTabsTriggerClassName}
              value="lyrics"
            >
              <Type className="size-3" />
              Lyrics
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent className="mt-2 space-y-2.5" value="background">
          <div className={cn(musicVideoInfoCardClassName, "space-y-2.5")}>
            <div>
              <Label className={musicVideoControlTitleClassName}>
                Full-screen background
              </Label>
              <p className={musicVideoControlDescriptionClassName}>
                Defaults to the current song cover. Upload another image to
                replace the full-screen blurred background.
              </p>
            </div>
            <Input
              accept="image/*"
              className="peer sr-only"
              id={backgroundImageInputId}
              type="file"
              onChange={onUploadBackgroundImage}
            />
            <label
              className={cn(
                "group flex h-28 w-full cursor-pointer items-center justify-center overflow-hidden rounded-[10px] border-none bg-white/72 transition-all duration-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.76),0_8px_17px_rgba(70,53,38,0.055),0_0_0_1px_rgba(255,255,255,0.1)_inset]",
                "hover:bg-white/82 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_12px_24px_rgba(70,53,38,0.095)]",
              )}
              htmlFor={backgroundImageInputId}
            >
              {backgroundImage ? (
                <div className="relative size-full">
                  <img
                    alt="Background artwork"
                    className="size-full object-cover transition duration-200 group-hover:scale-[1.025]"
                    src={backgroundImage.objectUrl}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition duration-200 group-hover:bg-black/28">
                    <span className="inline-flex translate-y-1 items-center gap-1.5 rounded-full bg-white/92 px-2.5 py-1 text-[10.5px] font-bold text-[#2d251f] opacity-0 shadow-[0_10px_20px_rgba(27,21,17,0.17)] transition duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                      <ImagePlus className="size-4" />
                      Replace background
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 px-4 text-center">
                  <span className="flex size-8 items-center justify-center rounded-full bg-white/82 text-[#8a7a6c] transition-colors duration-200 group-hover:bg-white group-hover:text-[#b56e4f]">
                    <ImagePlus className="size-3.5" />
                  </span>
                  <span className="text-[11.5px] font-black text-[#241b16]">
                    Upload background
                  </span>
                  <span className="max-w-[15rem] text-[9.5px] leading-3 text-[#76695d]">
                    Default uses the song cover as the full-screen background.
                  </span>
                </div>
              )}
            </label>
            <div className="space-y-1.5 border-t border-white/52 pt-2">
              <div className="flex items-center justify-between gap-2">
                <Label className={musicVideoControlTitleClassName}>
                  Background blur
                </Label>
                <span className="rounded-full bg-[#2d2622] px-1.5 py-0.5 text-[9px] font-black tabular-nums text-[#fff8f1] shadow-[0_5px_10px_rgba(45,38,34,0.14),inset_0_1px_0_rgba(255,255,255,0.12)]">
                  {backgroundBlur}
                </span>
              </div>
              <Slider
                className={studioGlassStyles.slider}
                max={64}
                min={0}
                step={1}
                value={[backgroundBlur]}
                onValueChange={(next) =>
                  onChangeBackgroundBlur(next[0] ?? backgroundBlur)
                }
              />
            </div>
            <div className="space-y-1.5 border-t border-white/52 pt-2">
              <Label className={musicVideoControlTitleClassName}>
                Background mask
              </Label>
              <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,0.92fr)_minmax(12rem,1fr)] sm:items-end">
                <div className="grid min-w-0 grid-cols-[34px_minmax(0,1fr)] gap-1.5">
                  <Input
                    aria-label="Mask color swatch"
                    className="h-8 cursor-pointer rounded-[8px] border-none bg-white/72 p-1 shadow-[0_5px_12px_rgba(70,53,38,0.06),inset_0_1px_0_rgba(255,255,255,0.72)]"
                    type="color"
                    value={backgroundOverlay.color}
                    onChange={(event) =>
                      onChangeBackgroundOverlay({
                        color: event.currentTarget.value,
                      })
                    }
                  />
                  <Input
                    aria-label="Mask color"
                    className={cn(
                      musicVideoFieldClassName,
                      "h-8 px-2 text-[10.5px] font-normal uppercase",
                    )}
                    maxLength={7}
                    value={backgroundOverlay.color}
                    onChange={(event) =>
                      onChangeBackgroundOverlay({
                        color: event.currentTarget.value,
                      })
                    }
                  />
                </div>
                <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_52px] items-center gap-2">
                  <span className={musicVideoSectionHeadingClassName}>
                    Opacity
                  </span>
                  <Slider
                    className={studioGlassStyles.slider}
                    max={1}
                    min={0}
                    step={0.01}
                    value={[backgroundOverlay.opacity]}
                    onValueChange={(next) =>
                      onChangeBackgroundOverlay({
                        opacity: next[0] ?? backgroundOverlay.opacity,
                      })
                    }
                  />
                  <Input
                    aria-label="Mask opacity"
                    className={cn(
                      musicVideoFieldClassName,
                      "h-8 px-1.5 text-right text-[10px] tabular-nums",
                    )}
                    max={1}
                    min={0}
                    step={0.01}
                    type="number"
                    value={backgroundOverlay.opacity}
                    onChange={(event) => {
                      const nextValue = event.currentTarget.valueAsNumber;
                      if (Number.isFinite(nextValue)) {
                        onChangeBackgroundOverlay({
                          opacity: Math.min(Math.max(nextValue, 0), 1),
                        });
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent className="mt-2 space-y-2.5" value="disc">
          <div className={cn(musicVideoInfoCardClassName, "space-y-2.5")}>
            <div>
              <Label className={musicVideoControlTitleClassName}>
                Record center image
              </Label>
              <p className={musicVideoControlDescriptionClassName}>
                Upload a custom photo for the vinyl center label. A circular
                crop dialog opens before it replaces the default cover art.
              </p>
            </div>
            <Input
              accept="image/*"
              className="peer sr-only"
              id={discArtworkInputId}
              type="file"
              onChange={onUploadDiscArtwork}
            />
            <label
              className={cn(
                "group mx-auto flex aspect-square w-full max-w-[180px] cursor-pointer items-center justify-center overflow-hidden rounded-[10px] border-none bg-white/72 transition-all duration-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.76),0_8px_17px_rgba(70,53,38,0.055),0_0_0_1px_rgba(255,255,255,0.1)_inset]",
                "hover:bg-white/82 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_12px_24px_rgba(70,53,38,0.095)]",
                "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-[#c9bbac]/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-transparent",
              )}
              htmlFor={discArtworkInputId}
              title={
                discArtwork
                  ? "Click to replace disc artwork"
                  : "Click to upload disc artwork"
              }
            >
              {discArtwork ? (
                <div className="relative size-full">
                  <img
                    alt="Disc artwork source"
                    className="size-full object-cover transition duration-200 group-hover:scale-[1.025]"
                    src={discArtwork.objectUrl}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition duration-200 group-hover:bg-black/28">
                    <span className="inline-flex translate-y-1 items-center gap-1.5 rounded-full bg-white/92 px-2.5 py-1 text-[10.5px] font-bold text-[#2d251f] opacity-0 shadow-[0_10px_20px_rgba(27,21,17,0.17)] transition duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                      <ImagePlus className="size-4" />
                      Replace artwork
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 px-3 text-center">
                  <span className="flex size-8 items-center justify-center rounded-full bg-white/82 text-[#8a7a6c] transition-colors duration-200 group-hover:bg-white group-hover:text-[#b56e4f]">
                    <ImagePlus className="size-3.5" />
                  </span>
                  <span className="text-[11.5px] font-black text-[#241b16]">
                    Upload disc artwork
                  </span>
                  <span className="text-[9.5px] leading-3 text-[#76695d]">
                    Click to crop a circular record image.
                  </span>
                </div>
              )}
            </label>
          </div>
        </TabsContent>

        <TabsContent className="mt-2 space-y-2.5" value="lyrics">
          <LyricsStyleSettings
            lyricsStyle={lyricsStyle}
            onChangeLyricsStyle={onChangeLyricsStyle}
          />
        </TabsContent>
      </Tabs>
    </ScrollArea>
  );
}

function WaveRadioEditor({
  backgroundId,
  lyricsStyle,
  onChangeLyricsStyle,
  onSelectBackground,
}: {
  backgroundId: string;
  lyricsStyle: LyricsStyleConfig;
  onChangeLyricsStyle: (patch: Partial<LyricsStyleConfig>) => void;
  onSelectBackground: (backgroundId: string) => void;
}) {
  return (
    <ScrollArea
      className={cn(
        musicVideoSubtlePanelClassName,
        musicVideoScrollAreaClassName,
        musicVideoScrollAreaViewportClassName,
        "min-h-0 min-w-0 flex-1 overflow-hidden p-1",
      )}
      data-music-video-editor-main
      data-music-video-editor-scroll
      data-wave-radio-editor
    >
      <Tabs
        defaultValue="background"
        className={cn(musicVideoEditorSectionClassName, "min-h-full min-w-0")}
      >
        <div className="flex items-center justify-center">
          <TabsList className={musicVideoEditorTabsListClassName}>
            <TabsTrigger
              className={musicVideoEditorTabsTriggerClassName}
              value="background"
            >
              <Radio className="size-3" />
              Background
            </TabsTrigger>
            <TabsTrigger
              className={musicVideoEditorTabsTriggerClassName}
              value="lyrics"
            >
              <Type className="size-3" />
              Lyrics
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent className="mt-2 space-y-2" value="background">
          <div className="flex items-center justify-end">
            <Badge
              className="shrink-0 rounded-full border-none bg-white/64 px-2 py-0.5 text-[10px] font-black text-[#5b5047]"
              variant="secondary"
            >
              {WAVE_RADIO_BACKGROUND_OPTIONS.length} clips
            </Badge>
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {WAVE_RADIO_BACKGROUND_OPTIONS.map(
              (background: WaveRadioBackgroundOption) => {
                const isActive = background.id === backgroundId;

                return (
                  <WaveRadioBackgroundOptionCard
                    key={background.id}
                    background={background}
                    isActive={isActive}
                    onSelect={() => onSelectBackground(background.id)}
                  />
                );
              },
            )}
          </div>
        </TabsContent>

        <TabsContent className="mt-2 space-y-2.5" value="lyrics">
          <LyricsStyleSettings
            forceCenterPosition
            lyricsStyle={lyricsStyle}
            onChangeLyricsStyle={onChangeLyricsStyle}
          />
        </TabsContent>
      </Tabs>
    </ScrollArea>
  );
}

function WaveRadioBackgroundOptionCard({
  background,
  isActive,
  onSelect,
}: {
  background: WaveRadioBackgroundOption;
  isActive: boolean;
  onSelect: () => void;
}) {
  const [shouldLoadPreview, setShouldLoadPreview] = useState(false);
  const previewSrc = background.previewSrc ?? background.src;
  const shouldRenderPreview = isActive || shouldLoadPreview;

  return (
    <button
      className={cn(
        "group cursor-pointer overflow-hidden rounded-[9px] bg-stone-950 text-left shadow-[0_9px_18px_rgba(28,25,23,0.12)] transition",
        isActive
          ? "shadow-[0_14px_28px_rgba(45,38,34,0.18),inset_0_0_0_2px_rgba(255,255,255,0.22)]"
          : "hover:shadow-[0_12px_24px_rgba(28,25,23,0.18)]",
      )}
      data-wave-radio-background-option
      type="button"
      onBlur={() => {
        if (!isActive) setShouldLoadPreview(false);
      }}
      onClick={onSelect}
      onFocus={() => setShouldLoadPreview(true)}
      onMouseEnter={() => setShouldLoadPreview(true)}
      onMouseLeave={() => {
        if (!isActive) setShouldLoadPreview(false);
      }}
    >
      <div className="relative aspect-video overflow-hidden">
        {background.posterSrc ? (
          <img
            alt=""
            aria-hidden="true"
            className="absolute inset-0 size-full object-cover opacity-80 transition duration-300 group-hover:scale-105"
            draggable={false}
            src={background.posterSrc}
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_30%),linear-gradient(135deg,#1c1917,#0c0a09_58%,#292524)]" />
        )}
        {shouldRenderPreview ? (
          <video
            muted
            autoPlay
            loop
            playsInline
            className="absolute inset-0 size-full object-cover opacity-80 transition duration-300 group-hover:scale-105"
            poster={background.posterSrc}
            preload="none"
            src={previewSrc}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-white/10" />
        {isActive ? (
          <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-[#2d2622] text-[#f7f0e6] shadow-sm">
            <Check className="size-3.5" />
          </span>
        ) : null}
        <span className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate text-xs font-black text-white">
          {background.label}
        </span>
      </div>
    </button>
  );
}

export function MusicVideoEditorDrawer({
  emptyState,
  initialSong,
  songOptions,
  trigger,
}: MusicVideoEditorDrawerProps) {
  const selectableSongs = useMemo(() => {
    const seen = new Set<string>();
    const options = [initialSong, ...(songOptions ?? [])].filter(
      (song): song is MusicVideoSongOption => Boolean(song),
    );

    return options.filter((song) => {
      if (seen.has(song.id)) return false;
      seen.add(song.id);
      return true;
    });
  }, [initialSong, songOptions]);
  const fallbackSong = selectableSongs[0] ?? null;
  const fallbackSongId = fallbackSong?.id ?? "";
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState(fallbackSongId);
  const selectedSong =
    selectableSongs.find((song) => song.id === selectedSongId) ?? fallbackSong;
  const hasSongs = selectableSongs.length > 0;
  const activeSongId = selectedSong?.id ?? "";
  const audioUrl = selectedSong?.audioUrl ?? "";
  const imageUrl = selectedSong?.imageUrl ?? null;
  const lyrics = selectedSong?.lyrics ?? "";
  const songDuration = selectedSong?.duration ?? null;
  const songId = selectedSong?.id ?? "";
  const songTitle = selectedSong?.title ?? "";
  const timestampedLyrics = selectedSong?.timestampedLyrics ?? null;
  const [activeTemplate, setActiveTemplate] =
    useState<TemplateId>("photo-slideshow");
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [assignments, setAssignments] = useState<PhotoAssignment[]>([]);
  const [transitionAssignments, setTransitionAssignments] = useState<
    TransitionAssignment[]
  >([]);
  const [previewTransitionLoop, setPreviewTransitionLoop] =
    useState<TransitionPreviewLoop | null>(null);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewAspectRatio, setPreviewAspectRatio] =
    useState<PreviewAspectRatio>("landscape");
  const [lyricsStyle, setLyricsStyle] =
    useState<LyricsStyleConfig>(DEFAULT_LYRICS_STYLE);
  const [waveRadioBackgroundId, setWaveRadioBackgroundId] = useState(
    DEFAULT_WAVE_RADIO_BACKGROUND.id,
  );
  const [minimalVinylDiscArtwork, setMinimalVinylDiscArtwork] =
    useState<UploadedPhoto | null>(null);
  const [minimalVinylBackgroundArtwork, setMinimalVinylBackgroundArtwork] =
    useState<UploadedPhoto | null>(null);
  const [minimalVinylBackgroundBlur, setMinimalVinylBackgroundBlur] = useState(
    DEFAULT_MINIMAL_VINYL_BACKGROUND_BLUR,
  );
  const [minimalVinylBackgroundOverlay, setMinimalVinylBackgroundOverlay] =
    useState<MinimalVinylBackgroundOverlayConfig>(
      DEFAULT_MINIMAL_VINYL_BACKGROUND_OVERLAY,
    );
  const [minimalVinylDiscCropDraft, setMinimalVinylDiscCropDraft] =
    useState<DiscImageCropDraft | null>(null);
  const [minimalVinylDiscCropDragStart, setMinimalVinylDiscCropDragStart] =
    useState<{
      pointerX: number;
      pointerY: number;
      cropX: number;
      cropY: number;
    } | null>(null);
  const [atmosphereOverlay, setAtmosphereOverlay] =
    useState<AtmosphereOverlayConfig>(DEFAULT_ATMOSPHERE_OVERLAY);
  const [editorWidth, setEditorWidth] = useState(() =>
    clampEditorWidth(DEFAULT_EDITOR_WIDTH),
  );
  const [latestVideo, setLatestVideo] = useState<MusicVideoRenderRecord | null>(
    null,
  );
  const [latestVideoTemplate, setLatestVideoTemplate] =
    useState<TemplateId | null>(null);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderStatus, setRenderStatus] = useState<
    "idle" | "uploading" | "rendering" | "completed" | "failed"
  >("idle");
  const [playerDuration, setPlayerDuration] = useState(
    songDuration && songDuration > 0 ? songDuration : DEFAULT_DURATION,
  );
  const minimalVinylBackgroundImageInputId = useId();
  const minimalVinylDiscArtworkInputId = useId();
  const photosRef = useRef<UploadedPhoto[]>([]);
  const pollingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cues = useMemo(
    () =>
      timestampedLyrics?.alignedWords?.length
        ? buildLyricCuesFromAlignedWords({
            lyrics,
            alignedWords: timestampedLyrics.alignedWords,
            duration: playerDuration,
          })
        : parseTimestampedLyrics(lyrics, playerDuration),
    [lyrics, playerDuration, timestampedLyrics],
  );
  const coverPhoto = useMemo(() => createCoverPhoto(imageUrl), [imageUrl]);
  const minimalVinylCoverPhoto = minimalVinylDiscArtwork ?? coverPhoto;
  const minimalVinylPreviewBackgroundPhoto =
    minimalVinylBackgroundArtwork ?? coverPhoto;
  const minimalVinylRenderCoverPhoto =
    minimalVinylDiscArtwork && minimalVinylDiscArtwork.url
      ? {
          ...minimalVinylDiscArtwork,
          objectUrl: minimalVinylDiscArtwork.url,
        }
      : minimalVinylCoverPhoto;
  const minimalVinylRenderBackgroundPhoto =
    minimalVinylBackgroundArtwork && minimalVinylBackgroundArtwork.url
      ? {
          ...minimalVinylBackgroundArtwork,
          objectUrl: minimalVinylBackgroundArtwork.url,
        }
      : minimalVinylPreviewBackgroundPhoto;
  const timelineTransitions = useMemo(
    () =>
      normalizeTransitions({
        cues,
        transitions: transitionAssignments,
      }),
    [cues, transitionAssignments],
  );
  const visibleMedia = useMemo(
    () => (coverPhoto ? [coverPhoto, ...photos] : photos),
    [coverPhoto, photos],
  );
  const resolvedCuePhotos = useMemo(
    () =>
      resolveCuePhotos({
        cues,
        photos,
        assignments,
        coverPhoto,
        fallbackImageUrl: imageUrl,
      }),
    [assignments, coverPhoto, cues, imageUrl, photos],
  );
  const resolvedPhotoByCueId = useMemo(
    () =>
      new Map(
        resolvedCuePhotos.map((item) => [item.cue.id, item.photo] as const),
      ),
    [resolvedCuePhotos],
  );
  const selectedPhoto = selectedPhotoId
    ? visibleMedia.find((photo) => photo.id === selectedPhotoId)
    : null;
  const selectedUploadedPhoto =
    selectedPhoto && !selectedPhoto.isCover ? selectedPhoto : null;
  const studioBackdropUrl =
    imageUrl ??
    photos.find((photo) => getUploadedMediaType(photo) === "image")
      ?.objectUrl ??
    photos.find((photo) => getUploadedMediaType(photo) === "image")?.url ??
    null;
  const canOneClickMovie =
    activeTemplate === "photo-slideshow" &&
    photos.length > 0 &&
    cues.length > 0;
  const renderDimensions = previewAspectRatioOptions[previewAspectRatio];
  const previewTimeline = useMemo(
    (): MusicVideoTimeline =>
      activeTemplate === "minimal-vinyl"
        ? {
            assignments: [],
            audioUrl,
            backgroundBlur: minimalVinylBackgroundBlur,
            backgroundOverlay: minimalVinylBackgroundOverlay,
            backgroundPhoto: minimalVinylPreviewBackgroundPhoto ?? undefined,
            coverPhoto: minimalVinylCoverPhoto ?? undefined,
            duration: playerDuration,
            height: renderDimensions.height,
            lyrics: cues,
            photos: [],
            songTitle,
            templateId: "minimal-vinyl",
            lyricsStyle,
            transitions: [],
            width: renderDimensions.width,
          }
        : activeTemplate === "wave-radio"
          ? {
              assignments: [],
              audioUrl,
              coverPhoto: coverPhoto ?? undefined,
              duration: playerDuration,
              height: renderDimensions.height,
              lyrics: cues,
              photos: [],
              songTitle,
              templateId: "wave-radio",
              lyricsStyle: {
                ...lyricsStyle,
                position: "center",
              },
              transitions: [],
              waveRadioBackgroundId,
              width: renderDimensions.width,
            }
          : {
              assignments,
              atmosphereOverlay,
              audioUrl,
              coverPhoto: coverPhoto ?? undefined,
              duration: playerDuration,
              height: renderDimensions.height,
              lyrics: cues,
              photos,
              songTitle,
              templateId: "photo-slideshow",
              lyricsStyle,
              transitions: timelineTransitions,
              width: renderDimensions.width,
            },
    [
      activeTemplate,
      assignments,
      atmosphereOverlay,
      audioUrl,
      coverPhoto,
      cues,
      lyricsStyle,
      minimalVinylBackgroundBlur,
      minimalVinylBackgroundOverlay,
      minimalVinylPreviewBackgroundPhoto,
      minimalVinylCoverPhoto,
      photos,
      playerDuration,
      renderDimensions.height,
      renderDimensions.width,
      songTitle,
      timelineTransitions,
      waveRadioBackgroundId,
    ],
  );

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    return () => {
      if (
        minimalVinylDiscArtwork &&
        minimalVinylDiscArtwork.url !== minimalVinylDiscArtwork.objectUrl
      ) {
        URL.revokeObjectURL(minimalVinylDiscArtwork.objectUrl);
      }
    };
  }, [minimalVinylDiscArtwork]);

  useEffect(() => {
    return () => {
      if (
        minimalVinylBackgroundArtwork &&
        minimalVinylBackgroundArtwork.url !==
          minimalVinylBackgroundArtwork.objectUrl
      ) {
        URL.revokeObjectURL(minimalVinylBackgroundArtwork.objectUrl);
      }
    };
  }, [minimalVinylBackgroundArtwork]);

  useEffect(() => {
    function handleWindowResize() {
      setEditorWidth((currentWidth) =>
        clampEditorWidth(currentWidth, window.innerWidth),
      );
    }

    handleWindowResize();
    window.addEventListener("resize", handleWindowResize);

    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  useEffect(() => {
    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
      for (const photo of photosRef.current) {
        URL.revokeObjectURL(photo.objectUrl);
      }
    };
  }, []);

  const resetSongScopedState = useCallback(
    (nextSong: MusicVideoSongOption | null) => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
      for (const photo of photosRef.current) {
        URL.revokeObjectURL(photo.objectUrl);
      }
      photosRef.current = [];
      setPhotos([]);
      setAssignments([]);
      setTransitionAssignments([]);
      setPreviewTransitionLoop(null);
      setSelectedPhotoId(null);
      setIsPlaying(false);
      setLatestVideo(null);
      setLatestVideoTemplate(null);
      setMinimalVinylDiscArtwork((current) => {
        if (current && current.url !== current.objectUrl) {
          URL.revokeObjectURL(current.objectUrl);
        }
        return null;
      });
      setMinimalVinylBackgroundArtwork((current) => {
        if (current && current.url !== current.objectUrl) {
          URL.revokeObjectURL(current.objectUrl);
        }
        return null;
      });
      setMinimalVinylBackgroundBlur(DEFAULT_MINIMAL_VINYL_BACKGROUND_BLUR);
      setMinimalVinylBackgroundOverlay(
        DEFAULT_MINIMAL_VINYL_BACKGROUND_OVERLAY,
      );
      setMinimalVinylDiscCropDraft(null);
      setMinimalVinylDiscCropDragStart(null);
      setRenderProgress(0);
      setRenderStatus("idle");
      setPlayerDuration(
        nextSong?.duration && nextSong.duration > 0
          ? nextSong.duration
          : DEFAULT_DURATION,
      );
    },
    [],
  );

  const resetEditorSession = useCallback(
    (nextSong: MusicVideoSongOption | null = fallbackSong) => {
      setActiveTemplate("photo-slideshow");
      setPreviewAspectRatio("landscape");
      setLyricsStyle(DEFAULT_LYRICS_STYLE);
      setWaveRadioBackgroundId(DEFAULT_WAVE_RADIO_BACKGROUND.id);
      setAtmosphereOverlay(DEFAULT_ATMOSPHERE_OVERLAY);
      setEditorWidth(clampEditorWidth(DEFAULT_EDITOR_WIDTH));
      resetSongScopedState(nextSong);
    },
    [fallbackSong, resetSongScopedState],
  );

  function requestCloseStudio() {
    setShowCloseConfirm(true);
  }

  function confirmCloseStudio() {
    setShowCloseConfirm(false);
    setIsStudioOpen(false);
    setSelectedSongId(fallbackSongId);
    resetEditorSession(fallbackSong);
  }

  function handleStudioOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setIsStudioOpen(true);
      return;
    }

    requestCloseStudio();
  }

  function handleSongSelection(nextSongId: string) {
    const nextSong = selectableSongs.find((song) => song.id === nextSongId);
    if (!nextSong || nextSong.id === activeSongId) return;

    setSelectedSongId(nextSong.id);
    resetSongScopedState(nextSong);
  }

  async function uploadPhotoToR2(file: File, localPhoto: UploadedPhoto) {
    const presignResponse = await fetch(
      `/api/songs/${songId}/mv/assets/presign`,
      {
        body: JSON.stringify({
          contentType: file.type,
          fileName: file.name,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      },
    );
    const presign =
      await parseApiResponse<PresignedUploadResponse>(presignResponse);

    const uploadResponse = await fetch(presign.presignedUrl, {
      body: file,
      headers: { "Content-Type": file.type },
      method: "PUT",
    });
    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload ${file.name}.`);
    }

    setPhotos((currentPhotos) =>
      currentPhotos.map((photo) =>
        photo.id === localPhoto.id
          ? {
              ...photo,
              r2Key: presign.key,
              url: presign.publicObjectUrl,
            }
          : photo,
      ),
    );
  }

  function openMinimalVinylDiscCropDraft(file: File | undefined) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const source = String(reader.result || "");
      const image = new window.Image();
      image.onload = () => {
        const crop = buildInitialImageCrop({
          imageWidth: image.width,
          imageHeight: image.height,
          canvasWidth: DISC_IMAGE_CROP_PREVIEW_WIDTH,
          canvasHeight: DISC_IMAGE_CROP_PREVIEW_WIDTH,
        });
        setMinimalVinylDiscCropDraft({
          crop,
          imageHeight: image.height,
          imageWidth: image.width,
          source,
        });
      };
      image.src = source;
    };
    reader.readAsDataURL(file);
  }

  function updateMinimalVinylDiscCropTransform(
    patch: Partial<Pick<DiscImageCropDraft["crop"], "x" | "y" | "scale">>,
  ) {
    setMinimalVinylDiscCropDraft((current) => {
      if (!current) return current;

      return {
        ...current,
        crop: clampImageCrop(
          {
            x: patch.x ?? current.crop.x,
            y: patch.y ?? current.crop.y,
            scale: patch.scale ?? current.crop.scale,
            rotate: current.crop.rotate,
            flipX: current.crop.flipX,
            flipY: current.crop.flipY,
          },
          {
            imageWidth: current.imageWidth,
            imageHeight: current.imageHeight,
            canvasWidth: DISC_IMAGE_CROP_PREVIEW_WIDTH,
            canvasHeight: DISC_IMAGE_CROP_PREVIEW_WIDTH,
            maxScale: Math.max(current.crop.scale * 3, current.crop.scale + 2),
            overflowPadding: Math.round(DISC_IMAGE_CROP_PREVIEW_WIDTH * 0.08),
          },
        ),
      };
    });
  }

  function updateMinimalVinylDiscCropOrientation(
    patch: Partial<
      Pick<DiscImageCropDraft["crop"], "rotate" | "flipX" | "flipY">
    >,
  ) {
    setMinimalVinylDiscCropDraft((current) => {
      if (!current) return current;

      const rotate = patch.rotate ?? current.crop.rotate;
      const flipX = patch.flipX ?? current.crop.flipX;
      const flipY = patch.flipY ?? current.crop.flipY;

      if (patch.rotate !== undefined && patch.rotate !== current.crop.rotate) {
        return {
          ...current,
          crop: buildInitialImageCrop({
            imageWidth: current.imageWidth,
            imageHeight: current.imageHeight,
            canvasWidth: DISC_IMAGE_CROP_PREVIEW_WIDTH,
            canvasHeight: DISC_IMAGE_CROP_PREVIEW_WIDTH,
            rotate,
            flipX,
            flipY,
          }),
        };
      }

      return {
        ...current,
        crop: {
          ...current.crop,
          rotate,
          flipX,
          flipY,
        },
      };
    });
  }

  async function applyMinimalVinylDiscCrop() {
    if (!minimalVinylDiscCropDraft) return;

    const targetSize = DISC_IMAGE_CROP_PREVIEW_WIDTH;
    const source = minimalVinylDiscCropDraft.source;
    const crop = minimalVinylDiscCropDraft.crop;
    const image = new window.Image();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = targetSize;
        canvas.height = targetSize;
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Canvas is not available."));
          return;
        }

        context.save();
        context.beginPath();
        context.arc(
          targetSize / 2,
          targetSize / 2,
          targetSize / 2,
          0,
          Math.PI * 2,
        );
        context.clip();
        const scale = targetSize / DISC_IMAGE_CROP_PREVIEW_WIDTH;
        const renderedImageWidth =
          minimalVinylDiscCropDraft.imageWidth * crop.scale * scale;
        const renderedImageHeight =
          minimalVinylDiscCropDraft.imageHeight * crop.scale * scale;
        context.translate(
          (crop.x + crop.renderedWidth / 2) * scale,
          (crop.y + crop.renderedHeight / 2) * scale,
        );
        context.rotate((crop.rotate * Math.PI) / 180);
        context.scale(crop.flipX ? -1 : 1, crop.flipY ? -1 : 1);
        context.drawImage(
          image,
          -renderedImageWidth / 2,
          -renderedImageHeight / 2,
          renderedImageWidth,
          renderedImageHeight,
        );
        context.restore();

        resolve(canvas.toDataURL("image/png"));
      };
      image.onerror = () => reject(new Error("Unable to load crop image."));
      image.src = source;
    });

    const file = await dataUrlToFile(
      dataUrl,
      `minimal-vinyl-disc-${songId || "artwork"}.png`,
    );
    const objectUrl = URL.createObjectURL(file);
    const localPhoto = createUploadedPhotoFromObjectUrl({
      fileName: file.name,
      objectUrl,
    });

    setMinimalVinylDiscArtwork((current) => {
      if (current && current.url !== current.objectUrl) {
        URL.revokeObjectURL(current.objectUrl);
      }
      return localPhoto;
    });
    setMinimalVinylDiscCropDraft(null);
    setMinimalVinylDiscCropDragStart(null);
    setRenderStatus("uploading");

    try {
      const presignResponse = await fetch(
        `/api/songs/${songId}/mv/assets/presign`,
        {
          body: JSON.stringify({
            contentType: file.type,
            fileName: file.name,
          }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        },
      );
      const presign =
        await parseApiResponse<PresignedUploadResponse>(presignResponse);
      const uploadResponse = await fetch(presign.presignedUrl, {
        body: file,
        headers: { "Content-Type": file.type },
        method: "PUT",
      });
      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload ${file.name}.`);
      }

      setMinimalVinylDiscArtwork((current) =>
        current?.id === localPhoto.id
          ? {
              ...current,
              r2Key: presign.key,
              url: presign.publicObjectUrl,
            }
          : current,
      );
      toast.success("Disc artwork updated.");
    } catch (error) {
      setMinimalVinylDiscArtwork((current) =>
        current?.id === localPhoto.id ? null : current,
      );
      URL.revokeObjectURL(objectUrl);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to upload disc artwork.";
      toast.error(message);
    } finally {
      setRenderStatus("idle");
    }
  }

  function handleMinimalVinylDiscArtworkUpload(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    openMinimalVinylDiscCropDraft(event.target.files?.[0]);
    event.target.value = "";
  }

  async function handleMinimalVinylBackgroundArtworkUpload(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file for the background.");
      return;
    }

    const localPhoto = createUploadedPhoto(file);
    setMinimalVinylBackgroundArtwork((current) => {
      if (current && current.url !== current.objectUrl) {
        URL.revokeObjectURL(current.objectUrl);
      }
      return localPhoto;
    });
    setRenderStatus("uploading");

    try {
      const presignResponse = await fetch(
        `/api/songs/${songId}/mv/assets/presign`,
        {
          body: JSON.stringify({
            contentType: file.type,
            fileName: file.name,
          }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        },
      );
      const presign =
        await parseApiResponse<PresignedUploadResponse>(presignResponse);
      const uploadResponse = await fetch(presign.presignedUrl, {
        body: file,
        headers: { "Content-Type": file.type },
        method: "PUT",
      });
      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload ${file.name}.`);
      }

      setMinimalVinylBackgroundArtwork((current) =>
        current?.id === localPhoto.id
          ? {
              ...current,
              r2Key: presign.key,
              url: presign.publicObjectUrl,
            }
          : current,
      );
      toast.success("Background image updated.");
    } catch (error) {
      setMinimalVinylBackgroundArtwork((current) =>
        current?.id === localPhoto.id ? null : current,
      );
      URL.revokeObjectURL(localPhoto.objectUrl);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to upload background image.";
      toast.error(message);
    } finally {
      setRenderStatus("idle");
    }
  }

  async function handleDropPhotos(files: File[]) {
    const mediaFiles = files.filter(
      (file) =>
        file.type.startsWith("image/") || file.type.startsWith("video/"),
    );
    if (mediaFiles.length === 0) {
      toast.error("Please upload image or video files.");
      return;
    }

    const nextPhotos = mediaFiles.map(createUploadedPhoto);
    setPhotos((currentPhotos) => [...currentPhotos, ...nextPhotos]);
    setSelectedPhotoId((current) => current ?? nextPhotos[0]?.id ?? null);
    setRenderStatus("uploading");
    toast.info(`Uploading ${nextPhotos.length} media asset(s) to R2...`);

    const uploadResults = await Promise.allSettled(
      mediaFiles.map((file, index) => uploadPhotoToR2(file, nextPhotos[index])),
    );
    const failedPhotoIds = uploadResults
      .map((result, index) =>
        result.status === "rejected" ? nextPhotos[index].id : null,
      )
      .filter((photoId): photoId is string => Boolean(photoId));

    if (failedPhotoIds.length > 0) {
      setPhotos((currentPhotos) =>
        currentPhotos.filter((photo) => !failedPhotoIds.includes(photo.id)),
      );
      setAssignments((currentAssignments) =>
        currentAssignments.filter(
          (assignment) => !failedPhotoIds.includes(assignment.photoId),
        ),
      );
      setSelectedPhotoId((current) =>
        current && failedPhotoIds.includes(current) ? null : current,
      );
      for (const photo of nextPhotos) {
        if (failedPhotoIds.includes(photo.id))
          URL.revokeObjectURL(photo.objectUrl);
      }
      toast.error(`${failedPhotoIds.length} media asset(s) failed to upload.`);
    }

    const uploadedCount = nextPhotos.length - failedPhotoIds.length;
    if (uploadedCount > 0) {
      toast.success(`${uploadedCount} media asset(s) added to the MV pool.`);
    }
    setRenderStatus("idle");
  }

  function handleRemovePhoto(photo: UploadedPhoto) {
    setPhotos((currentPhotos) =>
      currentPhotos.filter((currentPhoto) => currentPhoto.id !== photo.id),
    );
    setAssignments((currentAssignments) =>
      removePhotoAssignments(currentAssignments, photo.id),
    );
    setSelectedPhotoId((current) => (current === photo.id ? null : current));
    URL.revokeObjectURL(photo.objectUrl);
  }

  function handleAssignPhoto(cueId: string, photoId: string) {
    setAssignments((currentAssignments) =>
      upsertAssignment(currentAssignments, cueId, photoId),
    );
    setSelectedPhotoId(photoId);
  }

  function handleSelectTransition(
    fromCueId: string,
    toCueId: string,
    type: TransitionType,
  ) {
    setTransitionAssignments((currentTransitions) => {
      const nextTransition = { fromCueId, toCueId, type };
      const existingIndex = currentTransitions.findIndex(
        (transition) =>
          transition.fromCueId === fromCueId && transition.toCueId === toCueId,
      );

      if (existingIndex === -1) return [...currentTransitions, nextTransition];

      return currentTransitions.map((transition, index) =>
        index === existingIndex ? nextTransition : transition,
      );
    });
  }

  function handlePreviewTransition(toCueId: string) {
    const toCue = cues.find((cue) => cue.id === toCueId);
    if (!toCue) return;

    const startFrame = Math.max(
      0,
      Math.floor(
        (toCue.start - TRANSITION_PREVIEW_SECONDS) * PHOTO_SLIDESHOW_FPS,
      ),
    );
    const endFrame = Math.max(
      startFrame + 1,
      Math.ceil(
        (toCue.start + TRANSITION_PREVIEW_TAIL_SECONDS) * PHOTO_SLIDESHOW_FPS,
      ),
    );

    setPreviewTransitionLoop({
      endFrame,
      nonce: Date.now(),
      startFrame,
    });
  }

  function handleOneClickMovie() {
    setAssignments(buildEvenPhotoAssignments({ cues, photos }));
    setTransitionAssignments(buildRandomTransitionAssignments({ cues }));
    setPreviewTransitionLoop(null);
    setIsPlaying(false);
    toast.success("One-click movie layout applied.");
  }

  function handlePausePreview() {
    setIsPlaying(false);
    setPreviewTransitionLoop(null);
  }

  function handleTogglePreviewAspectRatio() {
    setPreviewTransitionLoop(null);
    setIsPlaying(false);
    setPreviewAspectRatio((current) =>
      current === "portrait" ? "landscape" : "portrait",
    );
  }

  function handleChangeLyricsStyle(patch: Partial<LyricsStyleConfig>) {
    setLyricsStyle((currentStyle) => ({ ...currentStyle, ...patch }));
  }

  function handleChangeAtmosphereOverlay(
    patch: Partial<AtmosphereOverlayConfig>,
  ) {
    setAtmosphereOverlay((currentOverlay) => ({
      ...currentOverlay,
      ...patch,
    }));
  }

  function handleChangeMinimalVinylBackgroundOverlay(
    patch: Partial<MinimalVinylBackgroundOverlayConfig>,
  ) {
    setMinimalVinylBackgroundOverlay((currentOverlay) => ({
      ...currentOverlay,
      ...patch,
      opacity:
        typeof patch.opacity === "number" && Number.isFinite(patch.opacity)
          ? Math.min(Math.max(patch.opacity, 0), 1)
          : currentOverlay.opacity,
    }));
  }

  function handleSelectTemplate(template: TemplateCard) {
    if (template.status === "coming-soon") {
      toast.info(`${template.title} is coming soon.`);
      return;
    }
    if (template.id === activeTemplate) return;

    setPreviewTransitionLoop(null);
    setIsPlaying(false);
    setActiveTemplate(template.id);
  }

  function handleEditorResizeStart(clientX: number) {
    const startX = clientX;
    const startWidth = editorWidth;

    function resize(nextClientX: number) {
      setEditorWidth(
        clampEditorWidth(startWidth + startX - nextClientX, window.innerWidth),
      );
    }

    function handleMouseMove(event: MouseEvent) {
      resize(event.clientX);
    }

    function handleTouchMove(event: TouchEvent) {
      const touch = event.touches[0];
      if (touch) resize(touch.clientX);
    }

    function stopResize() {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopResize);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", stopResize);
      window.removeEventListener("touchcancel", stopResize);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopResize);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", stopResize);
    window.addEventListener("touchcancel", stopResize);
  }

  function scheduleRenderRefresh(videoId: string) {
    scheduleRenderRefreshWithDelay(videoId, MV_RENDER_POLL_INTERVAL_MS);
  }

  function scheduleRenderRefreshWithDelay(videoId: string, delayMs: number) {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
    }

    pollingTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/musicvideos/${videoId}/refresh`, {
          method: "POST",
        });
        const data =
          await parseApiResponse<MusicVideoRefreshResponse>(response);
        if (typeof data.progress === "number") {
          setRenderProgress(data.progress);
        }
        if (data.video) setLatestVideo(data.video);

        if (data.video?.status === "completed") {
          setRenderStatus("completed");
          toast.success("Music video is ready to download.");
          return;
        }
        if (data.video?.status === "failed") {
          setRenderStatus("failed");
          const message = data.video.error ?? "Music video render failed.";
          logMusicVideoRenderError(message, data.video);
          toast.error(message);
          return;
        }

        scheduleRenderRefreshWithDelay(
          videoId,
          data.video?.temporaryVideoUrl
            ? MV_RENDER_TEMP_URL_POLL_INTERVAL_MS
            : MV_RENDER_POLL_INTERVAL_MS,
        );
      } catch (error) {
        setRenderStatus("failed");
        const message =
          error instanceof Error
            ? error.message
            : "Unable to refresh MV render status.";
        console.error(
          "[MusicVideoEditorDrawer] Render status refresh failed",
          error,
        );
        toast.error(message);
      }
    }, delayMs);
  }

  async function handleRenderMv() {
    if (
      activeTemplate === "photo-slideshow" &&
      photos.length === 0 &&
      !coverPhoto
    ) {
      toast.error(
        "Upload at least one media asset or add a cover image before rendering this MV.",
      );
      return;
    }
    const pendingPhoto =
      activeTemplate === "photo-slideshow"
        ? photos.find((photo) => !photo.url)
        : null;
    const pendingMinimalVinylDiscPhoto =
      activeTemplate === "minimal-vinyl" &&
      minimalVinylDiscArtwork &&
      !minimalVinylDiscArtwork.url
        ? minimalVinylDiscArtwork
        : null;
    const pendingMinimalVinylBackgroundPhoto =
      activeTemplate === "minimal-vinyl" &&
      minimalVinylBackgroundArtwork &&
      !minimalVinylBackgroundArtwork.url
        ? minimalVinylBackgroundArtwork
        : null;
    if (pendingPhoto) {
      toast.error(`Wait for "${pendingPhoto.name}" to finish uploading.`);
      return;
    }
    if (pendingMinimalVinylDiscPhoto) {
      toast.error(
        `Wait for "${pendingMinimalVinylDiscPhoto.name}" to finish uploading.`,
      );
      return;
    }
    if (pendingMinimalVinylBackgroundPhoto) {
      toast.error(
        `Wait for "${pendingMinimalVinylBackgroundPhoto.name}" to finish uploading.`,
      );
      return;
    }

    const timeline: MusicVideoTimeline =
      activeTemplate === "minimal-vinyl"
        ? buildMinimalVinylTimeline({
            songTitle,
            audioUrl,
            backgroundBlur: minimalVinylBackgroundBlur,
            backgroundOverlay: minimalVinylBackgroundOverlay,
            backgroundPhoto: minimalVinylRenderBackgroundPhoto,
            coverPhoto: minimalVinylRenderCoverPhoto,
            duration: playerDuration,
            dimensions: renderDimensions,
            lyrics,
            fallbackImageUrl: imageUrl,
            timestampedLyrics,
            lyricsStyle,
          })
        : activeTemplate === "wave-radio"
          ? buildWaveRadioTimeline({
              songTitle,
              audioUrl,
              duration: playerDuration,
              dimensions: renderDimensions,
              lyrics,
              timestampedLyrics,
              lyricsStyle,
              waveRadioBackgroundId,
            })
          : buildPhotoSlideshowTimeline({
              songTitle,
              audioUrl,
              duration: playerDuration,
              dimensions: renderDimensions,
              lyrics,
              photos,
              assignments,
              fallbackImageUrl: imageUrl,
              timestampedLyrics,
              transitions: timelineTransitions,
              lyricsStyle,
              atmosphereOverlay,
            });

    try {
      setRenderStatus("rendering");
      setRenderProgress(0);
      const response = await fetch(`/api/songs/${songId}/mv/render`, {
        body: JSON.stringify(timeline),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const video = await parseApiResponse<MusicVideoRenderRecord>(response);
      setLatestVideo(video);
      setLatestVideoTemplate(activeTemplate);
      scheduleRenderRefresh(video.id);
      toast.success("Music video render started.");
    } catch (error) {
      setRenderStatus("failed");
      const message =
        error instanceof Error ? error.message : "Failed to start MV render.";
      console.error("[MusicVideoEditorDrawer] Failed to start render", error);
      logMusicVideoRenderError(message, error);
      toast.error(message);
    }
  }

  return (
    <>
      <DiscArtworkCropDialog
        draft={minimalVinylDiscCropDraft}
        dragStart={minimalVinylDiscCropDragStart}
        infoCardClassName={musicVideoInfoCardClassName}
        minScale={
          minimalVinylDiscCropDraft
            ? minimalVinylDiscCropDraft.crop.scale *
              Math.max(
                DISC_IMAGE_CROP_PREVIEW_WIDTH /
                  minimalVinylDiscCropDraft.crop.renderedWidth,
                DISC_IMAGE_CROP_PREVIEW_WIDTH /
                  minimalVinylDiscCropDraft.crop.renderedHeight,
              )
            : 0
        }
        pillButtonActiveClassName={musicVideoPillButtonActiveClassName}
        pillButtonClassName={musicVideoPillButtonClassName}
        primaryButtonClassName={musicVideoPrimaryButtonClassName}
        secondaryButtonClassName={musicVideoSecondaryButtonClassName}
        sectionHeadingClassName={musicVideoSectionHeadingClassName}
        subtlePanelClassName={musicVideoSubtlePanelClassName}
        onApply={applyMinimalVinylDiscCrop}
        onClose={() => {
          setMinimalVinylDiscCropDraft(null);
          setMinimalVinylDiscCropDragStart(null);
        }}
        onDragStartChange={setMinimalVinylDiscCropDragStart}
        onOrientationChange={updateMinimalVinylDiscCropOrientation}
        onTransformChange={updateMinimalVinylDiscCropTransform}
      />
      <Sheet open={isStudioOpen} onOpenChange={handleStudioOpenChange}>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent
          className={cn(studioGlassStyles.sheetContent, "overflow-hidden")}
        >
          <style>{wallArtFontFaceCss}</style>
          <style>{musicVideoMotionCss}</style>
          <StudioBlurBackdrop imageUrl={studioBackdropUrl} />
          <StudioHeader
            closeLabel="Close music video studio"
            description="Create, preview, and render your music video."
            icon={Video}
            onClose={requestCloseStudio}
            title="Music Video Studio"
            action={
              <Select value={activeSongId} onValueChange={handleSongSelection}>
                <SelectTrigger
                  aria-label="Choose song"
                  className="h-9 w-full shrink-0 rounded-full border-none bg-white/74 px-3 text-left text-[12px] font-black text-[#2d251f] shadow-[0_10px_21px_rgba(70,53,38,0.095),0_1px_0_rgba(255,255,255,0.78)_inset,0_0_0_1px_rgba(255,255,255,0.14)_inset] backdrop-blur-xl lg:w-[280px]"
                  disabled={!hasSongs}
                >
                  <SelectValue
                    placeholder={hasSongs ? "Choose song" : "No songs yet"}
                  />
                </SelectTrigger>
                <SelectContent
                  align="end"
                  className={cn(
                    musicVideoPopoverClassName,
                    "w-[240px] lg:w-[280px]",
                    studioGlassStyles.selectContentItems,
                  )}
                >
                  {selectableSongs.map((song) => (
                    <SelectItem key={song.id} value={song.id}>
                      <span className="block max-w-[200px] truncate lg:max-w-[232px]">
                        {song.title || "Untitled song"}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
          />

          {emptyState ? (
            <div className="relative z-10 min-h-0 flex-1">{emptyState}</div>
          ) : (
            <div
              className="relative z-10 grid min-h-0 flex-1 overflow-hidden px-2 pb-2 pt-2 sm:px-2.5 sm:pb-2.5 lg:grid-cols-[156px_minmax(280px,1fr)_minmax(320px,var(--music-video-editor-width))] lg:gap-2.5 lg:px-3 lg:pb-3 xl:grid-cols-[164px_minmax(320px,1fr)_minmax(340px,var(--music-video-editor-width))]"
              style={
                {
                  "--music-video-editor-width": `${editorWidth}px`,
                } as CSSProperties
              }
            >
              <TemplateRail
                activeTemplate={activeTemplate}
                onSelectTemplate={handleSelectTemplate}
              />

              <MusicVideoPreview
                aspectRatio={previewAspectRatio}
                duration={playerDuration}
                isPlaying={isPlaying}
                latestVideo={latestVideo}
                latestVideoTemplate={latestVideoTemplate}
                previewTransitionLoop={previewTransitionLoop}
                renderProgress={renderProgress}
                renderStatus={renderStatus}
                timeline={previewTimeline}
                onClearTransitionPreview={() => setPreviewTransitionLoop(null)}
                onGenerateVideo={handleRenderMv}
                onPause={handlePausePreview}
                onPlayerDuration={setPlayerDuration}
                onPlay={() => setIsPlaying(true)}
                onToggleAspectRatio={handleTogglePreviewAspectRatio}
                songTitle={songTitle}
              />

              <aside
                className={cn(
                  musicVideoPanelClassName,
                  "relative flex min-h-0 min-w-0 flex-col p-2",
                )}
              >
                <button
                  aria-label="Resize editor panel"
                  className="absolute inset-y-3 left-0 z-20 hidden w-3 -translate-x-1/2 cursor-col-resize items-center justify-center   text-[#6d5f53]  transition lg:flex"
                  data-music-video-editor-resizer
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    handleEditorResizeStart(event.clientX);
                  }}
                  onTouchStart={(event) => {
                    const touch = event.touches[0];
                    if (touch) handleEditorResizeStart(touch.clientX);
                  }}
                >
                  <span className="h-10 w-1 rounded-full bg-[#3a312a]/45 shadow-sm" />
                </button>

                <div className="flex shrink-0 items-center justify-between gap-2 px-1 pb-2">
                  <div>
                    <p className={musicVideoSectionHeadingClassName}>
                      Smart Editor
                    </p>
                    <p className="mt-0.5 text-[12px] font-black tracking-[-0.01em] text-[#241b16]">
                      {activeTemplate === "minimal-vinyl"
                        ? "Minimal Vinyl"
                        : activeTemplate === "wave-radio"
                          ? "Dynamic Lyrics Video"
                          : "Photo Slideshow"}
                    </p>
                  </div>
                  {canOneClickMovie ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          className={cn(
                            musicVideoPrimaryButtonClassName,
                            "h-8 shrink-0 px-3 text-[10.5px]",
                          )}
                          size="sm"
                          type="button"
                        >
                          <Wand2 className="size-3.5 group-hover:[animation:music-video-wand-float_0.85s_ease-in-out_infinite]" />
                          Auto Movie
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent
                        className={musicVideoPopoverClassName}
                      >
                        <AlertDialogHeader>
                          <AlertDialogTitle>Auto Movie</AlertDialogTitle>
                          <AlertDialogDescription>
                            Uploaded media assets will be distributed across the
                            song at lyric change points, and transition
                            animations will be chosen at random. Current manual
                            media bindings and transition settings will be
                            replaced.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className={musicVideoPrimaryButtonClassName}
                            onClick={handleOneClickMovie}
                          >
                            Apply
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <Badge
                      className="shrink-0 rounded-full border-none bg-white/64 px-2 py-0.5 text-[10px] font-black capitalize text-[#5b5047] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]"
                      variant="secondary"
                    >
                      {renderStatus === "idle" ? "Ready" : renderStatus}
                    </Badge>
                  )}
                </div>

                {activeTemplate === "minimal-vinyl" ? (
                  <div className="flex min-h-0 flex-1 overflow-hidden pt-1">
                    <MinimalVinylEditor
                      backgroundBlur={minimalVinylBackgroundBlur}
                      backgroundOverlay={minimalVinylBackgroundOverlay}
                      backgroundImage={minimalVinylBackgroundArtwork}
                      backgroundImageInputId={
                        minimalVinylBackgroundImageInputId
                      }
                      discArtwork={minimalVinylDiscArtwork}
                      discArtworkInputId={minimalVinylDiscArtworkInputId}
                      lyricsStyle={lyricsStyle}
                      onChangeBackgroundBlur={setMinimalVinylBackgroundBlur}
                      onChangeBackgroundOverlay={
                        handleChangeMinimalVinylBackgroundOverlay
                      }
                      onChangeLyricsStyle={handleChangeLyricsStyle}
                      onUploadBackgroundImage={
                        handleMinimalVinylBackgroundArtworkUpload
                      }
                      onUploadDiscArtwork={handleMinimalVinylDiscArtworkUpload}
                    />
                  </div>
                ) : activeTemplate === "wave-radio" ? (
                  <div className="flex min-h-0 flex-1 overflow-hidden pt-1">
                    <WaveRadioEditor
                      backgroundId={waveRadioBackgroundId}
                      lyricsStyle={{
                        ...lyricsStyle,
                        position: "center",
                      }}
                      onChangeLyricsStyle={handleChangeLyricsStyle}
                      onSelectBackground={setWaveRadioBackgroundId}
                    />
                  </div>
                ) : (
                  <div className="grid min-h-0 flex-1 grid-cols-[82px_minmax(0,1fr)] gap-2 pt-1 xl:grid-cols-[92px_minmax(0,1fr)]">
                    <PhotoMediaRail
                      media={visibleMedia}
                      selectedPhotoId={selectedPhotoId}
                      onRemovePhoto={handleRemovePhoto}
                      onSelectPhoto={setSelectedPhotoId}
                    />

                    <ScrollArea
                      className={cn(
                        musicVideoSubtlePanelClassName,
                        musicVideoScrollAreaClassName,
                        musicVideoScrollAreaViewportClassName,
                        "min-h-0 min-w-0 overflow-hidden p-1",
                      )}
                      data-music-video-editor-scroll
                      data-music-video-editor-main
                    >
                      <div className="min-h-full min-w-0 space-y-2">
                        <PhotoUploadLyricsTabs
                          atmosphereOverlay={atmosphereOverlay}
                          lyricsStyle={lyricsStyle}
                          photos={photos}
                          selectedUploadedPhoto={selectedUploadedPhoto}
                          onChangeAtmosphereOverlay={
                            handleChangeAtmosphereOverlay
                          }
                          onChangeLyricsStyle={handleChangeLyricsStyle}
                          onDropPhotos={handleDropPhotos}
                        />

                        <LyricPhotoTimeline
                          assignments={assignments}
                          cues={cues}
                          photos={photos}
                          resolvedPhotoByCueId={resolvedPhotoByCueId}
                          selectedPhotoId={selectedPhotoId}
                          transitions={timelineTransitions}
                          onAssignPhoto={handleAssignPhoto}
                          onPreviewTransition={handlePreviewTransition}
                          onSelectPhoto={setSelectedPhotoId}
                          onSelectTransition={handleSelectTransition}
                        />
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </aside>
            </div>
          )}
        </SheetContent>
      </Sheet>
      <AlertDialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
        <AlertDialogContent className={musicVideoPopoverClassName}>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard music video edits?</AlertDialogTitle>
            <AlertDialogDescription>
              Closing the music video studio will discard the edits from this
              session. Template selections, uploaded media, and render progress
              will start fresh the next time you open it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              className={musicVideoPrimaryButtonClassName}
              onClick={confirmCloseStudio}
            >
              Close and discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
