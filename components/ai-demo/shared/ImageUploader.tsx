"use client";

import { Button } from "@/components/ui/button";
import { FileUp, X } from "lucide-react";
import Image from "next/image";
import { useCallback } from "react";
import { toast } from "sonner";

// TODO [R2 Upload - Presigned URL]: The current implementation converts files to
//   base64 data URIs and returns them via `onChange`. This is fine for demos but
//   adds significant payload size to API requests.
//
//   For production, replace base64 output with a client-side R2 upload flow:
//
//   1. Get a presigned upload URL from the server (authenticated users):
//      import { generateUserPresignedUploadUrl } from "@/actions/r2-resources";
//      const { data } = await generateUserPresignedUploadUrl({
//        fileName: file.name,
//        contentType: file.type,
//        path: "ai-inputs",
//        prefix: "upload",
//      });
//
//   2. Upload the file directly from the browser to R2 (no server round-trip):
//      await fetch(data.presignedUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
//
//   3. Return the permanent R2 public URL via onChange:
//      onChange(data.publicObjectUrl);
//
//   For unauthenticated/public use, call generatePublicPresignedUploadUrl() instead.
//   This avoids large base64 payloads and the extra server-side re-upload in kie adapters.
//
//   Add an `onUploadComplete?: (r2Url: string, r2Key: string) => void` prop alongside
//   the existing `onChange` to let parent components persist the key for later deletion.

interface ImageUploaderProps {
  value: string | null;
  onChange: (dataUri: string | null) => void;
  maxSizeMB?: number;
  accept?: string;
  disabled?: boolean;
  className?: string;
}

export default function ImageUploader({
  value,
  onChange,
  maxSizeMB = 5,
  accept = "image/png,image/jpeg,image/webp",
  disabled,
  className,
}: ImageUploaderProps) {
  const handleFile = useCallback(
    (file: File) => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`File size exceeds ${maxSizeMB}MB limit.`);
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.onerror = () => {
        toast.error("Failed to read the image file.");
      };
      reader.readAsDataURL(file);
    },
    [maxSizeMB, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  if (value) {
    return (
      <div className={`relative border rounded-md overflow-hidden h-64 ${className || ""}`}>
        <Button
          size="icon"
          variant="destructive"
          className="absolute top-2 right-2 z-10 h-7 w-7"
          onClick={() => onChange(null)}
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </Button>
        <Image
          src={value}
          alt="Uploaded image"
          fill
          className="object-contain"
        />
      </div>
    );
  }

  return (
    <label
      className={`border-2 border-dashed rounded-md p-8 h-64 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors ${className || ""}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <FileUp className="h-10 w-10 text-muted-foreground mb-4" />
      <span className="text-muted-foreground text-sm text-center">
        Drag & drop or click to upload
        <br />
        Max size: {maxSizeMB}MB
      </span>
      <input
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleInputChange}
        disabled={disabled}
      />
    </label>
  );
}
