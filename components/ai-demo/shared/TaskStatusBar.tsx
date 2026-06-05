"use client";

import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface TaskStatusBarProps {
  taskId: string | null;
  pollInterval?: number;
  onComplete: (result: { videoUrl: string }) => void;
  onError: (error: string) => void;
}

export default function TaskStatusBar({
  taskId,
  pollInterval = 3000,
  onComplete,
  onError,
}: TaskStatusBarProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!taskId) {
      setStatus(null);
      setElapsed(0);
      return;
    }

    startTimeRef.current = Date.now();
    setStatus("pending");
    setElapsed(0);

    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    const poll = async () => {
      try {
        const res = await fetch(`/api/ai-demo/video/status?taskId=${taskId}`);
        const json = await res.json();

        if (!json.success) {
          clearInterval(intervalRef.current!);
          clearInterval(timerRef.current!);
          setStatus("failed");
          onError(json.error || "Task not found");
          return;
        }

        const task = json.data;
        setStatus(task.status);

        if (task.status === "succeeded" && task.videoUrl) {
          clearInterval(intervalRef.current!);
          clearInterval(timerRef.current!);
          onComplete({ videoUrl: task.videoUrl });
        } else if (task.status === "failed") {
          clearInterval(intervalRef.current!);
          clearInterval(timerRef.current!);
          onError(task.error || "Video generation failed");
        }
      } catch {
        // Continue polling on network errors
      }
    };

    poll();
    intervalRef.current = setInterval(poll, pollInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [taskId, pollInterval, onComplete, onError]);

  if (!taskId || !status) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      {(status === "pending" || status === "processing") && (
        <>
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm">
            Generating video... {formatTime(elapsed)}
          </span>
        </>
      )}
      {status === "succeeded" && (
        <>
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-sm text-green-600 dark:text-green-400">
            Video generated successfully!
          </span>
        </>
      )}
      {status === "failed" && (
        <>
          <XCircle className="h-5 w-5 text-destructive" />
          <span className="text-sm text-destructive">
            Video generation failed
          </span>
        </>
      )}
    </div>
  );
}
