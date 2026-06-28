"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ATMOSPHERE_OVERLAY_OPTIONS,
  DEFAULT_ATMOSPHERE_OVERLAY,
  DEFAULT_WAVE_RADIO_BACKGROUND,
  WAVE_RADIO_BACKGROUND_OPTIONS,
  buildEvenPhotoAssignments,
  buildMinimalVinylTimeline,
  buildPhotoSlideshowTimeline,
  buildRandomTransitionAssignments,
  buildWaveRadioTimeline,
  buildLyricCuesFromAlignedWords,
  createCoverPhoto,
  DEFAULT_LYRICS_STYLE,
  DEFAULT_TRANSITION_TYPE,
  getUploadedMediaType,
  normalizeTransitions,
  parseTimestampedLyrics,
  resolveCuePhotos,
  shouldShowPhotoTransition,
  type AlignedLyricWord,
  type AtmosphereOverlayConfig,
  type LyricsEntranceMode,
  type LyricsPosition,
  type LyricsStyleConfig,
  type MusicVideoTimeline,
  type PhotoAssignment,
  type TransitionAssignment,
  type TransitionType,
  type UploadedPhoto,
  type WaveRadioBackgroundOption,
} from "@/lib/music-video/photo-slideshow";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  PHOTO_SLIDESHOW_FPS,
  PHOTO_SLIDESHOW_HEIGHT,
  PHOTO_SLIDESHOW_WIDTH,
} from "@/lib/music-video/remotion-constants";
import { cn } from "@/lib/utils";
import { wallArtFontFiles, wallArtFonts } from "@/lib/wall-art/fonts";
import { MinimalVinylComposition } from "@/remotion-src/MinimalVinylComposition";
import { PhotoSlideshowComposition } from "@/remotion-src/PhotoSlideshowComposition";
import { WaveRadioComposition } from "@/remotion-src/WaveRadioComposition";
import { Player, type PlayerRef } from "@remotion/player";
import {
  Check,
  ChevronsUpDown,
  Clapperboard,
  Circle,
  Download,
  Film,
  ImagePlus,
  Images,
  type LucideIcon,
  Loader2,
  Music2,
  Pause,
  Play,
  RectangleHorizontal,
  RectangleVertical,
  Radio,
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
} from "lucide-react";
import Image from "next/image";
import {
  Fragment,
  type CSSProperties,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

type MusicVideoEditorDrawerProps = {
  audioUrl: string;
  duration?: number | null;
  emptyState?: ReactNode;
  imageUrl?: string | null;
  lyrics: string;
  songId: string;
  songTitle: string;
  timestampedLyrics?: {
    alignedWords: AlignedLyricWord[];
  } | null;
  trigger: ReactNode;
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
    title: "Dynamic Wave Radio",
    description: "Audio-reactive waves and captions for a broadcast mood.",
    demoImageAlt: "Dynamic wave radio music visualizer template demo",
    demoImageSrc: "/images/features/dynamic-wave-radio-template.webp",
    icon: Radio,
    status: "available",
  },
];

const DEFAULT_DURATION = 30;
const DEFAULT_EDITOR_WIDTH = 480;
const MIN_EDITOR_WIDTH = 360;
const MAX_EDITOR_WIDTH = 600;
const MAX_EDITOR_VIEWPORT_RATIO = 0.32;
const MAX_MEDIA_BYTES = 80 * 1024 * 1024;
const TRANSITION_PREVIEW_SECONDS = 1;
const TRANSITION_PREVIEW_TAIL_SECONDS = 1;
const wallArtFontFaceCss = wallArtFontFiles
  .map(
    ([family, src, weight]) =>
      `@font-face{font-family:'${family}';src:url('${src}') format('truetype');font-style:normal;font-weight:${weight};font-display:swap;}`,
  )
  .join("");
