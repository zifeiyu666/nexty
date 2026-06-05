"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { downloadBase64File } from "@/lib/downloadFile";
import { Download, ImageIcon, VideoIcon } from "lucide-react";
import Image from "next/image";

interface MediaPreviewProps {
  type: "image" | "video";
  src: string | null;
  alt?: string;
  showDownload?: boolean;
  downloadFileName?: string;
  className?: string;
  emptyText?: string;
}

function downloadVideoFromUrl(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function MediaPreview({
  type,
  src,
  alt = "Generated media",
  showDownload = true,
  downloadFileName,
  className,
  emptyText = "No result yet. Generate something!",
}: MediaPreviewProps) {
  if (!src) {
    return (
      <Card className={`h-full ${className || ""}`}>
        <CardContent className="p-4 h-full flex flex-col items-center justify-center min-h-[200px]">
          <div className="text-muted-foreground flex flex-col items-center justify-center h-full text-center gap-2">
            {type === "image" ? (
              <ImageIcon className="h-10 w-10 opacity-30" />
            ) : (
              <VideoIcon className="h-10 w-10 opacity-30" />
            )}
            <p>{emptyText}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleDownload = () => {
    if (type === "image") {
      downloadBase64File(src, downloadFileName || "generated-image.png");
    } else {
      downloadVideoFromUrl(src, downloadFileName || "generated-video.mp4");
    }
  };

  return (
    <Card className={`h-full ${className || ""}`}>
      <CardContent className="p-4 h-full flex flex-col">
        <div className="relative flex-1 min-h-[200px]">
          {type === "image" ? (
            <Image
              src={src}
              alt={alt}
              className="rounded-md object-contain"
              fill
            />
          ) : (
            <video
              src={src}
              controls
              className="w-full h-full object-contain rounded-md"
              autoPlay
              muted
              loop
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
        {showDownload && (
          <div className="flex justify-end gap-2 mt-3">
            <Button size="sm" variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
