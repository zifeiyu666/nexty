"use client";

import { generateAdminPresignedUploadUrl } from "@/actions/r2-resources";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Loader2, Upload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface UploadImageDialogProps {
  onUploadSuccess?: () => void;
  uploadPath: string;
  categoryName?: string;
}

interface FileWithStatus {
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
  previewUrl?: string;
  publicUrl?: string;
}

export function UploadImageDialog({
  onUploadSuccess,
  uploadPath,
  categoryName,
}: UploadImageDialogProps) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    const newFiles: FileWithStatus[] = selectedFiles.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      return {
        file,
        status: "pending" as const,
        progress: 0,
        previewUrl,
      };
    });

    setFiles((prev) => [...prev, ...newFiles]);

    // Reset input so the same files can be selected again if needed
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      // Revoke object URL to free memory
      if (newFiles[index].previewUrl) {
        URL.revokeObjectURL(newFiles[index].previewUrl!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadFile = async (fileWithStatus: FileWithStatus, index: number) => {
    const { file } = fileWithStatus;

    // Update status to uploading
    setFiles((prev) => {
      const newFiles = [...prev];
      newFiles[index] = {
        ...newFiles[index],
        status: "uploading",
        progress: 0,
      };
      return newFiles;
    });

    try {
      // Step 1: Get presigned URL
      const urlResult = await generateAdminPresignedUploadUrl({
        fileName: file.name,
        contentType: file.type,
        path: uploadPath,
      });

      if (!urlResult.success || !urlResult.data) {
        throw new Error(urlResult.error || "Failed to generate upload URL");
      }

      const { presignedUrl, publicObjectUrl } = urlResult.data;

      // Update progress to 50% after getting URL
      setFiles((prev) => {
        const newFiles = [...prev];
        newFiles[index] = { ...newFiles[index], progress: 50 };
        return newFiles;
      });

      // Step 2: Upload file to R2 using presigned URL
      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      // Update status to success
      setFiles((prev) => {
        const newFiles = [...prev];
        newFiles[index] = {
          ...newFiles[index],
          status: "success",
          progress: 100,
          publicUrl: publicObjectUrl,
        };
        return newFiles;
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      setFiles((prev) => {
        const newFiles = [...prev];
        newFiles[index] = {
          ...newFiles[index],
          status: "error",
          error: error.message || "Unknown error",
        };
        return newFiles;
      });
    }
  };

  const handleUploadAll = async () => {
    if (files.length === 0) {
      toast.error("Please select at least one file");
      return;
    }

    setUploading(true);

    try {
      // Upload all files sequentially
      for (let i = 0; i < files.length; i++) {
        if (files[i].status === "pending" || files[i].status === "error") {
          await uploadFile(files[i], i);
        }
      }

      const successCount = files.filter((f) => f.status === "success").length;
      const errorCount = files.filter((f) => f.status === "error").length;

      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} file(s)`, {
          description:
            errorCount > 0 ? `${errorCount} file(s) failed` : undefined,
        });

        // Trigger callback to refresh the list
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      }

      if (errorCount > 0 && successCount === 0) {
        toast.error(`Failed to upload ${errorCount} file(s)`);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    const successCount = files.filter((f) => f.status === "success").length;
    if (successCount > 0 && onUploadSuccess) {
      onUploadSuccess();
    }

    files.forEach((f) => {
      if (f.previewUrl) {
        URL.revokeObjectURL(f.previewUrl);
      }
    });
    setFiles([]);
    setOpen(false);
    setUploading(false);
  };

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const successCount = files.filter((f) => f.status === "success").length;
  const errorCount = files.filter((f) => f.status === "error").length;
  const uploadingCount = files.filter((f) => f.status === "uploading").length;

  const getStatusIcon = (status: FileWithStatus["status"]) => {
    switch (status) {
      case "pending":
        return null;
      case "uploading":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "success":
        return <Check className="h-4 w-4 text-green-500" />;
      case "error":
        return <X className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Images
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Upload Images</DialogTitle>
          <DialogDescription>
            Upload images to {categoryName || uploadPath}. You can select
            multiple files.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4 flex-1 overflow-hidden">
          <div className="grid gap-2">
            <Label htmlFor="files">Select Files</Label>
            <Input
              id="files"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              disabled={uploading}
            />
            {files.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {files.length} file(s) selected
                {successCount > 0 && ` • ${successCount} uploaded`}
                {errorCount > 0 && ` • ${errorCount} failed`}
              </p>
            )}
          </div>

          {files.length > 0 && (
            <ScrollArea className="flex-1 w-full rounded-md border p-4">
              <div className="space-y-4">
                {files.map((fileWithStatus, index) => (
                  <div
                    key={`${fileWithStatus.file.name}-${index}`}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    {fileWithStatus.previewUrl && (
                      <img
                        src={fileWithStatus.previewUrl}
                        alt="Preview"
                        className="h-16 w-16 rounded object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {fileWithStatus.file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(fileWithStatus.file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {getStatusIcon(fileWithStatus.status)}
                          {fileWithStatus.status === "pending" &&
                            !uploading && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => removeFile(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                        </div>
                      </div>
                      {fileWithStatus.status === "uploading" && (
                        <Progress
                          value={fileWithStatus.progress}
                          className="mt-2 h-1"
                        />
                      )}
                      {fileWithStatus.status === "error" && (
                        <p className="text-xs text-red-500 mt-1">
                          {fileWithStatus.error}
                        </p>
                      )}
                      {fileWithStatus.status === "success" &&
                        fileWithStatus.publicUrl && (
                          <p className="text-xs text-green-600 mt-1 truncate">
                            Uploaded successfully
                          </p>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={uploading}>
            {successCount > 0 ? "Close" : "Cancel"}
          </Button>
          <Button
            onClick={handleUploadAll}
            disabled={files.length === 0 || uploading || pendingCount === 0}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading... ({uploadingCount}/{files.length})
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload {pendingCount > 0 ? `${pendingCount} file(s)` : "All"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
