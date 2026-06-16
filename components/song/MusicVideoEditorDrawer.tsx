"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import {
  buildPhotoSlideshowTimeline,
  buildLyricCuesFromAlignedWords,
  findActiveCue,
  parseTimestampedLyrics,
  resolveCuePhotos,
  type AlignedLyricWord,
  type MusicVideoTimeline,
  type PhotoAssignment,
  type UploadedPhoto,
} from "@/lib/music-video/photo-slideshow";
import { cn } from "@/lib/utils";
import {
  Check,
  Clapperboard,
  Film,
  ImagePlus,
  Images,
  Music2,
  Pause,
  Play,
  Radio,
  Sparkles,
  Trash2,
  UploadCloud,
  Video,
  Wand2,
  Waves,
} from "lucide-react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

type MusicVideoEditorDrawerProps = {
  audioUrl: string;
  duration?: number | null;
  imageUrl?: string | null;
  lyrics: string;
  songTitle: string;
  timestampedLyrics?: {
    alignedWords: AlignedLyricWord[];
  } | null;
  trigger: ReactNode;
};

type TemplateId = "photo-slideshow" | "minimal-vinyl" | "wave-radio";

type TemplateCard = {
  id: TemplateId;
  title: string;
  description: string;
  icon: typeof Images;
  status: "available" | "coming-soon";
};

const templates: TemplateCard[] = [
  {
    id: "photo-slideshow",
    title: "Photo Stream Memory Slideshow",
    description: "Warm lyric-led photos, glass blur, soft breathing motion.",
    icon: Images,
    status: "available",
  },
  {
    id: "minimal-vinyl",
    title: "Minimal Vinyl Record",
    description: "A quiet record sleeve scene for album-style music stories.",
    icon: Music2,
    status: "coming-soon",
  },
  {
    id: "wave-radio",
    title: "Dynamic Wave Radio",
    description: "Audio-reactive waves and captions for a broadcast mood.",
    icon: Radio,
    status: "coming-soon",
  },
];

const DEFAULT_DURATION = 30;
const MAX_PHOTO_BYTES = 12 * 1024 * 1024;

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
    name: file.name,
    objectUrl: URL.createObjectURL(file),
  };
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
                <div className="relative aspect-[4/5]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_18%,#fee2e2_0_18%,transparent_19%),linear-gradient(160deg,#fb7185_0%,#f8fafc_42%,#292524_43%,#0c0a09_100%)]" />
                  <div className="absolute inset-x-4 bottom-5 space-y-2">
                    <div className="h-16 rounded-lg bg-white/18 shadow-xl backdrop-blur" />
                    <div className="h-2 w-3/4 rounded-full bg-white/65" />
                    <div className="h-2 w-1/2 rounded-full bg-white/35" />
                  </div>
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
                  <Badge className="px-1.5 py-0 text-[10px]" variant="secondary">
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

