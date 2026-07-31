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
import { RecordingSpectrum, VoiceSourceEditor } from "@/components/voice/VoiceSourceEditor";
import { Link } from "@/i18n/routing";
import { MAX_VOICE_SAMPLE_SECONDS, MAX_VOICE_SOURCE_UPLOAD_BYTES, MAX_VOICE_VERIFICATION_UPLOAD_BYTES, MIN_VOICE_SAMPLE_SECONDS } from "@/lib/voice-sample";
import {
  CircleStop,
  FileAudio,
  Loader2,
  Mic2,
  Music2,
  Plus,
  Radio,
  RotateCcw,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type Voice = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  status: string;
  verifyText: string | null;
  voiceId: string | null;
};

type UploadResult = { key: string; url: string };

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
  const response = await fetch(data.presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!response.ok) {
    voiceDebug("upload-failed", { kind, contentType: file.type, size: file.size, status: response.status });
    throw new Error("Upload failed.");
  }
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
  voiceDebug("audio-trim-started", { inputType: file.type, inputSize: file.size, start, end, selectedDuration: end - start });
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

    const trimmedFile = new File([wavBuffer], "voice-source-trimmed.wav", { type: "audio/wav" });
    voiceDebug("audio-trim-completed", { outputType: trimmedFile.type, outputSize: trimmedFile.size, selectedDuration: end - start });
    return trimmedFile;
  } catch (error) {
    voiceDebugError("audio-trim-failed", error, { inputType: file.type, inputSize: file.size, start, end });
    throw new Error("We could not trim this audio in your browser. Try a different recording or upload a WAV, MP3, or WebM file.");
  } finally {
    await context.close();
  }
}

