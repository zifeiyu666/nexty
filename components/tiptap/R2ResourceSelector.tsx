"use client";

import { listR2Files, R2File } from "@/actions/r2-resources";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { R2_CATEGORIES } from "@/config/common";
import { getFileType } from "@/lib/cloudflare/r2-utils";
import { formatBytes } from "@/lib/utils";
import dayjs from "dayjs";
import { Check, FileIcon, Search, Video, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

interface R2ResourceSelectorProps {
  onSelect: (url: string | string[]) => void;
  r2PublicUrl?: string;
  children?: React.ReactNode;
  buttonText?: string;
  title?: string;
  description?: string;
  fileTypeFilter?: "image" | "video" | "all";
  multiple?: boolean;
}

const PAGE_SIZE = 48;

export function R2ResourceSelector({
  onSelect,
  r2PublicUrl = "",
  children,
  buttonText = "Select from R2",
  title = "Select Resource from R2",
  fileTypeFilter = "all",
  multiple = false,
}: R2ResourceSelectorProps) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(R2_CATEGORIES[0].prefix);
  const [filter, setFilter] = useState("");
  const [debouncedFilter] = useDebounce(filter, 500);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);

  const handleSelect = (url: string) => {
    if (multiple) {
      setSelectedUrls((prev) => {
        if (prev.includes(url)) {
          return prev.filter((u) => u !== url);
        } else {
          return [...prev, url];
        }
      });
    } else {
      onSelect(url);
      setOpen(false);
    }
  };

  const handleConfirm = () => {
    if (multiple && selectedUrls.length > 0) {
      onSelect(selectedUrls);
      setSelectedUrls([]);
      setOpen(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen && multiple) {
      setSelectedUrls([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || <Button variant="outline">{buttonText}</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
          <DialogTitle>
            {title}
            {multiple && selectedUrls.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({selectedUrls.length} selected)
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col overflow-hidden px-6">
          <Tabs
            value={activeCategory}
            onValueChange={setActiveCategory}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="shrink-0 mb-2 -mx-6 px-6 overflow-x-auto">
              <TabsList className="inline-flex w-auto min-w-full">
                {R2_CATEGORIES.map((cat) => (
                  <TabsTrigger
                    key={cat.prefix}
                    value={cat.prefix}
                    className="shrink-0"
                  >
                    {cat.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="shrink-0 mb-4 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by filename..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-9 pr-8"
              />
              {filter && (
                <button
                  onClick={() => setFilter("")}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {R2_CATEGORIES.map((cat) => (
              <TabsContent
                key={cat.prefix}
                value={cat.prefix}
                className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col min-h-0"
              >
                <ResourceGrid
                  categoryPrefix={cat.prefix}
                  filterPrefix={debouncedFilter}
                  r2PublicUrl={r2PublicUrl}
                  onSelect={handleSelect}
                  selectedUrls={multiple ? selectedUrls : []}
                  fileTypeFilter={fileTypeFilter}
                  onClearFilter={() => setFilter("")}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {multiple && (
          <div className="flex justify-between items-center px-6 py-4 border-t shrink-0">
            <Button
              variant="outline"
              onClick={() => setSelectedUrls([])}
              disabled={selectedUrls.length === 0}
            >
              Clear Selection
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selectedUrls.length === 0}
            >
              Insert {selectedUrls.length} Image
              {selectedUrls.length !== 1 ? "s" : ""}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface ResourceCardProps {
  file: R2File;
  r2PublicUrl: string;
  isSelected: boolean;
  onSelect: (file: R2File) => void;
}

function ResourceCard({
  file,
  r2PublicUrl,
  isSelected,
  onSelect,
}: ResourceCardProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const fileType = getFileType(file.key);
  const previewUrl = `${r2PublicUrl}/${file.key}`;
  const fileName = file.key.split("/").pop();

  return (
    <div
      className={`relative group cursor-pointer rounded-lg border overflow-hidden transition-all hover:border-primary/50 hover:shadow-sm ${
        isSelected ? "border-primary ring-1 ring-primary" : "border-border"
      }`}
      onClick={() => onSelect(file)}
    >
      <div className="aspect-square bg-muted flex items-center justify-center relative overflow-hidden">
        {fileType === "image" ? (
          <>
            {isImageLoading && (
              <Skeleton className="absolute inset-0 w-full h-full" />
            )}
            <img
              src={previewUrl}
              alt={file.key}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                isImageLoading ? "opacity-0" : "opacity-100"
              }`}
              loading="lazy"
              onLoad={() => setIsImageLoading(false)}
            />
          </>
        ) : fileType === "video" ? (
          <div className="relative w-full h-full bg-black/5">
            <video
              src={previewUrl}
              className="w-full h-full object-contain"
              muted
              preload="metadata"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
              <Video className="h-12 w-12 text-white/80 drop-shadow-md" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <FileIcon className="h-10 w-10 text-muted-foreground/50 mb-2" />
          </div>
        )}
      </div>

      {isSelected && (
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-sm z-10">
          <Check className="h-3 w-3" />
        </div>
      )}

      <div className="p-2 bg-background border-t text-xs">
        <p className="font-medium truncate text-foreground/90" title={fileName}>
          {fileName}
        </p>
        <div className="flex justify-between items-center text-muted-foreground mt-1">
          <span>{file.size ? formatBytes(file.size, 0) : ""}</span>
          {file.lastModified && (
            <span>{dayjs(file.lastModified).format("MMM D")}</span>
          )}
        </div>
      </div>
    </div>
  );
}

interface ResourceGridProps {
  categoryPrefix: string;
  filterPrefix: string;
  r2PublicUrl: string;
  onSelect: (url: string) => void;
  selectedUrls: string[];
  fileTypeFilter: "image" | "video" | "all";
  onClearFilter?: () => void;
}

function ResourceGrid({
  categoryPrefix,
  filterPrefix,
  r2PublicUrl,
  onSelect,
  selectedUrls,
  fileTypeFilter,
  onClearFilter,
}: ResourceGridProps) {
  const [files, setFiles] = useState<R2File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [continuationToken, setContinuationToken] = useState<
    string | undefined
  >();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadFiles = useCallback(
    async (reset: boolean = false) => {
      if (isLoading || (!reset && !hasMore)) return;

      setIsLoading(true);

      try {
        const result = await listR2Files({
          categoryPrefix,
          filterPrefix,
          continuationToken: reset ? undefined : continuationToken,
          pageSize: PAGE_SIZE,
        });

        if (!result.success || !result.data) {
          toast.error("Failed to load files", {
            description: result.error,
          });
          return;
        }

        const { files: newFiles, nextContinuationToken } = result.data;

        // Filter by file type if specified
        const filteredFiles =
          fileTypeFilter === "all"
            ? newFiles
            : newFiles.filter((file) => {
                const type = getFileType(file.key);
                return type === fileTypeFilter;
              });

        if (reset) {
          setFiles(filteredFiles);
        } else {
          setFiles((prev) => [...prev, ...filteredFiles]);
        }

        setContinuationToken(nextContinuationToken);
        setHasMore(nextContinuationToken !== undefined);
      } catch (error: any) {
        toast.error("Failed to load files", {
          description: error.message || "Unknown error",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [
      categoryPrefix,
      filterPrefix,
      continuationToken,
      hasMore,
      isLoading,
      fileTypeFilter,
    ]
  );

  // Reset when category or filter changes
  useEffect(() => {
    setFiles([]);
    setContinuationToken(undefined);
    setHasMore(true);
    loadFiles(true);
  }, [categoryPrefix, filterPrefix, fileTypeFilter]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadFiles(false);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, loadFiles]);

  const handleSelect = (file: R2File) => {
    const fullUrl = `${r2PublicUrl}/${file.key}`;
    onSelect(fullUrl);
  };

  return (
    <ScrollArea ref={scrollAreaRef} className="flex-1 -mr-6 pr-6">
      {files.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <div className="bg-muted/50 p-4 rounded-full mb-4">
            <FileIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground mb-1">
            No files found
          </p>
          <p className="text-sm max-w-xs text-center mb-4">
            {filterPrefix
              ? `No files match "${filterPrefix}" in this category.`
              : "This category is empty."}
          </p>
          {filterPrefix && onClearFilter && (
            <Button variant="outline" onClick={onClearFilter}>
              Clear Filter
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-4">
          {files.map((file) => {
            const previewUrl = `${r2PublicUrl}/${file.key}`;
            const isSelected = selectedUrls.includes(previewUrl);

            return (
              <ResourceCard
                key={file.key}
                file={file}
                r2PublicUrl={r2PublicUrl}
                isSelected={isSelected}
                onSelect={handleSelect}
              />
            );
          })}

          {/* Loading Skeletons */}
          {isLoading &&
            Array.from({ length: files.length > 0 ? 4 : 12 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="rounded-lg border overflow-hidden"
              >
                <Skeleton className="aspect-square w-full" />
                <div className="p-2 border-t space-y-2">
                  <Skeleton className="h-3 w-3/4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-2 w-1/4" />
                    <Skeleton className="h-2 w-1/4" />
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Infinite scroll trigger - keep it at bottom to trigger load */}
      <div ref={observerTarget} className="h-4 w-full" />

      {!hasMore && files.length > 0 && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          No more files
        </div>
      )}
    </ScrollArea>
  );
}