function PhotoSlideshowPreview({
  audioUrl,
  currentPhotoUrl,
  currentTime,
  duration,
  isPlaying,
  lyricText,
  onLoadedDuration,
  onPause,
  onPlay,
  onTimeChange,
  songTitle,
}: {
  audioUrl: string;
  currentPhotoUrl?: string | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  lyricText: string;
  onLoadedDuration: (duration: number) => void;
  onPause: () => void;
  onPlay: () => void;
  onTimeChange: (time: number) => void;
  songTitle: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progress = duration ? Math.min(currentTime / duration, 1) * 100 : 0;

  function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      onPause();
      return;
    }

    audio
      .play()
      .then(onPlay)
      .catch(() => {
        onPause();
        toast.error("Unable to play this audio preview.");
      });
  }

  return (
    <section className="flex min-h-0 flex-col bg-[#f4efe8] px-4 py-4">
      <audio
        ref={audioRef}
        preload="metadata"
        src={audioUrl}
        onEnded={onPause}
        onLoadedMetadata={(event) => {
          const nextDuration = event.currentTarget.duration;
          if (Number.isFinite(nextDuration) && nextDuration > 0) {
            onLoadedDuration(nextDuration);
          }
        }}
        onTimeUpdate={(event) => onTimeChange(event.currentTarget.currentTime)}
      />

      <div className="flex shrink-0 items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-500">
            Live Preview
          </p>
          <h3 className="text-lg font-black text-foreground">{songTitle}</h3>
        </div>
        <Button
          className="rounded-full bg-[#1f1a17] text-white hover:bg-[#332b26]"
          type="button"
          onClick={togglePlayback}
        >
          {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
          {isPlaying ? "Pause" : "Play"}
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center py-4">
        <div className="relative aspect-[9/16] h-full max-h-[min(72vh,760px)] min-h-[420px] overflow-hidden rounded-[34px] border-[10px] border-[#171412] bg-[#171412] shadow-2xl shadow-black/25">
          <div className="absolute inset-0 rounded-[24px] bg-black">
            {currentPhotoUrl ? (
              <>
                <img
                  key={`${currentPhotoUrl}-blur`}
                  alt=""
                  className="absolute inset-0 size-full scale-110 object-cover opacity-50 blur-2xl"
                  src={currentPhotoUrl}
                />
                <img
                  key={currentPhotoUrl}
                  alt="Selected slideshow frame"
                  className={cn(
                    "absolute inset-0 size-full object-cover",
                    isPlaying
                      ? "animate-[music-video-breathe_7s_ease-in-out_infinite]"
                      : "scale-[1.03]",
                  )}
                  src={currentPhotoUrl}
                />
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[linear-gradient(160deg,#3f2d2d,#111827_48%,#0c0a09)] px-8 text-center text-white">
                <Sparkles className="size-10 text-rose-200" />
                <p className="mt-4 text-sm font-bold leading-6">
                  Upload photos to begin the slideshow preview.
                </p>
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/55 to-transparent px-5 pb-8 pt-24">
              <div className="rounded-2xl border border-white/15 bg-white/12 p-4 text-white shadow-xl backdrop-blur-md">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">
                  {formatTime(currentTime)}
                </p>
                <p className="mt-1 text-xl font-black leading-tight">
                  {lyricText}
                </p>
              </div>
            </div>
          </div>
          <div className="absolute left-1/2 top-2 h-1.5 w-16 -translate-x-1/2 rounded-full bg-white/20" />
        </div>
      </div>

      <div className="shrink-0">
        <div className="h-2 overflow-hidden rounded-full bg-white shadow-inner">
          <div
            className="h-full rounded-full bg-rose-500 transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs font-bold text-stone-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </section>
  );
}

function PhotoUploadPool({
  photos,
  selectedPhotoId,
  onDropPhotos,
  onRemovePhoto,
  onSelectPhoto,
}: {
  photos: UploadedPhoto[];
  selectedPhotoId: string | null;
  onDropPhotos: (files: File[]) => void;
  onRemovePhoto: (photo: UploadedPhoto) => void;
  onSelectPhoto: (photoId: string) => void;
}) {
  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxSize: MAX_PHOTO_BYTES,
    multiple: true,
    onDrop: onDropPhotos,
    onDropRejected: () => {
      toast.error("Please upload JPG, PNG, or WebP images under 12MB.");
    },
  });

  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-black text-foreground">
          <ImagePlus className="size-4" />
          Photo Upload
        </div>
        <Badge variant="secondary">{photos.length} photos</Badge>
      </div>
      <div
        {...getRootProps()}
        className={cn(
          "mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed bg-white/70 px-4 py-5 text-center transition",
          isDragActive
            ? "border-rose-400 bg-rose-50"
            : "border-stone-300 hover:border-rose-300 hover:bg-white",
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="size-8 text-rose-500" />
        <p className="mt-2 text-sm font-bold text-foreground">
          Drag photos here or click to upload
        </p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Drop 5-10 memory photos. Drag thumbnails onto lyric slots below.
        </p>
      </div>

      {photos.length > 0 ? (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-lg border bg-muted text-left transition",
                selectedPhotoId === photo.id
                  ? "border-rose-500 ring-2 ring-rose-200"
                  : "border-stone-200 hover:border-rose-300",
              )}
              draggable
              title={photo.name}
              onDragStart={(event) => {
                event.dataTransfer.setData("text/plain", photo.id);
                event.dataTransfer.effectAllowed = "copy";
              }}
            >
              <button
                className="size-full text-left"
                title={photo.name}
                type="button"
                onClick={() => onSelectPhoto(photo.id)}
              >
                <img
                  alt={photo.name}
                  className="size-full object-cover"
                  src={photo.objectUrl}
                />
              </button>
              <span className="absolute left-1 top-1 rounded-full bg-black/65 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {index + 1}
              </span>
              {selectedPhotoId === photo.id ? (
                <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-rose-500 text-white">
                  <Check className="size-3" />
                </span>
              ) : null}
              <button
                aria-label={`Remove ${photo.name}`}
                className="absolute bottom-1 right-1 flex size-6 items-center justify-center rounded-full bg-black/65 text-white opacity-0 transition group-hover:opacity-100"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onRemovePhoto(photo);
                }}
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function LyricPhotoTimeline({
  assignments,
  cues,
  photos,
  resolvedPhotoByCueId,
  selectedPhotoId,
  onAssignPhoto,
  onSelectPhoto,
}: {
  assignments: PhotoAssignment[];
  cues: ReturnType<typeof parseTimestampedLyrics>;
  photos: UploadedPhoto[];
  resolvedPhotoByCueId: Map<string, UploadedPhoto | null>;
  selectedPhotoId: string | null;
  onAssignPhoto: (cueId: string, photoId: string) => void;
  onSelectPhoto: (photoId: string) => void;
}) {
  return (
    <section className="mt-5 flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-black text-foreground">
          <Film className="size-4" />
          Lyrics Storyline
        </div>
        <Badge variant="secondary">{cues.length} cues</Badge>
      </div>

      <ScrollArea className="mt-3 min-h-0 flex-1 pr-3">
        <div className="space-y-2 pb-4">
          {cues.map((cue) => {
            const assignedPhotoId = getAssignedPhotoId(assignments, cue.id);
            const resolvedPhoto = resolvedPhotoByCueId.get(cue.id) ?? null;

            return (
              <div
                key={cue.id}
                className="grid grid-cols-[minmax(0,1fr)_92px] gap-3 rounded-xl border border-stone-200 bg-white/80 p-3 shadow-sm"
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
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-rose-500">
                    <span>{formatTime(cue.start)}</span>
                    <span className="text-stone-300">-</span>
                    <span>{formatTime(cue.end)}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-foreground">
                    {cue.text}
                  </p>
                  <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                    {assignedPhotoId
                      ? "Pinned photo for this lyric"
                      : resolvedPhoto
                        ? "Inherits previous photo"
                        : "Waiting for photo"}
                  </p>
                </div>

                <div className="min-w-0 space-y-2">
                  <Select
                    value={assignedPhotoId ?? ""}
                    onValueChange={(photoId) => onAssignPhoto(cue.id, photoId)}
                  >
                    <SelectTrigger
                      aria-label={`Select photo for lyric ${cue.text}`}
                      className="h-8 w-full rounded-lg bg-white px-2 text-xs"
                      disabled={photos.length === 0}
                    >
                      <SelectValue placeholder="Photo" />
                    </SelectTrigger>
                    <SelectContent>
                      {photos.map((photo) => (
                        <SelectItem key={photo.id} value={photo.id}>
                          {photo.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

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
                      <img
                        alt={resolvedPhoto.name}
                        className="size-full object-cover"
                        src={resolvedPhoto.objectUrl}
                      />
                    ) : (
                      <span className="flex size-full items-center justify-center px-2 text-center text-[11px] font-bold text-stone-400">
                        Drop photo
                      </span>
                    )}
                    {assignedPhotoId ? (
                      <span className="absolute bottom-1 left-1 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        Set
                      </span>
                    ) : null}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </section>
  );
}

export function MusicVideoEditorDrawer({
  audioUrl,
  duration,
  imageUrl,
  lyrics,
  songTitle,
  timestampedLyrics,
  trigger,
}: MusicVideoEditorDrawerProps) {
  const [activeTemplate, setActiveTemplate] =
    useState<TemplateId>("photo-slideshow");
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [assignments, setAssignments] = useState<PhotoAssignment[]>([]);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerDuration, setPlayerDuration] = useState(
    duration && duration > 0 ? duration : DEFAULT_DURATION,
  );
  const photosRef = useRef<UploadedPhoto[]>([]);

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
  const resolvedCuePhotos = useMemo(
    () =>
      resolveCuePhotos({
        cues,
        photos,
        assignments,
        fallbackImageUrl: imageUrl,
      }),
    [assignments, cues, imageUrl, photos],
  );
  const resolvedPhotoByCueId = useMemo(
    () =>
      new Map(
        resolvedCuePhotos.map((item) => [item.cue.id, item.photo] as const),
      ),
    [resolvedCuePhotos],
  );
  const activeCue = findActiveCue(cues, currentTime) ?? cues[0] ?? null;
  const currentPhoto = activeCue
    ? (resolvedPhotoByCueId.get(activeCue.id) ?? null)
    : null;
  const selectedPhoto = selectedPhotoId
    ? photos.find((photo) => photo.id === selectedPhotoId)
    : null;

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    return () => {
      for (const photo of photosRef.current) {
        URL.revokeObjectURL(photo.objectUrl);
      }
    };
  }, []);

  function handleDropPhotos(files: File[]) {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      toast.error("Please upload image files.");
      return;
    }

    const nextPhotos = imageFiles.map(createUploadedPhoto);
    setPhotos((currentPhotos) => [...currentPhotos, ...nextPhotos]);
    setSelectedPhotoId((current) => current ?? nextPhotos[0]?.id ?? null);
    toast.success(`${nextPhotos.length} photo(s) added to the MV pool.`);
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

  function handleRenderMv() {
    if (photos.length === 0) {
      toast.error("Upload at least one photo before rendering this MV.");
      return;
    }

    const timeline: MusicVideoTimeline = buildPhotoSlideshowTimeline({
      songTitle,
      audioUrl,
      duration: playerDuration,
      lyrics,
      photos,
      assignments,
      timestampedLyrics,
    });

    console.info("Music video render payload", timeline);
    toast.success("Render MV payload is ready.", {
      description: "Cloud rendering will use this timeline in the next step.",
    });
  }

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-screen max-w-none gap-0 overflow-hidden p-0 sm:max-w-none">
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
                Bind photos to lyrics and preview a vertical music video.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="grid min-h-0 flex-1 overflow-hidden bg-[#f4efe8] lg:grid-cols-[230px_minmax(0,1fr)_390px]">
          <TemplateRail
            activeTemplate={activeTemplate}
            onSelectTemplate={(template) => {
              if (template.status === "coming-soon") {
                toast.info(`${template.title} is coming soon.`);
                return;
              }
              setActiveTemplate(template.id);
            }}
          />

          <PhotoSlideshowPreview
            audioUrl={audioUrl}
            currentPhotoUrl={currentPhoto?.objectUrl ?? null}
            currentTime={currentTime}
            duration={playerDuration}
            isPlaying={isPlaying}
            lyricText={activeCue?.text ?? "Instrumental"}
            onLoadedDuration={setPlayerDuration}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onTimeChange={setCurrentTime}
            songTitle={songTitle}
          />

          <aside className="flex min-h-0 flex-col border-t bg-[#fffaf5]/95 lg:border-l lg:border-t-0">
            <div className="m-3 mb-0 flex shrink-0 items-center justify-between gap-3 rounded-xl border border-rose-100 bg-white/80 px-3 py-2">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-500">
                  Smart Editor
                </p>
                <p className="text-sm font-black text-foreground">
                  Photo Slideshow
                </p>
              </div>
              <Button
                className="rounded-full bg-rose-500 text-white hover:bg-rose-600"
                size="sm"
                type="button"
                onClick={handleRenderMv}
              >
                <Wand2 className="size-4" />
                Render MV
              </Button>
            </div>

            <ScrollArea
              className="min-h-0 flex-1 overflow-y-auto"
              data-music-video-editor-scroll
            >
              <div className="p-3">
                <div className="min-h-full rounded-xl border border-stone-200 bg-[#f8f3ec] p-3">
                  <PhotoUploadPool
                    photos={photos}
                    selectedPhotoId={selectedPhotoId}
                    onDropPhotos={handleDropPhotos}
                    onRemovePhoto={handleRemovePhoto}
                    onSelectPhoto={setSelectedPhotoId}
                  />

                  {selectedPhoto ? (
                    <div className="mt-3 flex items-center gap-2 rounded-lg border border-rose-100 bg-white px-3 py-2 text-xs font-bold text-stone-600">
                      <Waves className="size-4 text-rose-500" />
                      Selected: {selectedPhoto.name}
                    </div>
                  ) : null}

                  <LyricPhotoTimeline
                    assignments={assignments}
                    cues={cues}
                    photos={photos}
                    resolvedPhotoByCueId={resolvedPhotoByCueId}
                    selectedPhotoId={selectedPhotoId}
                    onAssignPhoto={handleAssignPhoto}
                    onSelectPhoto={setSelectedPhotoId}
                  />
                </div>
              </div>
            </ScrollArea>
          </aside>
        </div>
      </SheetContent>
    </Sheet>
  );
}
