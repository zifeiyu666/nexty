"use client";

import ProviderBadge from "@/components/ai-demo/shared/ProviderBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Film, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

interface VideoResultAreaProps {
  taskId: string | null;
  videoUrl: string | null;
  loading?: boolean;
  provider?: string;
  modelName?: string;
  onComplete: (result: { videoUrl: string }) => void;
  onError: (error: string) => void;
  pollInterval?: number;
}

export default function VideoResultArea({
  taskId,
  videoUrl,
  loading,
  provider,
  modelName,
  onComplete,
  onError,
  pollInterval = 3000,
}: VideoResultAreaProps) {
  const t = useTranslations("AIDemo.video");
  const [elapsed, setElapsed] = useState(0);
  const [generationTime, setGenerationTime] = useState<number | undefined>();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // TODO [Polling Reduction]: Polling every 3 seconds creates constant HTTP traffic,
  //   especially for long video jobs (2–5 minutes). Consider these alternatives:
  //   1. Exponential backoff: start at 3s, increase to 10s after 30s, cap at 30s.
  //   2. Server-Sent Events (SSE): the status API route emits events when status changes.
  //   3. Task history page: let users navigate away; they check results from a dashboard
  //      page that queries the database. See TODO in app/api/ai-demo/video/status/route.ts.

  // Polling logic (absorbed from TaskStatusBar)
  useEffect(() => {
    if (!taskId) return;

    startTimeRef.current = Date.now();
    setElapsed(0);
    setGenerationTime(undefined);

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
          onError(json.error || "Task not found");
          return;
        }

        const task = json.data;

        if (task.status === "succeeded" && task.videoUrl) {
          clearInterval(intervalRef.current!);
          clearInterval(timerRef.current!);
          const time = (Date.now() - startTimeRef.current) / 1000;
          setGenerationTime(time);
          onComplete({ videoUrl: task.videoUrl });
        } else if (task.status === "failed") {
          clearInterval(intervalRef.current!);
          clearInterval(timerRef.current!);
          onError(task.error || t("videoFailed"));
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
  }, [taskId, pollInterval, onComplete, onError, t]);

  // Reset elapsed when not loading
  useEffect(() => {
    if (!loading && !taskId) {
      setElapsed(0);
    }
  }, [loading, taskId]);

  const handleDownload = useCallback(() => {
    if (!videoUrl) return;
    // TODO [Download - Presigned URL]: When videoUrl is an R2 URL (after implementing
    //   the R2 save step in webhook handlers), use presigned download for better security:
    //   import { downloadFileFromUrl } from "@/lib/cloudflare/r2-download";
    //   downloadFileFromUrl(videoUrl, "user");
    //
    //   If the R2 bucket is public, the direct URL below works for CORS-allowed origins.
    //   Use presigned downloads when the bucket is private or for access-controlled assets.
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = "generated-video.mp4";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [videoUrl]);

  // Loading state
  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="p-4 h-full flex flex-col items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            </div>
            <div>
              <p className="font-semibold text-lg">{t("generating")}</p>
              <p className="text-sm text-muted-foreground mt-1 tabular-nums">
                {elapsed}s
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!videoUrl) {
    return (
      <Card className="h-full">
        <CardContent className="p-4 h-full flex flex-col items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center justify-center text-center gap-3">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <Film className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <div>
              <p className="font-semibold text-lg">{t("emptyStateTitle")}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("emptyState")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Result state
  return (
    <Card className="h-full">
      <CardContent className="p-4 h-full flex flex-col">
        {/* Video */}
        <div className="relative flex-1 min-h-[400px] flex items-center justify-center bg-black rounded-md overflow-hidden">
          <video
            src={videoUrl}
            controls
            autoPlay
            loop
            className="max-h-full max-w-full rounded-md"
          />
        </div>

        {/* Metadata bar */}
        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {provider && <ProviderBadge provider={provider} />}
            {modelName && <span>{modelName}</span>}
            {generationTime !== undefined && (
              <span className="tabular-nums">
                {t("generationTime", {
                  time: generationTime.toFixed(1),
                })}
              </span>
            )}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            className="h-7 text-xs"
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            {t("download")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
