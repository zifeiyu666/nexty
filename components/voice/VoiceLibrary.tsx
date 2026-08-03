"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LiveRecordingPanel } from "@/components/voice/LiveRecordingPanel";
import { VoiceSourceEditor } from "@/components/voice/VoiceSourceEditor";
import { MagneticSongCard } from "@/components/song/MagneticSongCard";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { Link } from "@/i18n/routing";
import { MAX_VOICE_SAMPLE_SECONDS, MAX_VOICE_SOURCE_UPLOAD_BYTES, MAX_VOICE_VERIFICATION_UPLOAD_BYTES, MIN_VOICE_SAMPLE_SECONDS } from "@/lib/voice-sample";
import {
  Loader2,
  Mic2,
  Music2,
  Pencil,
  Plus,
  Radio,
  RotateCcw,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type Voice = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  style: string | null;
  status: string;
  verifyText: string | null;
  voiceId: string | null;
};

type UploadResult = { key: string; url: string };
type UploadProgress = number | null;

const processingStatuses = new Set(["preparing_verification", "creating"]);

function voiceDebug(event: string, details: Record<string, unknown> = {}) {
  console.info("[voice-library]", event, details);
}

function voiceDebugError(event: string, error: unknown, details: Record<string, unknown> = {}) {
  console.error("[voice-library]", event, { ...details, error: error instanceof Error ? error.message : String(error) });
}

function statusLabel(voice: Voice) {
  if (voice.status === "preparing_verification") {
    return "Preparing verification";
  }
  if (voice.status === "awaiting_recording" && !voice.verifyText) {
    return "Preparing your phrase";
  }
  return voice.status.replaceAll("_", " ");
}

function isVoicePending(voice: Voice) {
  return (
    processingStatuses.has(voice.status) ||
    (voice.status === "awaiting_recording" && !voice.verifyText)
  );
}

function VoiceStatusBadge({ voice }: { voice: Voice }) {
  const isProcessing =
    processingStatuses.has(voice.status) ||
    (voice.status === "awaiting_recording" && !voice.verifyText);

  if (voice.status === "ready") {
    return (
      <span className="inline-flex items-center rounded-full border border-emerald-700/10 bg-emerald-50/95 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 shadow-sm backdrop-blur">
        Ready
      </span>
    );
  }

  if (voice.status === "failed") {
    return (
      <span className="inline-flex items-center rounded-full border border-rose-700/10 bg-rose-50/95 px-2.5 py-1 text-[11px] font-semibold text-rose-700 shadow-sm backdrop-blur">
        Verification failed
      </span>
    );
  }

  if (isProcessing) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-primary shadow-sm backdrop-blur">
        <Loader2 className="size-3 animate-spin motion-reduce:animate-none" />
        Working
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-stone-700/10 bg-white/95 px-2.5 py-1 text-[11px] font-semibold capitalize text-stone-700 shadow-sm backdrop-blur">
      {statusLabel(voice)}
    </span>
  );
}

type VoiceCardProps = {
  busy: boolean;
  deleting: boolean;
  retrying: boolean;
  voice: Voice;
  onDelete: () => void;
  onEdit: () => void;
  onRetry: () => void;
  onVerify: () => void;
};

