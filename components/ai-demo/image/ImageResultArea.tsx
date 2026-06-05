"use client";

import ProviderBadge from "@/components/ai-demo/shared/ProviderBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { downloadBase64File } from "@/lib/downloadFile";
import { Check, Copy, Download, Loader2, Palette } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ImageResultAreaProps {
  imageUrl: string | null;
  loading?: boolean;
  provider?: string;
  modelName?: string;
  generationTime?: number; // seconds
  prompt?: string;
}

export default function ImageResultArea({
  imageUrl,
  loading,
  provider,
  modelName,
  generationTime,
  prompt,
}: ImageResultAreaProps) {
  const t = useTranslations("AIDemo.image");
  const [copied, setCopied] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Live elapsed timer during generation
  useEffect(() => {
    if (!loading) {
      setElapsed(0);
      return;
    }
    setElapsed(0);
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [loading]);

  const handleDownload = () => {
    if (!imageUrl) return;
    // TODO [Download - R2 URL vs Base64]: Once the API route saves generated images
    //   to R2 (see TODO in app/api/ai-demo/image/route.ts), imageUrl will be an R2 URL
    //   instead of a base64 data URI. Replace downloadBase64File with downloadFileFromUrl():
    //   import { downloadFileFromUrl } from "@/lib/cloudflare/r2-download";
    //   downloadFileFromUrl(imageUrl, "user"); // or "public" for unauthenticated users
    //
    // For now (base64 output), the current downloadBase64File() works correctly.
    const mimeMatch = imageUrl.match(/^data:image\/(\w+)/);
    const ext = mimeMatch?.[1] === "jpeg" ? "jpg" : mimeMatch?.[1] || "png";
    downloadBase64File(imageUrl, `generated-image.${ext}`);
  };

  const handleCopyPrompt = async () => {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
  if (!imageUrl) {
    return (
      <Card className="h-full">
        <CardContent className="p-4 h-full flex flex-col items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center justify-center text-center gap-3">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <Palette className="h-8 w-8 text-muted-foreground/50" />
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

  return (
    <Card className="h-full">
      <CardContent className="p-4 h-full flex flex-col">
        {/* Image */}
        <div className="relative flex-1 min-h-[400px]">
          <Image
            src={imageUrl}
            alt="Generated image"
            className="rounded-md object-contain"
            fill
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

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {prompt && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyPrompt}
                className="h-7 text-xs"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 mr-1" />
                ) : (
                  <Copy className="h-3.5 w-3.5 mr-1" />
                )}
                {copied ? t("promptCopied") : t("copyPrompt")}
              </Button>
            )}
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
        </div>
      </CardContent>
    </Card>
  );
}