const previewAspectRatioOptions: Record<
  PreviewAspectRatio,
  {
    height: number;
    label: string;
    width: number;
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
    <aside className="flex min-h-0 flex-col border-b bg-[#fffaf5]/90 p-3 lg:border-b-0 lg:border-r">
      <div className="flex shrink-0 items-center gap-2 px-1 text-sm font-black text-foreground">
        <Clapperboard className="size-4" />
        Templates
      </div>
      <div className="mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {templates.map((template) => {
          const Icon = template.icon;
          const isActive = activeTemplate === template.id;
          const isDisabled = template.status === "coming-soon";

          return (
            <button
              key={template.id}
              className={cn(
                "w-full rounded-xl border p-2 text-left transition",
                isActive
                  ? "border-rose-400 bg-rose-50 shadow-sm"
                  : "border-stone-200 bg-white hover:border-rose-300 hover:bg-rose-50/50",
                isDisabled && "cursor-not-allowed opacity-60 hover:bg-white",
              )}
              disabled={isDisabled}
              type="button"
              onClick={() => onSelectTemplate(template)}
            >
              <div className="overflow-hidden rounded-lg border border-stone-200 bg-[#241d1b]">
                <div className="relative aspect-[4/3]">
                  {template.demoImageSrc ? (
                    <>
                      <Image
                        fill
                        alt={template.demoImageAlt ?? template.title}
                        className="object-cover"
                        sizes="(min-width: 1024px) 204px, calc(100vw - 48px)"
                        src={template.demoImageSrc}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/10" />
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
                  <span className="absolute left-3 top-3 flex size-9 items-center justify-center rounded-lg bg-white/90 text-rose-500">
                    <Icon className="size-4" />
                  </span>
                </div>
              </div>
              <div className="mt-2 flex items-start justify-between gap-2">
                <p className="text-xs font-black leading-4">{template.title}</p>
                {isActive ? (
                  <Badge className="px-1.5 py-0 text-[10px]">Active</Badge>
                ) : null}
                {isDisabled ? (
                  <Badge
                    className="px-1.5 py-0 text-[10px]"
                    variant="secondary"
                  >
                    Coming soon
                  </Badge>
                ) : null}
              </div>
              <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                {template.description}
              </p>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function MusicVideoPreview({
  aspectRatio,
  duration,
  isPlaying,
  latestVideo,
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
  const lastPreviewTimeRef = useRef(0);
  const progress = duration ? Math.min(previewTime / duration, 1) * 100 : 0;
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

  useEffect(() => {
    onPlayRef.current = onPlay;
  }, [onPlay]);

  useEffect(() => {
    previewTransitionLoopRef.current = previewTransitionLoop;
  }, [previewTransitionLoop]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !previewTransitionLoop) return;

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
          1 / PHOTO_SLIDESHOW_FPS
      ) {
        return;
      }

      lastPreviewTimeRef.current = safeTime;
      setPreviewTime(safeTime);
    };

    const handleFrameUpdate = ({
      detail,
    }: {
      detail: { frame: number };
    }) => {
      const loop = previewTransitionLoopRef.current;
      if (loop && detail.frame >= loop.endFrame) {
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

    player.play();
    clearTransitionPreview();
    onPlay();
  }

  function handleSeek(nextTime: number) {
    const player = playerRef.current;
    const safeTime = Math.min(Math.max(nextTime, 0), duration);

    clearTransitionPreview();
    lastPreviewTimeRef.current = safeTime;
    setPreviewTime(safeTime);
    if (player) {
      player.seekTo(Math.round(safeTime * PHOTO_SLIDESHOW_FPS));
    }
  }

  return (
    <section className="flex min-h-0 flex-col bg-[#f4efe8] px-4 py-4 xl:px-6">
      <div className="flex shrink-0 items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-500">
            Remotion Preview
          </p>
          <h3 className="text-lg font-black text-foreground">{songTitle}</h3>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            className="rounded-full bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600"
            disabled={isRendering || renderStatus === "uploading"}
            type="button"
            onClick={onGenerateVideo}
          >
            {isRendering ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Wand2 className="size-4" />
            )}
            Generate Video
          </Button>
          <Button
            aria-label="Switch preview aspect ratio"
            className="rounded-full border-stone-300 bg-white/85 px-3 font-black text-stone-700 shadow-sm hover:bg-white hover:text-rose-600"
            title={`Switch to ${nextAspectRatioLabel}`}
            type="button"
            variant="outline"
            onClick={onToggleAspectRatio}
          >
            <AspectIcon className="size-4" />
            {previewDimensions.label}
          </Button>
          <Button
            className="rounded-full bg-[#1f1a17] text-white hover:bg-[#332b26]"
            type="button"
            onClick={togglePlayback}
          >
            {isPlaying ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4" />
            )}
            {isPlaying ? "Pause" : "Play"}
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center py-4 xl:py-6">
        <div
          className={cn(
            "relative overflow-hidden border-[10px] border-[#171412] bg-[#171412] shadow-2xl shadow-black/25",
            aspectRatio === "portrait"
              ? "aspect-[9/16] h-full max-h-[min(72vh,760px)] min-h-[420px] rounded-[34px]"
              : "aspect-[16/9] w-full max-w-[min(100%,1180px,calc(177.78vh-23.11rem))] rounded-[28px]",
          )}
        >
          <div className="absolute inset-0 rounded-[24px] bg-black">
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
              inputProps={{ timeline }}
              style={{ height: "100%", width: "100%" }}
            />
          </div>
          <div className="absolute left-1/2 top-2 h-1.5 w-16 -translate-x-1/2 rounded-full bg-white/20" />
        </div>
      </div>

      <div className="shrink-0">
        <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
          {latestVideo?.videoUrl ? (
            <Button
              asChild
              className="rounded-full"
              type="button"
              variant="outline"
            >
              <a download href={latestVideo.videoUrl}>
                <Download className="size-4" />
                Download MP4
              </a>
            </Button>
          ) : null}
        </div>
        {isRendering ? (
          <div className="mb-3 rounded-xl border border-rose-100 bg-white/75 px-3 py-2 text-xs font-bold text-stone-600">
            Rendering video... {Math.round(renderProgress * 100)}%
          </div>
        ) : null}
        <div className="relative h-5">
          <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 overflow-hidden rounded-full bg-white shadow-inner">
            <div
              className="h-full rounded-full bg-rose-500 transition-[width]"
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
            className="pointer-events-none absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-rose-500 shadow-md"
            style={{ left: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs font-bold text-stone-500">
          <span>{formatTime(previewTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </section>
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
        <div className="flex min-w-0 items-center gap-2 text-sm font-black text-foreground">
          <Images className="size-4 shrink-0" />
          <span className="truncate">Media Assets</span>
        </div>
        <Badge className="shrink-0" variant="secondary">
          {photos.length} assets
        </Badge>
      </div>
      <div
        {...getRootProps()}
        className={cn(
          "mt-3 flex min-w-0 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed bg-white/70 px-3 py-5 text-center transition",
          isDragActive
            ? "border-rose-400 bg-rose-50"
            : "border-stone-300 hover:border-rose-300 hover:bg-white",
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="size-8 shrink-0 text-rose-500" />
        <p className="mt-2 max-w-full truncate text-sm font-bold text-foreground">
          Drag media here or click to upload
        </p>
        <p className="mt-1 max-w-full truncate text-xs leading-5 text-muted-foreground">
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
    <div className="space-y-2">
      <Label className="text-[11px] font-black uppercase tracking-[0.12em] text-stone-500">
        Font
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            aria-expanded={open}
            className="h-9 w-full justify-between rounded-lg border-stone-200 bg-white px-3 text-left font-bold"
            role="combobox"
            type="button"
            variant="outline"
          >
            <span
              className="min-w-0 truncate text-sm"
              style={{ fontFamily: selectedFont?.previewFamily }}
            >
              {selectedFont?.label ?? "Select font"}
            </span>
            <ChevronsUpDown className="size-3.5 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="flex max-h-[min(20rem,var(--radix-popover-content-available-height))] w-[--radix-popover-trigger-width] flex-col p-0"
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
                        "size-4",
                        font.value === value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span
                      className="min-w-0 truncate text-base leading-7"
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
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label className="text-[11px] font-black uppercase tracking-[0.12em] text-stone-500">
          {label}
        </Label>
        <Input
          aria-label={label}
          className="h-8 w-16 rounded-lg bg-white px-2 text-right text-xs font-black"
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
    <div className="space-y-2">
      <Label className="text-[11px] font-black uppercase tracking-[0.12em] text-stone-500">
        {label}
      </Label>
      <div className="grid min-w-0 grid-cols-[44px_minmax(0,1fr)] gap-2">
        <Input
          aria-label={`${label} swatch`}
          className="h-9 cursor-pointer rounded-lg bg-white p-1"
          type="color"
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
        <Input
          aria-label={label}
          className="h-9 rounded-lg bg-white px-2 text-xs font-bold uppercase"
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
    <div className="space-y-4">
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
      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
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
      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-[11px] font-black uppercase tracking-[0.12em] text-stone-500">
            Position
          </Label>
          <Select
            value={lockCenterPosition ? "center" : lyricsStyle.position}
            onValueChange={(position) =>
              onChangeLyricsStyle({ position: position as LyricsPosition })
            }
          >
            <SelectTrigger
              className="h-9 rounded-lg bg-white px-2 text-xs font-bold"
              disabled={lockCenterPosition}
            >
              <SelectValue
                placeholder={lockCenterPosition ? "Center only" : undefined}
              />
            </SelectTrigger>
            <SelectContent>
              {lyricsPositionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-[11px] font-black uppercase tracking-[0.12em] text-stone-500">
            Entrance
          </Label>
          <Select
            value={lyricsStyle.entrance}
            onValueChange={(entrance) =>
              onChangeLyricsStyle({
                entrance: entrance as LyricsEntranceMode,
              })
            }
          >
            <SelectTrigger className="h-9 rounded-lg bg-white px-2 text-xs font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
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
    <Tabs defaultValue="photos" className="min-w-0 rounded-xl border border-stone-200 bg-white/85 p-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <TabsList className="grid h-9 w-full grid-cols-3 bg-stone-100">
          <TabsTrigger
            className="rounded-md text-xs font-black data-[state=active]:bg-white data-[state=active]:text-rose-600"
            value="photos"
          >
            <ImagePlus className="size-3.5" />
            Upload Media
          </TabsTrigger>
          <TabsTrigger
            className="rounded-md text-xs font-black data-[state=active]:bg-white data-[state=active]:text-rose-600"
            value="lyrics"
          >
            <Type className="size-3.5" />
            Lyrics Config
          </TabsTrigger>
          <TabsTrigger
            className="rounded-md text-xs font-black data-[state=active]:bg-white data-[state=active]:text-rose-600"
            value="overlay"
          >
            <Sparkles className="size-3.5" />
            Overlay Config
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent className="mt-3 space-y-3" value="photos">
        <PhotoUploadPool photos={photos} onDropPhotos={onDropPhotos} />
        {selectedUploadedPhoto ? (
          <div className="flex min-w-0 items-center gap-2 rounded-lg border border-rose-100 bg-white px-3 py-2 text-xs font-bold text-stone-600 shadow-sm">
            <Waves className="size-4 shrink-0 text-rose-500" />
            <span className="truncate">Selected: {selectedUploadedPhoto.name}</span>
          </div>
        ) : null}
      </TabsContent>

      <TabsContent className="mt-3 space-y-4" value="lyrics">
        <LyricsStyleSettings
          lyricsStyle={lyricsStyle}
          onChangeLyricsStyle={onChangeLyricsStyle}
        />
      </TabsContent>

      <TabsContent className="mt-3 space-y-4" value="overlay">
        <div className="space-y-2">
          <Label className="text-[11px] font-black uppercase tracking-[0.12em] text-stone-500">
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
            <SelectTrigger className="h-9 rounded-lg bg-white px-2 text-xs font-bold">
              <SelectValue placeholder="No Overlay" />
            </SelectTrigger>
            <SelectContent>
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
          <div className="overflow-hidden rounded-lg border border-rose-100 bg-stone-950 shadow-sm">
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
      className="flex min-h-0 flex-col rounded-xl border border-stone-200 bg-white/90 p-2 shadow-sm"
      data-photo-media-rail
    >
      <div className="flex shrink-0 items-center justify-between gap-2 px-1">
        <div className="flex min-w-0 items-center gap-1.5 text-[11px] font-black uppercase text-stone-600">
          <Images className="size-3.5 text-rose-500" />
          Media
        </div>
        <Badge className="h-5 px-1.5 text-[10px]" variant="secondary">
          {media.length}
        </Badge>
      </div>

      <ScrollArea
        className="mt-2 min-h-0 flex-1 overflow-y-auto"
        data-photo-media-rail-scroll
        style={{ scrollbarGutter: "stable" }}
      >
        <div className="space-y-2 pb-2 pr-3">
          {media.length === 0 ? (
            <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-stone-50/80 px-2 text-center">
              <ImagePlus className="size-6 text-stone-300" />
              <p className="mt-2 text-[11px] font-black leading-4 text-stone-500">
                No media
              </p>
            </div>
          ) : null}

          {media.length > 0
            ? media.map((photo, index) => (
                <div
                  key={photo.id}
                  className={cn(
                    "group relative overflow-hidden rounded-xl border bg-stone-100 text-left shadow-sm transition",
                    selectedPhotoId === photo.id
                      ? "border-rose-500 ring-2 ring-rose-200"
                      : "border-stone-200 hover:border-rose-300",
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
                  <span className="absolute left-1 top-1 rounded-full bg-black/65 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {photo.isCover
                      ? "Cover"
                      : getUploadedMediaType(photo) === "video"
                        ? "Video"
                        : index + 1}
                  </span>
                  {selectedPhotoId === photo.id ? (
                    <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm">
                      <Check className="size-3" />
                    </span>
                  ) : null}
                  {photo.isCover ? null : (
                    <button
                      aria-label={`Remove ${photo.name}`}
                      className="absolute bottom-1 right-1 flex size-6 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition hover:bg-rose-500 group-hover:opacity-100"
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
      <div className="absolute left-7 top-0 h-full w-px bg-stone-200" />
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="relative z-10 inline-flex max-w-full items-center gap-1.5 rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[10px] font-black text-stone-600 shadow-sm transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
            type="button"
            onClick={() => onPreviewTransition(toCueId)}
          >
            <Film className="size-3 text-rose-500" />
            <span className="truncate">{getTransitionLabel(activeType)}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="center"
          className="w-auto max-w-[min(420px,calc(100vw-32px))] rounded-xl border-rose-100 bg-white/95 p-2 shadow-xl"
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
                    "group flex w-[92px] flex-col items-center gap-1 rounded-lg border px-2 py-2 text-center transition",
                    isActive
                      ? "border-rose-400 bg-rose-50 text-rose-600"
                      : "border-stone-200 bg-white text-stone-600 hover:border-rose-300 hover:bg-rose-50/80",
                  )}
                  title={option.description}
                  type="button"
                  onClick={() => {
                    onSelectTransition(fromCueId, toCueId, option.type);
                    onPreviewTransition(toCueId);
                  }}
                  onMouseEnter={() => onPreviewTransition(toCueId)}
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
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-black text-foreground">
          <Film className="size-4" />
          Lyrics Storyline
        </div>
        <Badge variant="secondary">{cues.length} cues</Badge>
      </div>

      <div className="space-y-2 pb-4">
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
                className="grid min-w-0 grid-cols-[56px_minmax(0,1fr)] gap-2.5 rounded-xl border border-stone-200 bg-white/85 p-2.5 shadow-sm transition hover:border-rose-200"
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
                    "relative aspect-square w-full overflow-hidden rounded-lg border bg-stone-100 transition",
                    assignedPhotoId
                      ? "border-rose-400"
                      : "border-dashed border-stone-300",
                    selectedPhotoId && "hover:border-rose-500",
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
                    <span className="flex size-full items-center justify-center px-1 text-center text-[10px] font-bold text-stone-400">
                      Drop
                    </span>
                  )}
                  {assignedPhotoId ? (
                    <span className="absolute bottom-1 left-1 rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
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
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-rose-500">
                    <span>{formatTime(cue.start)}</span>
                    <span className="text-stone-300">-</span>
                    <span>{formatTime(cue.end)}</span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-[13px] font-bold leading-5 text-foreground">
                    {cue.text}
                  </p>
                  <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
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
                      className="h-8 w-full min-w-0 rounded-lg bg-white px-2 text-xs [&>span]:min-w-0 [&>span]:truncate"
                      disabled={photos.length === 0}
                    >
                      <SelectValue placeholder="Media" />
                    </SelectTrigger>
                    <SelectContent>
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
  lyricsStyle,
  onChangeLyricsStyle,
}: {
  lyricsStyle: LyricsStyleConfig;
  onChangeLyricsStyle: (patch: Partial<LyricsStyleConfig>) => void;
}) {
  return (
    <ScrollArea
      className="min-h-0 min-w-0 overflow-y-auto rounded-xl border border-amber-200 bg-[#fff7ed]"
      data-minimal-vinyl-editor
      data-music-video-editor-scroll
      data-music-video-editor-main
    >
      <div className="min-h-full min-w-0 space-y-3 p-3">
        <section className="rounded-xl border border-amber-200 bg-white/90 p-3 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-black text-foreground">
            <Type className="size-4 text-amber-600" />
            Lyrics Config
          </div>
          <div className="mt-3">
            <LyricsStyleSettings
              lyricsStyle={lyricsStyle}
              onChangeLyricsStyle={onChangeLyricsStyle}
            />
          </div>
        </section>
      </div>
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
      className="min-h-0 min-w-0 overflow-y-auto rounded-xl border border-cyan-200 bg-[#eefcff]"
      data-music-video-editor-main
      data-music-video-editor-scroll
      data-wave-radio-editor
    >
      <div className="min-h-full min-w-0 space-y-3 p-3">
        <section className="rounded-xl border border-cyan-200 bg-white/90 p-3 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2 text-sm font-black text-foreground">
              <Radio className="size-4 shrink-0 text-cyan-600" />
              <span className="truncate">Background Video</span>
            </div>
            <Badge className="shrink-0" variant="secondary">
              {WAVE_RADIO_BACKGROUND_OPTIONS.length} clips
            </Badge>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {WAVE_RADIO_BACKGROUND_OPTIONS.map(
              (background: WaveRadioBackgroundOption) => {
                const isActive = background.id === backgroundId;

                return (
                  <button
                    key={background.id}
                    className={cn(
                      "group overflow-hidden rounded-xl border bg-stone-950 text-left shadow-sm transition",
                      isActive
                        ? "border-cyan-400 ring-2 ring-cyan-200"
                        : "border-stone-200 hover:border-cyan-300",
                    )}
                    data-wave-radio-background-option
                    type="button"
                    onClick={() => onSelectBackground(background.id)}
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <video
                        muted
                        loop
                        playsInline
                        className="size-full object-cover opacity-80 transition duration-300 group-hover:scale-105"
                        preload="metadata"
                        src={background.src}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-white/10" />
                      {isActive ? (
                        <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-cyan-400 text-stone-950 shadow-sm">
                          <Check className="size-3.5" />
                        </span>
                      ) : null}
                      <span className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate text-xs font-black text-white">
                        {background.label}
                      </span>
                    </div>
                  </button>
                );
              },
            )}
          </div>
        </section>

        <section className="rounded-xl border border-cyan-200 bg-white/90 p-3 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-black text-foreground">
            <Type className="size-4 text-cyan-600" />
            Lyrics Config
          </div>
          <div className="mt-3">
            <LyricsStyleSettings
              forceCenterPosition
              lyricsStyle={lyricsStyle}
              onChangeLyricsStyle={onChangeLyricsStyle}
            />
          </div>
        </section>
      </div>
    </ScrollArea>
  );
}

export function MusicVideoEditorDrawer({
  audioUrl,
  duration,
  emptyState,
  imageUrl,
  lyrics,
  songId,
  songTitle,
  timestampedLyrics,
  trigger,
}: MusicVideoEditorDrawerProps) {
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
    useState<PreviewAspectRatio>("portrait");
  const [lyricsStyle, setLyricsStyle] =
    useState<LyricsStyleConfig>(DEFAULT_LYRICS_STYLE);
  const [waveRadioBackgroundId, setWaveRadioBackgroundId] = useState(
    DEFAULT_WAVE_RADIO_BACKGROUND.id,
  );
  const [atmosphereOverlay, setAtmosphereOverlay] =
    useState<AtmosphereOverlayConfig>(DEFAULT_ATMOSPHERE_OVERLAY);
  const [editorWidth, setEditorWidth] = useState(() =>
    clampEditorWidth(DEFAULT_EDITOR_WIDTH),
  );
  const [latestVideo, setLatestVideo] =
    useState<MusicVideoRenderRecord | null>(null);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderStatus, setRenderStatus] = useState<
    "idle" | "uploading" | "rendering" | "completed" | "failed"
  >("idle");
  const [playerDuration, setPlayerDuration] = useState(
    duration && duration > 0 ? duration : DEFAULT_DURATION,
  );
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
  const canOneClickMovie =
    activeTemplate === "photo-slideshow" && photos.length > 0 && cues.length > 0;
  const previewTimeline = useMemo(
    (): MusicVideoTimeline =>
      activeTemplate === "minimal-vinyl"
        ? {
            assignments: [],
            audioUrl,
            coverPhoto: coverPhoto ?? undefined,
            duration: playerDuration,
            lyrics: cues,
            photos: [],
            songTitle,
            templateId: "minimal-vinyl",
            lyricsStyle,
            transitions: [],
          }
        : activeTemplate === "wave-radio"
          ? {
              assignments: [],
              audioUrl,
              duration: playerDuration,
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
            }
        : {
            assignments,
            atmosphereOverlay,
            audioUrl,
            coverPhoto: coverPhoto ?? undefined,
            duration: playerDuration,
            lyrics: cues,
            photos,
            songTitle,
            templateId: "photo-slideshow",
            lyricsStyle,
            transitions: timelineTransitions,
          },
    [
      activeTemplate,
      assignments,
      atmosphereOverlay,
      audioUrl,
      coverPhoto,
      cues,
      lyricsStyle,
      photos,
      playerDuration,
      songTitle,
      timelineTransitions,
      waveRadioBackgroundId,
    ],
  );

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

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

  async function handleDropPhotos(files: File[]) {
    const mediaFiles = files.filter(
      (file) => file.type.startsWith("image/") || file.type.startsWith("video/"),
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
      .map((result, index) => (result.status === "rejected" ? nextPhotos[index].id : null))
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
        if (failedPhotoIds.includes(photo.id)) URL.revokeObjectURL(photo.objectUrl);
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
      Math.floor((toCue.start - TRANSITION_PREVIEW_SECONDS) * PHOTO_SLIDESHOW_FPS),
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
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
    }

    pollingTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/musicvideos/${videoId}/refresh`, {
          method: "POST",
        });
        const data = await parseApiResponse<MusicVideoRefreshResponse>(response);
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

        scheduleRenderRefresh(videoId);
      } catch (error) {
        setRenderStatus("failed");
        const message =
          error instanceof Error
            ? error.message
            : "Unable to refresh MV render status.";
        console.error("[MusicVideoEditorDrawer] Render status refresh failed", error);
        toast.error(message);
      }
    }, 3500);
  }

  async function handleRenderMv() {
    if (activeTemplate === "photo-slideshow" && photos.length === 0 && !coverPhoto) {
      toast.error("Upload at least one media asset or add a cover image before rendering this MV.");
      return;
    }
    const pendingPhoto =
      activeTemplate === "photo-slideshow"
        ? photos.find((photo) => !photo.url)
        : null;
    if (pendingPhoto) {
      toast.error(`Wait for "${pendingPhoto.name}" to finish uploading.`);
      return;
    }

    const timeline: MusicVideoTimeline =
      activeTemplate === "minimal-vinyl"
        ? buildMinimalVinylTimeline({
            songTitle,
            audioUrl,
            duration: playerDuration,
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
              lyrics,
              timestampedLyrics,
              lyricsStyle,
              waveRadioBackgroundId,
            })
        : buildPhotoSlideshowTimeline({
            songTitle,
            audioUrl,
            duration: playerDuration,
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
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-screen max-w-none gap-0 overflow-hidden p-0 sm:max-w-none">
        <style>{wallArtFontFaceCss}</style>
        <style>{`
          @keyframes music-video-breathe {
            0% { transform: scale(1.03); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1.03); }
          }
        `}</style>
        <SheetHeader className="border-b bg-background/95 px-5 py-2 backdrop-blur">
          <div className="flex min-w-0 items-center gap-3 pr-10">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <Video className="size-4" />
            </div>
            <div className="flex min-w-0 items-baseline gap-3">
              <SheetTitle className="shrink-0 text-xl font-black">
                Music Video Studio
              </SheetTitle>
              <SheetDescription className="truncate text-sm">
                Bind media to lyrics and preview a music video.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {emptyState ? (
          <div className="min-h-0 flex-1 bg-[#f4efe8]">{emptyState}</div>
        ) : (
          <div
            className="grid min-h-0 flex-1 overflow-hidden bg-[#f4efe8] lg:grid-cols-[220px_minmax(420px,1fr)_minmax(360px,var(--music-video-editor-width))] 2xl:grid-cols-[210px_minmax(560px,1fr)_minmax(360px,var(--music-video-editor-width))]"
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

            <aside className="relative flex min-h-0 min-w-0 flex-col border-t bg-[#fffaf5]/95 lg:border-l lg:border-t-0">
              <button
                aria-label="Resize editor panel"
                className="absolute inset-y-0 left-0 z-20 hidden w-3 -translate-x-1/2 cursor-col-resize items-center justify-center rounded-full text-rose-500 transition hover:bg-rose-100/70 lg:flex"
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
                <span className="h-12 w-1 rounded-full bg-rose-300/80 shadow-sm" />
              </button>

              <div className="m-3 mb-0 flex shrink-0 items-center justify-between gap-3 rounded-xl border border-rose-100 bg-white/80 px-3 py-2">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-500">
                    Smart Editor
                  </p>
                  <p className="text-sm font-black text-foreground">
                    {activeTemplate === "minimal-vinyl"
                      ? "Minimal Vinyl"
                      : activeTemplate === "wave-radio"
                        ? "Dynamic Wave Radio"
                        : "Photo Slideshow"}
                  </p>
                </div>
                {canOneClickMovie ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        className="shrink-0 rounded-full bg-rose-500 px-4 text-sm font-black text-white shadow-sm shadow-rose-500/20 hover:bg-rose-600"
                        size="sm"
                        type="button"
                      >
                        <Wand2 className="size-4" />
                        Auto Movie
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="border-rose-100">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Auto Movie</AlertDialogTitle>
                        <AlertDialogDescription>
                          Uploaded media assets will be distributed across the
                          song at lyric change points, and transition animations
                          will be chosen at random. Current manual media
                          bindings and transition settings will be replaced.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-rose-500 text-white hover:bg-rose-600"
                          onClick={handleOneClickMovie}
                        >
                          Apply
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <Badge className="shrink-0 capitalize" variant="secondary">
                    {renderStatus === "idle" ? "Ready" : renderStatus}
                  </Badge>
                )}
              </div>

              {activeTemplate === "minimal-vinyl" ? (
                <div className="min-h-0 flex-1 p-3">
                  <MinimalVinylEditor
                    lyricsStyle={lyricsStyle}
                    onChangeLyricsStyle={handleChangeLyricsStyle}
                  />
                </div>
              ) : activeTemplate === "wave-radio" ? (
                <div className="min-h-0 flex-1 p-3">
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
                <div className="grid min-h-0 flex-1 grid-cols-[104px_minmax(0,1fr)] gap-3 p-3">
                  <PhotoMediaRail
                    media={visibleMedia}
                    selectedPhotoId={selectedPhotoId}
                    onRemovePhoto={handleRemovePhoto}
                    onSelectPhoto={setSelectedPhotoId}
                  />

                  <ScrollArea
                    className="min-h-0 min-w-0 overflow-y-auto rounded-xl border border-stone-200 bg-[#f8f3ec]"
                    data-music-video-editor-scroll
                    data-music-video-editor-main
                  >
                    <div className="min-h-full min-w-0 space-y-3 p-3">
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
  );
}