export function VoiceLibrary() {
  const searchParams = useSearchParams();
  const [voices, setVoices] = useState<Voice[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
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
  const [image, setImage] = useState<File | null>(null);
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [verificationPreview, setVerificationPreview] = useState<string | null>(null);
  const [recordingTarget, setRecordingTarget] = useState<"source" | "verification" | null>(
    null,
  );
  const sourceRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const verificationFileRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recorderChunksRef = useRef<Blob[]>([]);
  const recorderAudioContextRef = useRef<AudioContext | null>(null);
  const recorderAnalyserRef = useRef<AnalyserNode | null>(null);

  const load = useCallback(async (silent = false) => {
    try {
      const nextVoices = await api<Voice[]>("/api/voices");
      voiceDebug("voice-list-loaded", { voiceCount: nextVoices.length, statuses: nextVoices.map((voice) => ({ id: voice.id, status: voice.status })) });
      setVoices(nextVoices);
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

  const hasProcessingVoice = voices.some(
    (voice) =>
      processingStatuses.has(voice.status) ||
      (voice.status === "awaiting_recording" && !voice.verifyText),
  );

  useEffect(() => {
    if (!hasProcessingVoice) return;
    const interval = window.setInterval(() => void load(true), 5000);
    return () => window.clearInterval(interval);
  }, [hasProcessingVoice, load]);

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

  async function setSourceRecording(file: File) {
    const nextPreview = URL.createObjectURL(file);
    try {
      const duration = await getAudioDuration(nextPreview);
      if (!Number.isFinite(duration) || duration <= 0) {
        URL.revokeObjectURL(nextPreview);
        toast.error("We could not read this audio file.");
        return;
      }
      const samples = await getWaveformSamples(file);
      voiceDebug("source-audio-ready-for-trim", { contentType: file.type, size: file.size, duration, defaultSelectionEnd: Math.min(duration, MAX_VOICE_SAMPLE_SECONDS) });
      setSource(file);
      setSourceDuration(duration);
      setSourceStart(0);
      setSourceEnd(Math.min(duration, MAX_VOICE_SAMPLE_SECONDS));
      setSourceSamples(samples);
      setSourcePreview((current) => {
        if (current) URL.revokeObjectURL(current);
        return nextPreview;
      });
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
    setSourcePreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
  }

  function setVerificationRecording(file: File) {
    setVerificationFile(file);
    setVerificationPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  }

  function resetVerification() {
    setVerificationFile(null);
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
    if (!open && recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
    setVerificationOpen(open);
  }

  function handleCreateOpenChange(open: boolean) {
    if (!open && recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
    setCreateOpen(open);
  }

  async function create() {
    if (!source || !name.trim() || !consent) {
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
      voiceDebug("voice-create-started", { sourceType: source.type, sourceSize: source.size, sourceStart, sourceEnd, selectedDuration });
      const trimmedSource = await trimAudio(source, sourceStart, sourceEnd);
      const [sourceUpload, imageUpload] = await Promise.all([
        upload(trimmedSource, "source"),
        image ? upload(image, "image") : Promise.resolve(null),
      ]);
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
      voiceDebug("voice-create-submitted", { selectedDuration, trimmedSourceSize: trimmedSource.size });
      toast.success("We are preparing your unique verification phrase.");
      setCreateOpen(false);
      setName("");
      setDescription("");
      setStyle("");
      resetSourceRecording();
      setImage(null);
      setConsent(false);
      await load();
    } catch (error) {
      voiceDebugError("voice-create-failed", error, { sourceStart, sourceEnd, selectedDuration });
      toast.error(error instanceof Error ? error.message : "Unable to create voice.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleRecording(target: "source" | "verification") {
    if (recordingTarget === target) {
      voiceDebug("recording-stop-requested", { target });
      recorderRef.current?.stop();
      return;
    }

    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      toast.error("Audio recording is not supported in this browser. Upload a recording instead.");
      return;
    }

    try {
      voiceDebug("recording-start-requested", { target });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const streamSource = audioContext.createMediaStreamSource(stream);
      streamSource.connect(analyser);
      recorderAudioContextRef.current = audioContext;
      recorderAnalyserRef.current = analyser;
      const recorder = new MediaRecorder(
        stream,
        MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? { mimeType: "audio/webm;codecs=opus" }
          : undefined,
      );
      recorderChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) recorderChunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        void recorderAudioContextRef.current?.close();
        recorderAudioContextRef.current = null;
        recorderAnalyserRef.current = null;
        setRecordingTarget(null);
        const blob = new Blob(recorderChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        if (blob.size) {
          voiceDebug("recording-completed", { target, contentType: blob.type, size: blob.size, chunkCount: recorderChunksRef.current.length });
          const file = new File(
            [blob],
            target === "source" ? "voice-source.webm" : "voice-verification.webm",
            { type: blob.type },
          );
          if (target === "source") {
            void setSourceRecording(file);
          } else {
            setVerificationRecording(file);
          }
        }
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecordingTarget(target);
      voiceDebug("recording-started", { target });
    } catch (error) {
      voiceDebugError("recording-start-failed", error, { target });
      toast.error(
        target === "source"
          ? "Microphone access is required to record your source sample."
          : "Microphone access is required to record your verification phrase.",
      );
    }
  }

  async function submitVerification() {
    if (!verificationVoice || !verificationFile) return;

    setBusy(true);
    try {
      voiceDebug("verification-recording-submit-started", { voiceId: verificationVoice.id, contentType: verificationFile.type, size: verificationFile.size });
      const recording = await upload(verificationFile, "verification");
      await api("/api/voices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          id: verificationVoice.id,
          verifyUrl: recording.url,
          verificationAudioUrl: recording.url,
          verificationAudioKey: recording.key,
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
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {voices.map((voice) => {
            const readyForRecording =
              voice.status === "awaiting_recording" && Boolean(voice.verifyText);
            const isDeleting = deletingVoiceId === voice.id;
            return (
              <article key={voice.id} className="overflow-hidden rounded-lg border bg-white shadow-sm">
                <div className="relative aspect-[16/8] bg-stone-100">
                  {voice.imageUrl ? (
                    <Image fill src={voice.imageUrl} alt={voice.name} className="object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-stone-400">
                      <Mic2 className="size-9" />
                    </div>
                  )}
                  <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold capitalize text-stone-700">
                    {statusLabel(voice)}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-bold">{voice.name}</h2>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive"
                      disabled={Boolean(deletingVoiceId) || busy}
                      onClick={() => confirmDeleteVoice(voice)}
                    >
                      {isDeleting ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                      <span className="sr-only">Delete voice</span>
                    </Button>
                  </div>
                  <p className="mt-1 min-h-10 text-sm text-muted-foreground">
                    {voice.description || "Personal custom singing voice"}
                  </p>
                  {voice.status === "ready" ? (
                    <Button asChild size="sm" className="mt-4 gap-2 rounded-full">
                      <Link href={`/create-song?customVoice=${voice.id}`}>
                        <Music2 className="size-3.5" /> Create a song
                      </Link>
                    </Button>
                  ) : readyForRecording ? (
                    <Button
                      size="sm"
                      className="mt-4 gap-2 rounded-full"
                      disabled={busy}
                      onClick={() => openVerification(voice)}
                    >
                      <Mic2 className="size-3.5" /> Verify my voice
                    </Button>
                  ) : voice.status === "failed" ? (
                    <div className="mt-4">
                      <p className="text-xs font-medium text-destructive">
                        Verification could not be completed. You can retry with the same source audio.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3 gap-2 rounded-full"
                        disabled={busy || Boolean(retryingVoiceId)}
                        onClick={() => void retryVoice(voice)}
                      >
                        {retryingVoiceId === voice.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="size-3.5" />
                        )}
                        Retry verification
                      </Button>
                    </div>
                  ) : (
                    <p className="mt-4 text-xs font-medium text-primary">
                      {voice.status === "creating"
                        ? "Your voice is being created. This card will update automatically."
                        : "Preparing your verification phrase. This card will update automatically."}
                    </p>
                  )}
                </div>
              </article>
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
                  <Button
                    type="button"
                    variant={recordingTarget === "source" ? "destructive" : "default"}
                    onClick={() => toggleRecording("source")}
                    disabled={busy}
                  >
                    {recordingTarget === "source" ? (
                      <CircleStop className="size-4" />
                    ) : (
                      <Mic2 className="size-4" />
                    )}
                    {recordingTarget === "source"
                      ? "Stop recording"
                      : source
                        ? "Record again"
                        : "Start recording"}
                  </Button>
                  {source && recordingTarget !== "source" && (
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
                {recordingTarget === "source" && (
                  <RecordingSpectrum active analyser={recorderAnalyserRef.current} />
                )}
                {sourcePreview && recordingTarget !== "source" && (
                  <VoiceSourceEditor
                    duration={sourceDuration}
                    end={sourceEnd}
                    samples={sourceSamples}
                    start={sourceStart}
                    url={sourcePreview}
                    onEndChange={setSourceEnd}
                    onStartChange={setSourceStart}
                  />
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Cover image (optional)</Label>
              <input ref={imageRef} className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setImage(event.target.files?.[0] || null)} />
              <Button type="button" variant="outline" className="justify-start gap-2" onClick={() => imageRef.current?.click()}>
                <Upload className="size-4" /> {image?.name || "Upload image"}
              </Button>
            </div>
            <label className="flex items-start gap-3 rounded-md border bg-stone-50 p-3 text-sm">
              <Checkbox checked={consent} onCheckedChange={(checked) => setConsent(checked === true)} />
              <span><ShieldCheck className="mr-1 inline size-4 text-primary" />I own this voice or have explicit permission to create and use this voice model.</span>
            </label>
            <Button className="gap-2" disabled={busy} onClick={create}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Mic2 className="size-4" />}
              Prepare verification phrase
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
                <Button
                  type="button"
                  variant={recordingTarget === "verification" ? "destructive" : "default"}
                  onClick={() => toggleRecording("verification")}
                  disabled={busy}
                >
                  {recordingTarget === "verification" ? <CircleStop className="size-4" /> : <Mic2 className="size-4" />}
                  {recordingTarget === "verification" ? "Stop recording" : verificationFile ? "Record again" : "Start recording"}
                </Button>
                {verificationFile && recordingTarget !== "verification" && (
                  <Button type="button" variant="outline" onClick={resetVerification} disabled={busy}>
                    <RotateCcw className="size-4" /> Discard recording
                  </Button>
                )}
              </div>
              {recordingTarget === "verification" && <p className="mt-3 text-sm font-medium text-destructive">Recording in progress. Read the phrase aloud now.</p>}
              {verificationPreview && recordingTarget !== "verification" && (
                <audio className="mt-4 w-full" controls src={verificationPreview} />
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium text-muted-foreground">OR</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <FileAudio className="size-5 text-muted-foreground" />
                <div><p className="text-sm font-semibold">Upload a recording</p><p className="text-xs text-muted-foreground">It must contain the exact phrase above.</p></div>
              </div>
              <input ref={verificationFileRef} className="hidden" type="file" accept="audio/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) setVerificationRecording(file); event.currentTarget.value = ""; }} />
              <Button type="button" variant="outline" size="sm" onClick={() => verificationFileRef.current?.click()} disabled={busy || recordingTarget === "verification"}>
                <Upload className="size-4" /> Upload audio
              </Button>
            </div>
            <Button className="gap-2" disabled={!verificationFile || busy || recordingTarget === "verification"} onClick={submitVerification}>
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