function VoiceCard({
  busy,
  deleting,
  retrying,
  voice,
  onDelete,
  onEdit,
  onRetry,
  onVerify,
}: VoiceCardProps) {
  const readyForRecording =
    voice.status === "awaiting_recording" && Boolean(voice.verifyText);
  const isProcessing =
    processingStatuses.has(voice.status) ||
    (voice.status === "awaiting_recording" && !voice.verifyText);
  const processingTitle =
    voice.status === "creating"
      ? "Creating your singing voice"
      : "Preparing your verification phrase";
  const processingDescription =
    voice.status === "creating"
      ? "This card will update automatically when your voice is ready."
      : "This card will update automatically when your phrase is ready.";
  const deleteButton = (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="size-10 shrink-0 rounded-full bg-rose-50 text-rose-700 shadow-sm hover:bg-rose-100 hover:text-rose-800"
      disabled={Boolean(busy) || deleting}
      onClick={onDelete}
    >
      {deleting ? (
        <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
      ) : (
        <Trash2 className="size-4" />
      )}
      <span className="sr-only">Delete voice</span>
    </Button>
  );

  return (
    <MagneticSongCard className="rounded-2xl border border-[#eadbd3] bg-[#fffdfa] shadow-[0_14px_34px_rgba(74,45,32,0.08)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f4ece7]">
        {voice.imageUrl ? (
          <Image
            fill
            src={voice.imageUrl}
            alt={voice.name}
            className="object-cover transition duration-500 ease-out group-hover:scale-[1.035]"
            sizes="(min-width: 1280px) 320px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <div className="relative grid size-full place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_28%,rgba(255,255,255,0.94),transparent_24%),linear-gradient(145deg,#f8efea_0%,#f1e3dc_100%)]">
            <div className="absolute inset-x-0 bottom-0 h-2/5 bg-[linear-gradient(150deg,transparent_0_30%,rgba(224,65,50,0.08)_30%_31%,transparent_31%_58%,rgba(104,63,46,0.06)_58%_59%,transparent_59%)]" />
            <span className="relative grid size-16 place-items-center rounded-full border border-white/80 bg-white/70 text-primary shadow-[0_14px_30px_rgba(84,48,33,0.13)] backdrop-blur">
              <Mic2 className="size-7" />
            </span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),transparent_36%,rgba(49,27,18,0.08))] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]" />
        <div className="absolute right-3 top-3">
          <VoiceStatusBadge voice={voice} />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col px-4 pb-4 pt-4 sm:px-5 sm:pt-5">
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h2 className="line-clamp-1 text-lg font-semibold leading-tight text-[#2b1710] transition group-hover:text-primary">
              {voice.name}
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-8 rounded-full text-[#80685e] hover:bg-primary/10 hover:text-primary"
              disabled={busy || isProcessing}
              onClick={onEdit}
            >
              <Pencil className="size-3.5" />
              <span className="sr-only">Edit voice details</span>
            </Button>
          </div>
          <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-[#78665d]">
            {voice.description || "Personal custom singing voice"}
          </p>
        </div>

        {voice.status === "ready" ? (
          <div className="mt-5 flex items-center gap-2">
            <Button asChild className="h-10 flex-1 gap-2 rounded-full text-sm font-semibold">
              <Link href={`/create-song?customVoice=${voice.id}`}>
                <Music2 className="size-4" /> Create a song
              </Link>
            </Button>
            {deleteButton}
          </div>
        ) : readyForRecording ? (
          <div className="mt-5 flex items-center gap-2">
            <Button
              className="h-10 flex-1 gap-2 rounded-full text-sm font-semibold"
              disabled={busy}
              onClick={onVerify}
            >
              <Mic2 className="size-4" /> Verify my voice
            </Button>
            {deleteButton}
          </div>
        ) : voice.status === "failed" ? (
          <div className="mt-5 flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 flex-1 gap-2 rounded-full border-rose-200 bg-white text-sm font-semibold text-[#3d241b] hover:bg-rose-50"
                  disabled={busy || retrying}
                  onClick={onRetry}
                >
                  {retrying ? (
                    <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" />
                  ) : (
                    <RotateCcw className="size-3.5" />
                  )}
                  Retry verification
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                sideOffset={8}
                className="max-w-60 bg-[#3d241b] px-3 py-2 text-center leading-5 text-white"
              >
                Verification could not be completed. You can retry with the same source audio.
              </TooltipContent>
            </Tooltip>
            {deleteButton}
          </div>
        ) : isProcessing ? (
          <div className="mt-5 flex items-center gap-2" aria-hidden="true">
            <Button className="h-10 flex-1 gap-2 rounded-full text-sm font-semibold" disabled>
              <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
              {voice.status === "creating" ? "Creating voice" : "Preparing phrase"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-10 shrink-0 rounded-full bg-stone-100 text-stone-400"
              disabled
            >
              <Trash2 className="size-4" />
              <span className="sr-only">Delete voice</span>
            </Button>
          </div>
        ) : null}
      </div>

      {isProcessing ? (
        <div
          aria-live="polite"
          className="absolute inset-0 z-30 grid place-items-center bg-[#fffaf6]/88 p-5 text-center backdrop-blur-[3px]"
          role="status"
        >
          <div className="max-w-56">
            <span className="mx-auto grid size-11 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(224,65,50,0.24)]">
              <Loader2 className="size-5 animate-spin motion-reduce:animate-none" />
            </span>
            <p className="mt-4 text-sm font-semibold leading-5 text-[#3d241b]">{processingTitle}</p>
            <p className="mt-1 text-xs leading-5 text-[#80685e]">{processingDescription}</p>
            <div className="mt-4 flex h-5 items-end justify-center gap-1" aria-hidden="true">
              {["0ms", "120ms", "240ms", "360ms", "480ms", "600ms", "720ms"].map(
                (delay, index) => (
                  <span
                    key={delay}
                    className="w-1 rounded-full bg-primary/75 motion-reduce:animate-none"
                    style={{
                      animation: `voice-processing-wave 1s ease-in-out ${delay} infinite`,
                      height: `${8 + ((index * 5) % 10)}px`,
                    }}
                  />
                ),
              )}
            </div>
          </div>
        </div>
      ) : null}
    </MagneticSongCard>
  );
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const startedAt = performance.now();
  const method = init?.method || "GET";
  voiceDebug("api-request-started", { method, path: new URL(url, window.location.origin).pathname });
  const response = await fetch(url, init);
  const result = await response.json();

  if (!response.ok || !result.success) {
    voiceDebug("api-request-failed", { method, path: new URL(url, window.location.origin).pathname, status: response.status, elapsedMs: Math.round(performance.now() - startedAt), error: result.error || "Request failed." });
    throw new Error(result.error || "Request failed.");
  }

  voiceDebug("api-request-completed", { method, path: new URL(url, window.location.origin).pathname, status: response.status, elapsedMs: Math.round(performance.now() - startedAt) });
  return result.data;
}

async function upload(
  file: File,
  kind: "source" | "verification" | "image",
  onProgress?: (progress: number) => void,
): Promise<UploadResult> {
  const maxBytes = kind === "verification" ? MAX_VOICE_VERIFICATION_UPLOAD_BYTES : kind === "source" ? MAX_VOICE_SOURCE_UPLOAD_BYTES : 10 * 1024 * 1024;
  if (file.size > maxBytes) {
    const maxMegabytes = Math.round(maxBytes / 1024 / 1024);
    const actualMegabytes = (file.size / 1024 / 1024).toFixed(1);
    throw new Error(`${kind === "verification" ? "Verification recording" : kind === "source" ? "Source recording" : "Image"} is ${actualMegabytes}MB. The limit is ${maxMegabytes}MB.`);
  }
  voiceDebug("upload-started", { kind, contentType: file.type, size: file.size });
  const data = await api<{
    key: string;
    presignedUrl: string;
    publicObjectUrl: string;
  }>("/api/voices/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kind,
      contentType: file.type,
      fileName: file.name,
      size: file.size,
    }),
  });
  await new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", data.presignedUrl);
    request.setRequestHeader("Content-Type", file.type);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };
    request.onerror = () => reject(new Error("Upload failed."));
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        onProgress?.(100);
        resolve();
      } else {
        reject(new Error("Upload failed."));
      }
    };
    request.send(file);
  }).catch((error) => {
    voiceDebug("upload-failed", { kind, contentType: file.type, size: file.size });
    throw error;
  });
  voiceDebug("upload-completed", { kind, contentType: file.type, size: file.size, key: data.key });
  return { key: data.key, url: data.publicObjectUrl };
}

