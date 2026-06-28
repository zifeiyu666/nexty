"use client";

import type { RefObject } from "react";
import { useEffect } from "react";
import { toast } from "sonner";

export function useAudioPreview({
  audioRef,
  previewAudioUrl,
  previewLimitSeconds,
  onDurationChange,
  onEnded,
  onPreviewLimitReached,
  onTimeChange,
}: {
  audioRef: RefObject<HTMLAudioElement | null>;
  previewAudioUrl?: string;
  previewLimitSeconds?: number | null;
  onDurationChange: (duration: number) => void;
  onEnded: () => void;
  onPreviewLimitReached: () => void;
  onTimeChange: (time: number) => void;
}) {
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (previewLimitSeconds && audio.currentTime >= previewLimitSeconds) {
        audio.pause();
        audio.currentTime = previewLimitSeconds;
        onPreviewLimitReached();
        toast.info("This preview is limited to 1 minute.");
      }
      onTimeChange(Number(audio.currentTime.toFixed(2)));
    };
    const handleLoadedMetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        onDurationChange(audio.duration);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [
    audioRef,
    onDurationChange,
    onEnded,
    onPreviewLimitReached,
    onTimeChange,
    previewAudioUrl,
    previewLimitSeconds,
  ]);
}

export function useFocusCustomOccasionInput({
  inputRef,
  shouldFocus,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  shouldFocus: boolean;
}) {
  useEffect(() => {
    if (!shouldFocus) return;
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }, [inputRef, shouldFocus]);
}

export function useStopSpeechRecognitionOnUnmount({
  speechRecognitionRef,
}: {
  speechRecognitionRef: RefObject<any>;
}) {
  useEffect(() => {
    return () => {
      speechRecognitionRef.current?.stop?.();
    };
  }, [speechRecognitionRef]);
}
