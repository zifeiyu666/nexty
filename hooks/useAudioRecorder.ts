"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type AudioRecorderOptions = {
  fileName: string;
  maxDurationMs?: number;
  onComplete: (file: File) => void | Promise<void>;
  onError?: (error: unknown) => void;
};

function preferredRecorderOptions(): MediaRecorderOptions | undefined {
  return MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
    ? { mimeType: "audio/webm;codecs=opus" }
    : undefined;
}

export function useAudioRecorder({
  fileName,
  maxDurationMs,
  onComplete,
  onError,
}: AudioRecorderOptions) {
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const completeRef = useRef(onComplete);
  const errorRef = useRef(onError);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    completeRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    errorRef.current = onError;
  }, [onError]);

  const releaseCapture = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
    void audioContextRef.current?.close();
    audioContextRef.current = null;
    startedAtRef.current = null;
    setAnalyser(null);
    setIsRecording(false);
  }, []);

  const stop = useCallback(() => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  }, []);

  const start = useCallback(async () => {
    if (recorderRef.current?.state === "recording") return;

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      errorRef.current?.(new Error("Audio recording is not supported in this browser."));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const nextAnalyser = audioContext.createAnalyser();
      nextAnalyser.fftSize = 256;
      audioContext.createMediaStreamSource(stream).connect(nextAnalyser);

      const recorder = new MediaRecorder(stream, preferredRecorderOptions());
      chunksRef.current = [];
      streamRef.current = stream;
      audioContextRef.current = audioContext;
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        releaseCapture();

        if (blob.size) {
          void completeRef.current(new File([blob], fileName, { type: blob.type }));
        }
      };

      recorder.start();
      startedAtRef.current = performance.now();
      setElapsedSeconds(0);
      timerRef.current = window.setInterval(() => {
        if (startedAtRef.current !== null) {
          setElapsedSeconds((performance.now() - startedAtRef.current) / 1000);
        }
      }, 250);
      setAnalyser(nextAnalyser);
      setIsRecording(true);

      if (maxDurationMs) {
        timeoutRef.current = window.setTimeout(stop, maxDurationMs);
      }
    } catch (error) {
      releaseCapture();
      errorRef.current?.(error);
    }
  }, [fileName, maxDurationMs, releaseCapture, stop]);

  useEffect(() => releaseCapture, [releaseCapture]);

  return { analyser, elapsedSeconds, isRecording, maxDurationSeconds: maxDurationMs ? maxDurationMs / 1000 : null, start, stop };
}