function writeWavHeader(view: DataView, frameCount: number, channels: number, sampleRate: number) {
  const byteRate = sampleRate * channels * 2;
  const blockAlign = channels * 2;
  const dataSize = frameCount * blockAlign;
  const writeString = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);
}

async function trimAudio(file: File, start: number, end: number): Promise<File> {
  const context = new AudioContext();
  try {
    const audioBuffer = await context.decodeAudioData(await file.arrayBuffer());
    const startFrame = Math.max(0, Math.floor(start * audioBuffer.sampleRate));
    const endFrame = Math.min(audioBuffer.length, Math.ceil(end * audioBuffer.sampleRate));
    const frameCount = endFrame - startFrame;
    if (frameCount <= 0) throw new Error("Choose a valid audio clip.");

    const channels = audioBuffer.numberOfChannels;
    const wavBuffer = new ArrayBuffer(44 + frameCount * channels * 2);
    const view = new DataView(wavBuffer);
    writeWavHeader(view, frameCount, channels, audioBuffer.sampleRate);
    const channelData = Array.from(
      { length: channels },
      (_, index) => audioBuffer.getChannelData(index),
    );
    let offset = 44;

    for (let frame = 0; frame < frameCount; frame += 1) {
      for (let channel = 0; channel < channels; channel += 1) {
        const sample = Math.max(-1, Math.min(1, channelData[channel][startFrame + frame]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        offset += 2;
      }
    }

    return new File([wavBuffer], "voice-source-trimmed.wav", { type: "audio/wav" });
  } finally {
    await context.close();
  }
}

export function VoiceLibrary() {
  const searchParams = useSearchParams();
  const [voices, setVoices] = useState<Voice[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [sourceTrimOpen, setSourceTrimOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingVoice, setEditingVoice] = useState<Voice | null>(null);
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [verificationVoice, setVerificationVoice] = useState<Voice | null>(null);
  const [busy, setBusy] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [voiceToDelete, setVoiceToDelete] = useState<Voice | null>(null);
  const [deletingVoiceId, setDeletingVoiceId] = useState<string | null>(null);
  const [retryingVoiceId, setRetryingVoiceId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [style, setStyle] = useState("");
  const [consent, setConsent] = useState(false);
  const [source, setSource] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [sourceDuration, setSourceDuration] = useState(0);
  const [sourceStart, setSourceStart] = useState(0);
  const [sourceEnd, setSourceEnd] = useState(0);
  const [sourceSamples, setSourceSamples] = useState<number[]>([]);
  const [sourceUpload, setSourceUpload] = useState<UploadResult | null>(null);
  const [sourceUploadProgress, setSourceUploadProgress] = useState<UploadProgress>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imageUpload, setImageUpload] = useState<UploadResult | null>(null);
  const [imageUploadProgress, setImageUploadProgress] = useState<UploadProgress>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStyle, setEditStyle] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImageUpload, setEditImageUpload] = useState<UploadResult | null>(null);
  const [editImageUploadProgress, setEditImageUploadProgress] = useState<UploadProgress>(null);
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [verificationPreview, setVerificationPreview] = useState<string | null>(null);
  const [verificationUpload, setVerificationUpload] = useState<UploadResult | null>(null);
  const [verificationUploadProgress, setVerificationUploadProgress] = useState<UploadProgress>(null);
  const sourceRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const editImageRef = useRef<HTMLInputElement>(null);
  const hasLoadedVoicesRef = useRef(false);
  const voiceStatesRef = useRef(
    new Map<string, { hasVerifyText: boolean; status: string }>(),
  );
  const openVerificationRef = useRef<(voice: Voice) => void>(() => undefined);
  openVerificationRef.current = openVerification;
  const sourceRecorder = useAudioRecorder({
    fileName: "voice-source.webm",
    onComplete: (file) => {
      voiceDebug("recording-completed", {
        target: "source",
        contentType: file.type,
        size: file.size,
      });
      void setSourceRecording(file, true);
    },
    onError: (error) => {
      voiceDebugError("recording-start-failed", error, { target: "source" });
      toast.error("Microphone access is required to record your source sample.");
    },
  });
  const verificationRecorder = useAudioRecorder({
    fileName: "voice-verification.webm",
    onComplete: (file) => {
      voiceDebug("recording-completed", {
        target: "verification",
        contentType: file.type,
        size: file.size,
      });
      void setVerificationRecording(file);
    },
    onError: (error) => {
      voiceDebugError("recording-start-failed", error, { target: "verification" });
      toast.error("Microphone access is required to record your verification phrase.");
    },
  });
  const recordingTarget = sourceRecorder.isRecording
    ? "source"
    : verificationRecorder.isRecording
      ? "verification"
      : null;

  const load = useCallback(async (silent = false) => {
    try {
      const nextVoices = await api<Voice[]>("/api/voices");
      const previousStates = voiceStatesRef.current;
      const voiceReadyForVerification = hasLoadedVoicesRef.current
        ? nextVoices.find((voice) => {
            const previous = previousStates.get(voice.id);
            const isReadyForRecording =
              voice.status === "awaiting_recording" && Boolean(voice.verifyText);

            return Boolean(
              previous &&
                isReadyForRecording &&
                (previous.status !== voice.status || !previous.hasVerifyText),
            );
          })
        : undefined;

      voiceStatesRef.current = new Map(
        nextVoices.map((voice) => [
          voice.id,
          { hasVerifyText: Boolean(voice.verifyText), status: voice.status },
        ]),
      );
      hasLoadedVoicesRef.current = true;
      voiceDebug("voice-list-loaded", { voiceCount: nextVoices.length, statuses: nextVoices.map((voice) => ({ id: voice.id, status: voice.status })) });
      setVoices(nextVoices);

      if (voiceReadyForVerification) {
        voiceDebug("verification-phrase-ready-auto-open", {
          voiceId: voiceReadyForVerification.id,
        });
        openVerificationRef.current(voiceReadyForVerification);
      }
    } catch (error) {
      voiceDebugError("voice-list-load-failed", error, { silent });
      if (!silent) {
        toast.error(error instanceof Error ? error.message : "Unable to load voices.");
      }
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (searchParams.get("create") === "1") setCreateOpen(true);
  }, [searchParams]);

  const pendingVoiceIds = useMemo(
    () => voices.filter(isVoicePending).map((voice) => voice.id),
    [voices],
  );

  const refreshPendingVoice = useCallback(async (voiceId: string) => {
    try {
      const nextVoice = await api<Voice>(`/api/voices/${voiceId}/status`);
      const previous = voiceStatesRef.current.get(nextVoice.id);
      const isReadyForRecording =
        nextVoice.status === "awaiting_recording" && Boolean(nextVoice.verifyText);

      voiceStatesRef.current.set(nextVoice.id, {
        hasVerifyText: Boolean(nextVoice.verifyText),
        status: nextVoice.status,
      });
      setVoices((current) =>
        current.map((voice) => (voice.id === nextVoice.id ? nextVoice : voice)),
      );

      if (
        previous &&
        isReadyForRecording &&
        (previous.status !== nextVoice.status || !previous.hasVerifyText)
      ) {
        voiceDebug("verification-phrase-ready-auto-open", { voiceId: nextVoice.id });
        openVerificationRef.current(nextVoice);
      }
    } catch (error) {
      voiceDebugError("voice-status-refresh-failed", error, { voiceId });
    }
  }, []);

  useEffect(() => {
    if (!pendingVoiceIds.length) return;

    const refresh = () => {
      void Promise.all(pendingVoiceIds.map(refreshPendingVoice));
    };

    const interval = window.setInterval(refresh, 5000);
    return () => window.clearInterval(interval);
  }, [pendingVoiceIds, refreshPendingVoice]);

  useEffect(
    () => () => {
      if (sourcePreview) URL.revokeObjectURL(sourcePreview);
      if (verificationPreview) URL.revokeObjectURL(verificationPreview);
    },
    [sourcePreview, verificationPreview],
  );

  async function getAudioDuration(url: string) {
    return new Promise<number>((resolve, reject) => {
      const audio = new Audio();
      audio.preload = "metadata";
      audio.onloadedmetadata = () => resolve(audio.duration);
      audio.onerror = () => reject(new Error("We could not read this audio file."));
      audio.src = url;
    });
  }

  async function getWaveformSamples(file: File) {
    try {
      const context = new AudioContext();
      const buffer = await context.decodeAudioData(await file.arrayBuffer());
      await context.close();
      const channel = buffer.getChannelData(0);
      const count = 88;
      const blockSize = Math.ceil(channel.length / count);
      const peaks = Array.from({ length: count }, (_, index) => {
        let peak = 0;
        const start = index * blockSize;
        const end = Math.min(channel.length, start + blockSize);
        for (let sampleIndex = start; sampleIndex < end; sampleIndex += 1) {
          peak = Math.max(peak, Math.abs(channel[sampleIndex] || 0));
        }
        return peak;
      });
      const maxPeak = Math.max(...peaks, 0.01);
      return peaks.map((peak) => peak / maxPeak);
    } catch {
      return Array.from({ length: 88 }, (_, index) => 0.18 + ((index * 17) % 9) / 18);
    }
  }

  async function setSourceRecording(file: File, openTrimDialog = false) {
    const nextPreview = URL.createObjectURL(file);
    try {
      const duration = await getAudioDuration(nextPreview);
      if (!Number.isFinite(duration) || duration <= 0) {
        URL.revokeObjectURL(nextPreview);
        toast.error("We could not read this audio file.");
        return;
      }
      if (duration < MIN_VOICE_SAMPLE_SECONDS) {
        URL.revokeObjectURL(nextPreview);
        voiceDebug("source-audio-too-short", {
          contentType: file.type,
          duration,
          minimumSeconds: MIN_VOICE_SAMPLE_SECONDS,
          size: file.size,
        });
        toast.error(`Recording is too short. Please record at least ${MIN_VOICE_SAMPLE_SECONDS} seconds and try again.`);
        return;
      }
      const samples = await getWaveformSamples(file);
      voiceDebug("source-audio-ready-for-trim", { contentType: file.type, size: file.size, duration, defaultSelectionEnd: Math.min(duration, MAX_VOICE_SAMPLE_SECONDS) });
      setSource(file);
      setSourceUpload(null);
      setSourceUploadProgress(null);
      setSourceDuration(duration);
      setSourceStart(0);
      setSourceEnd(Math.min(duration, MAX_VOICE_SAMPLE_SECONDS));
      setSourceSamples(samples);
      setSourcePreview((current) => {
        if (current) URL.revokeObjectURL(current);
        return nextPreview;
      });
      if (openTrimDialog) setSourceTrimOpen(true);
    } catch (error) {
      URL.revokeObjectURL(nextPreview);
      voiceDebugError("source-audio-read-failed", error, { contentType: file.type, size: file.size });
      toast.error(error instanceof Error ? error.message : "We could not read this audio file.");
    }
  }

  function resetSourceRecording() {
    setSource(null);
    setSourceDuration(0);
    setSourceStart(0);
    setSourceEnd(0);
    setSourceSamples([]);
    setSourceUpload(null);
    setSourceUploadProgress(null);
    setSourceTrimOpen(false);
    setSourcePreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
  }

  async function setVerificationRecording(file: File) {
    setVerificationFile(file);
    setVerificationUpload(null);
    setVerificationUploadProgress(0);
    setVerificationPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
    try {
      const result = await upload(file, "verification", setVerificationUploadProgress);
      setVerificationUpload(result);
    } catch (error) {
      setVerificationUploadProgress(null);
      toast.error(error instanceof Error ? error.message : "Unable to upload verification recording.");
    }
  }

  function resetVerification() {
    setVerificationFile(null);
    setVerificationUpload(null);
    setVerificationUploadProgress(null);
    setVerificationPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
  }

  function openVerification(voice: Voice) {
    if (!voice.verifyText) {
      toast.message("Your verification phrase is still being prepared.");
      return;
    }
    resetVerification();
    setVerificationVoice(voice);
    setVerificationOpen(true);
  }

  function handleVerificationOpenChange(open: boolean) {
    if (!open) verificationRecorder.stop();
    setVerificationOpen(open);
  }

  function handleCreateOpenChange(open: boolean) {
    if (!open) sourceRecorder.stop();
    setCreateOpen(open);
  }

  async function create() {
    if (!sourceUpload || !name.trim() || !consent) {
      toast.error("Add a name, a clean voice recording, and confirm authorization.");
      return;
    }
    const selectedDuration = sourceEnd - sourceStart;
    if (selectedDuration < MIN_VOICE_SAMPLE_SECONDS || selectedDuration > MAX_VOICE_SAMPLE_SECONDS) {
      toast.error(`Choose a ${MIN_VOICE_SAMPLE_SECONDS}-${MAX_VOICE_SAMPLE_SECONDS} second clip.`);
      return;
    }

    setBusy(true);
    try {
      voiceDebug("voice-create-started", { sourceStart, sourceEnd, selectedDuration });
      await api("/api/voices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          style,
          sourceAudioUrl: sourceUpload.url,
          sourceAudioKey: sourceUpload.key,
          imageUrl: imageUpload?.url,
          imageKey: imageUpload?.key,
          language: "en",
          vocalStartS: 0,
          vocalEndS: Math.ceil(selectedDuration),
          consent: true,
        }),
      });
      voiceDebug("voice-create-submitted", { selectedDuration });
      toast.success("We are preparing your unique verification phrase.");
      setCreateOpen(false);
      setName("");
      setDescription("");
      setStyle("");
      resetSourceRecording();
      setImage(null);
      setImageUpload(null);
      setImageUploadProgress(null);
      setConsent(false);
      await load();
    } catch (error) {
      voiceDebugError("voice-create-failed", error, { sourceStart, sourceEnd, selectedDuration });
      toast.error(error instanceof Error ? error.message : "Unable to create voice.");
    } finally {
      setBusy(false);
    }
  }

  function toggleRecording(target: "source" | "verification") {
    const recorder = target === "source" ? sourceRecorder : verificationRecorder;

    if (recorder.isRecording) {
      voiceDebug("recording-stop-requested", { target });
      recorder.stop();
      return;
    }

    if (sourceRecorder.isRecording || verificationRecorder.isRecording) {
      return;
    }

    voiceDebug("recording-start-requested", { target });
    void recorder.start();
  }

  async function submitVerification() {
    if (!verificationVoice || !verificationUpload) return;

    setBusy(true);
    try {
      voiceDebug("verification-recording-submit-started", { voiceId: verificationVoice.id });
      await api("/api/voices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          id: verificationVoice.id,
          verifyUrl: verificationUpload.url,
          verificationAudioUrl: verificationUpload.url,
          verificationAudioKey: verificationUpload.key,
        }),
      });
      voiceDebug("verification-recording-submitted", { voiceId: verificationVoice.id });
      toast.success("Your verification recording was submitted. Creating your voice now.");
      setVerificationOpen(false);
      resetVerification();
      await load();
    } catch (error) {
      voiceDebugError("verification-recording-submit-failed", error, { voiceId: verificationVoice.id });
      toast.error(error instanceof Error ? error.message : "Unable to submit verification.");
    } finally {
      setBusy(false);
    }
  }

  function openEditVoice(voice: Voice) {
    setEditingVoice(voice);
    setEditName(voice.name);
    setEditDescription(voice.description || "");
    setEditStyle(voice.style || "");
    setEditImage(null);
    setEditImageUpload(null);
    setEditImageUploadProgress(null);
    setEditOpen(true);
  }

  async function uploadCreateImage(file: File) {
    setImage(file);
    setImageUpload(null);
    setImageUploadProgress(0);
    try {
      const result = await upload(file, "image", setImageUploadProgress);
      setImageUpload(result);
    } catch (error) {
      setImageUploadProgress(null);
      toast.error(error instanceof Error ? error.message : "Unable to upload image.");
    }
  }

  async function uploadEditImage(file: File) {
    setEditImage(file);
    setEditImageUpload(null);
    setEditImageUploadProgress(0);
    try {
      const result = await upload(file, "image", setEditImageUploadProgress);
      setEditImageUpload(result);
    } catch (error) {
      setEditImageUploadProgress(null);
      toast.error(error instanceof Error ? error.message : "Unable to upload image.");
    }
  }

  async function uploadTrimmedSource() {
    if (!source) return;
    const selectedDuration = sourceEnd - sourceStart;
    if (selectedDuration < MIN_VOICE_SAMPLE_SECONDS || selectedDuration > MAX_VOICE_SAMPLE_SECONDS) {
      toast.error(`Choose a ${MIN_VOICE_SAMPLE_SECONDS}-${MAX_VOICE_SAMPLE_SECONDS} second clip.`);
      return;
    }

    setSourceUpload(null);
    setSourceUploadProgress(0);
    try {
      const trimmedSource = await trimAudio(source, sourceStart, sourceEnd);
      const result = await upload(trimmedSource, "source", setSourceUploadProgress);
      setSourceUpload(result);
      setSourceTrimOpen(false);
      toast.success("Voice sample uploaded.");
    } catch (error) {
      setSourceUploadProgress(null);
      toast.error(error instanceof Error ? error.message : "Unable to prepare and upload this voice sample.");
    }
  }

  async function saveVoiceDetails() {
    if (!editingVoice || !editName.trim()) {
      toast.error("Add a voice name before saving.");
      return;
    }

    setBusy(true);
    try {
      const updatedVoice = await api<Voice>(`/api/voices/${editingVoice.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          description: editDescription,
          style: editStyle,
          ...(editImageUpload
            ? { imageUrl: editImageUpload.url, imageKey: editImageUpload.key }
            : {}),
        }),
      });
      setVoices((current) =>
        current.map((voice) => (voice.id === updatedVoice.id ? updatedVoice : voice)),
      );
      setEditOpen(false);
      setEditingVoice(null);
      toast.success("Voice details updated.");
    } catch (error) {
      voiceDebugError("voice-details-update-failed", error, { voiceId: editingVoice.id });
      toast.error(error instanceof Error ? error.message : "Unable to update voice details.");
    } finally {
      setBusy(false);
    }
  }

  function confirmDeleteVoice(voice: Voice) {
    setVoiceToDelete(voice);
    setDeleteOpen(true);
  }

  async function deleteVoice() {
    if (!voiceToDelete) return;

    setDeletingVoiceId(voiceToDelete.id);
    try {
      voiceDebug("voice-delete-started", { voiceId: voiceToDelete.id });
      await api(`/api/voices?id=${encodeURIComponent(voiceToDelete.id)}`, {
        method: "DELETE",
      });
      voiceDebug("voice-delete-completed", { voiceId: voiceToDelete.id });
      toast.success("Voice deleted.");
      setDeleteOpen(false);
      setVoiceToDelete(null);
      await load(true);
    } catch (error) {
      voiceDebugError("voice-delete-failed", error, { voiceId: voiceToDelete.id });
      toast.error(error instanceof Error ? error.message : "Unable to delete voice.");
    } finally {
      setDeletingVoiceId(null);
    }
  }

  async function retryVoice(voice: Voice) {
    setRetryingVoiceId(voice.id);
    try {
      voiceDebug("voice-retry-started", { voiceId: voice.id });
      await api("/api/voices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "retry", id: voice.id }),
      });
      voiceDebug("voice-retry-submitted", { voiceId: voice.id });
      toast.success("Verification retried. We are preparing a new phrase.");
      await load();
    } catch (error) {
      voiceDebugError("voice-retry-failed", error, { voiceId: voice.id });
      toast.error(error instanceof Error ? error.message : "Unable to retry voice verification.");
    } finally {
      setRetryingVoiceId(null);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Create an authorized singing voice, verify it with a unique phrase,
          then use it in your next custom song.
        </p>
        <Button className="gap-2 rounded-full" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" /> Add voice
        </Button>
      </div>

      {voices.length ? (
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {voices.map((voice) => {
            return (
              <VoiceCard
                key={voice.id}
                busy={busy || Boolean(deletingVoiceId)}
                deleting={deletingVoiceId === voice.id}
                retrying={retryingVoiceId === voice.id}
                voice={voice}
                onDelete={() => confirmDeleteVoice(voice)}
                onEdit={() => openEditVoice(voice)}
                onRetry={() => void retryVoice(voice)}
                onVerify={() => openVerification(voice)}
              />
            );
          })}
        </div>
      ) : (
        <div className="mt-8 grid min-h-72 place-items-center rounded-lg border border-dashed bg-white text-center">
          <div>
            <Mic2 className="mx-auto size-9 text-primary" />
            <h2 className="mt-3 font-bold">Your voice library is empty</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a verified singing voice to make songs sound more like you.
            </p>
            <Button className="mt-4 gap-2 rounded-full" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" /> Add voice
            </Button>
          </div>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={handleCreateOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create your singing voice</DialogTitle>
            <DialogDescription>
              Upload a clear, solo vocal recording. We will provide a unique phrase for you to read before the voice is created.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="voice-name">Voice name</Label>
              <Input id="voice-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="My singing voice" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="voice-description">Description</Label>
              <Textarea id="voice-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Warm acoustic pop vocal" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="voice-style">Style</Label>
              <Input id="voice-style" value={style} onChange={(event) => setStyle(event.target.value)} placeholder="Pop, warm vocal" />
            </div>
            <div className="grid gap-2">
              <Label>Source recording</Label>
              <input
                ref={sourceRef}
                className="hidden"
                type="file"
                accept="audio/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void setSourceRecording(file);
                }}
              />
              <Button type="button" variant="outline" className="justify-start gap-2" onClick={() => sourceRef.current?.click()}>
                <Upload className="size-4" /> {source?.name || "Upload clean vocal recording"}
              </Button>
              <div className="rounded-lg border bg-stone-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-white p-2 text-primary shadow-sm">
                    <Radio className="size-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Or record your source sample</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Sing or speak clearly in a quiet place. You can listen back and re-record before creating the voice.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {!sourceRecorder.isRecording && (
                    <Button
                      type="button"
                      onClick={() => toggleRecording("source")}
                      disabled={busy || verificationRecorder.isRecording}
                    >
                      <Mic2 className="size-4" />
                      {source ? "Record again" : "Start recording"}
                    </Button>
                  )}
                  {source && !sourceRecorder.isRecording && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetSourceRecording}
                      disabled={busy}
                    >
                      <RotateCcw className="size-4" /> Discard recording
                    </Button>
                  )}
                </div>
                {sourceRecorder.isRecording && (
                  <LiveRecordingPanel
                    analyser={sourceRecorder.analyser}
                    description="Recording in progress. Sing or speak clearly now."
                    elapsedSeconds={sourceRecorder.elapsedSeconds}
                    onStop={sourceRecorder.stop}
                  />
                )}
                {sourcePreview && !sourceRecorder.isRecording && (
                  <p className="mt-4 text-sm font-medium text-[#80685e]">
                    {sourceUploadProgress !== null && sourceUploadProgress < 100
                      ? `Uploading selected sample: ${sourceUploadProgress}%`
                      : sourceUpload
                        ? "Selected sample uploaded and ready."
                        : "Choose the section you want to upload before creating the voice."}
                  </p>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Cover image (optional)</Label>
              <input ref={imageRef} className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadCreateImage(file); event.currentTarget.value = ""; }} />
              <Button type="button" variant="outline" className="justify-start gap-2" onClick={() => imageRef.current?.click()} disabled={imageUploadProgress !== null && imageUploadProgress < 100}>
                {imageUploadProgress !== null && imageUploadProgress < 100 ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                {imageUploadProgress !== null && imageUploadProgress < 100 ? `Uploading image: ${imageUploadProgress}%` : image?.name || "Upload image"}
              </Button>
            </div>
            <label className="flex items-start gap-3 rounded-md border bg-stone-50 p-3 text-sm">
              <Checkbox checked={consent} onCheckedChange={(checked) => setConsent(checked === true)} />
              <span><ShieldCheck className="mr-1 inline size-4 text-primary" />I own this voice or have explicit permission to create and use this voice model.</span>
            </label>
            <Button className="gap-2" disabled={busy || !sourceUpload || Boolean(image && !imageUpload)} onClick={create}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Mic2 className="size-4" />}
              Prepare verification phrase
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={sourceTrimOpen} onOpenChange={setSourceTrimOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-[#eadbd3] bg-[#fffdfa]">
          <DialogHeader>
            <DialogTitle>Choose your best voice sample</DialogTitle>
            <DialogDescription>
              Select a clean {MIN_VOICE_SAMPLE_SECONDS}-{MAX_VOICE_SAMPLE_SECONDS} second section. You can preview it before continuing.
            </DialogDescription>
          </DialogHeader>
          {sourcePreview ? (
            <div className="grid gap-4 py-2">
              <VoiceSourceEditor
                duration={sourceDuration}
                end={sourceEnd}
                samples={sourceSamples}
                start={sourceStart}
                url={sourcePreview}
                onEndChange={setSourceEnd}
                onStartChange={setSourceStart}
              />
              <Button className="gap-2" disabled={sourceUploadProgress !== null && sourceUploadProgress < 100} onClick={() => void uploadTrimmedSource()}>
                {sourceUploadProgress !== null && sourceUploadProgress < 100 ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                {sourceUploadProgress !== null && sourceUploadProgress < 100 ? `Uploading: ${sourceUploadProgress}%` : "Use and upload selection"}
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          if (!busy) {
            setEditOpen(open);
            if (!open) setEditingVoice(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit voice details</DialogTitle>
            <DialogDescription>
              Update how this voice appears in your library. Your recordings and verification stay unchanged.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-voice-name">Voice name</Label>
              <Input
                id="edit-voice-name"
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-voice-description">Description</Label>
              <Textarea
                id="edit-voice-description"
                value={editDescription}
                onChange={(event) => setEditDescription(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-voice-style">Style</Label>
              <Input
                id="edit-voice-style"
                value={editStyle}
                onChange={(event) => setEditStyle(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Cover image (optional)</Label>
              <input
                ref={editImageRef}
                className="hidden"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadEditImage(file); event.currentTarget.value = ""; }}
              />
              <Button
                type="button"
                variant="outline"
                className="justify-start gap-2"
                disabled={busy || (editImageUploadProgress !== null && editImageUploadProgress < 100)}
                onClick={() => editImageRef.current?.click()}
              >
                {editImageUploadProgress !== null && editImageUploadProgress < 100 ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                {editImageUploadProgress !== null && editImageUploadProgress < 100 ? `Uploading image: ${editImageUploadProgress}%` : editImage?.name || "Replace cover image"}
              </Button>
            </div>
            <Button className="gap-2" disabled={busy || Boolean(editImage && !editImageUpload)} onClick={saveVoiceDetails}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Pencil className="size-4" />}
              Save changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={verificationOpen} onOpenChange={handleVerificationOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Verify your voice</DialogTitle>
            <DialogDescription>
              Read the phrase below exactly as written in a quiet place. This confirms you are authorized to create this voice.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-2">
            <section className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase text-primary">
                <ShieldCheck className="size-4" /> Your verification phrase
              </div>
              <p className="mt-3 text-lg font-semibold leading-8 text-foreground">
                {verificationVoice?.verifyText}
              </p>
            </section>
            <div className="rounded-lg border bg-stone-50 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-white p-2 text-primary shadow-sm">
                  <Radio className="size-4" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Record your reading</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Speak naturally and clearly. You can listen before submitting, then record again if needed.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {!verificationRecorder.isRecording && (
                  <Button
                    type="button"
                    onClick={() => toggleRecording("verification")}
                    disabled={busy || sourceRecorder.isRecording}
                  >
                    <Mic2 className="size-4" />
                    {verificationFile ? "Record again" : "Start recording"}
                  </Button>
                )}
                {verificationFile && !verificationRecorder.isRecording && (
                  <Button type="button" variant="outline" onClick={resetVerification} disabled={busy}>
                    <RotateCcw className="size-4" /> Discard recording
                  </Button>
                )}
              </div>
              {verificationRecorder.isRecording && (
                  <LiveRecordingPanel
                    analyser={verificationRecorder.analyser}
                    description="Recording in progress. Read the phrase aloud now."
                    elapsedSeconds={verificationRecorder.elapsedSeconds}
                    onStop={verificationRecorder.stop}
                />
              )}
              {verificationPreview && !verificationRecorder.isRecording && (
                <audio className="mt-4 w-full" controls src={verificationPreview} />
              )}
              {verificationUploadProgress !== null && verificationUploadProgress < 100 ? (
                <p className="mt-3 text-sm font-medium text-primary">
                  Uploading verification recording: {verificationUploadProgress}%
                </p>
              ) : null}
            </div>
            <Button className="gap-2" disabled={!verificationUpload || busy || recordingTarget === "verification"} onClick={submitVerification}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
              Submit verification recording
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!deletingVoiceId) {
            setDeleteOpen(open);
            if (!open) setVoiceToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this voice?</AlertDialogTitle>
            <AlertDialogDescription>
              {voiceToDelete
                ? `This will permanently remove "${voiceToDelete.name}" from your voice library.`
                : "This will permanently remove this voice from your voice library."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(deletingVoiceId)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void deleteVoice();
              }}
              disabled={Boolean(deletingVoiceId)}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deletingVoiceId ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Delete voice
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
