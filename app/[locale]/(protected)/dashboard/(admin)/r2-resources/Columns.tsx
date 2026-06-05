"use client";

import { R2File } from "@/actions/r2-resources";
import { ImagePreview } from "@/components/shared/ImagePreview";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { downloadFileAsAdmin } from "@/lib/cloudflare/r2-download";
import { getFileType } from "@/lib/cloudflare/r2-utils";
import { formatBytes } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import {
  Check,
  Copy,
  Download,
  Loader2,
  MoreHorizontal,
  Trash2,
  Video,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ActionsCellProps {
  file: R2File;
  onDelete: (key: string) => void;
}

const ActionsCell: React.FC<ActionsCellProps> = ({ file, onDelete }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadFileAsAdmin(file.key);
      toast.success("Download started");
    } catch (error: any) {
      toast.error("Failed to download file", {
        description: error.message || "Unknown error",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleDownload} disabled={isDownloading}>
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(file.key)}
            className="text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

interface CopyUrlCellProps {
  fileKey: string;
  r2PublicUrl: string | undefined;
}

const CopyUrlCell: React.FC<CopyUrlCellProps> = ({ fileKey, r2PublicUrl }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const fullUrl = `${r2PublicUrl}/${fileKey}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    toast.success("Full URL copied to clipboard", {
      description: fullUrl,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="mr-1 h-3 w-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="ml-1 h-3 w-3" />
                Copy URL
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {r2PublicUrl}/{fileKey}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const getColumns = (
  r2PublicUrl: string | undefined,
  onDelete: (key: string) => void
): ColumnDef<R2File>[] => [
  {
    accessorKey: "preview",
    header: "Preview",
    cell: ({ row }) => {
      const file = row.original;
      const fileType = getFileType(file.key);
      const previewUrl = r2PublicUrl ? `${r2PublicUrl}/${file.key}` : undefined;

      if (!previewUrl)
        return <span className="text-xs text-muted-foreground">N/A</span>;

      if (fileType === "image") {
        return (
          <ImagePreview>
            <img
              src={previewUrl}
              alt={`Preview of ${file.key}`}
              width={48}
              height={48}
              className="object-contain rounded border bg-muted"
            />
          </ImagePreview>
        );
      } else if (fileType === "video") {
        return (
          <video
            src={previewUrl}
            width="64"
            height="48"
            controls={false}
            muted
            preload="metadata"
            className="rounded border bg-muted"
          >
            <Video className="h-8 w-8 text-muted-foreground" />
          </video>
        );
      } else {
        return (
          <span className="text-xs text-muted-foreground">No Preview</span>
        );
      }
    },
    enableSorting: false,
  },
  {
    accessorKey: "key",
    header: "File URL",
    cell: ({ row }) => {
      const key = row.getValue<string>("key");
      return <CopyUrlCell fileKey={key} r2PublicUrl={r2PublicUrl} />;
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => getFileType(row.original.key).toUpperCase() ?? "Unknown",
  },
  {
    accessorKey: "size",
    header: "Size",
    cell: ({ row }) => formatBytes(row.getValue<number>("size")),
  },
  {
    accessorKey: "lastModified",
    header: "Last Modified",
    cell: ({ row }) => {
      const date = row.getValue<Date>("lastModified");
      return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <ActionsCell file={row.original} onDelete={onDelete} />,
    enableSorting: false,
    enableHiding: false,
  },
];
