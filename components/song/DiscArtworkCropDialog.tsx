"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type {
  ImageCropRotation,
  ImageCropTransform,
} from "@/lib/wall-art/image-lyrics";
import {
  FlipHorizontal,
  FlipVertical,
  Move,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

export const DISC_IMAGE_CROP_PREVIEW_WIDTH = 900;
const IMAGE_CROP_DIALOG_PREVIEW_MAX_HEIGHT = 480;

export type DiscImageCropDraft = {
  source: string;
  imageWidth: number;
  imageHeight: number;
  crop: ImageCropTransform;
};

type DiscArtworkCropDialogProps = {
  applyLabel?: string;
  canvasHeight?: number;
  canvasWidth?: number;
  children?: ReactNode;
  description?: string;
  draft: DiscImageCropDraft | null;
  dragStart: {
    pointerX: number;
    pointerY: number;
    cropX: number;
    cropY: number;
  } | null;
  infoText?: string;
  minScale: number;
  onApply: () => void;
  onClose: () => void;
  onDragStartChange: (
    value: {
      pointerX: number;
      pointerY: number;
      cropX: number;
      cropY: number;
    } | null,
  ) => void;
  onOrientationChange: (
    patch: Partial<Pick<ImageCropTransform, "rotate" | "flipX" | "flipY">>,
  ) => void;
  onTransformChange: (
    patch: Partial<Pick<ImageCropTransform, "x" | "y" | "scale">>,
  ) => void;
  pillButtonActiveClassName: string;
  previewMaxHeight?: number;
  previewRoundedClassName?: string;
  pillButtonClassName: string;
  primaryButtonClassName: string;
  secondaryButtonClassName: string;
  showGrid?: boolean;
  subtlePanelClassName: string;
  infoCardClassName: string;
  sectionHeadingClassName: string;
  title?: string;
};

function getNextImageCropRotation(
  rotate: ImageCropRotation,
  direction: 1 | -1,
): ImageCropRotation {
  const rotations: ImageCropRotation[] = [0, 90, 180, 270];
  const currentIndex = rotations.indexOf(rotate);
  const nextIndex = (currentIndex + direction + rotations.length) % rotations.length;

  return rotations[nextIndex] ?? 0;
}

function getImageCropPreviewTransform({
  rotate,
  flipX,
  flipY,
}: Pick<ImageCropTransform, "rotate" | "flipX" | "flipY">): string {
  return `translate(-50%, -50%) rotate(${rotate}deg) scale(${flipX ? -1 : 1}, ${
    flipY ? -1 : 1
  })`;
}

function ControlRow({
  label,
  max,
  min,
  onChange,
  sectionHeadingClassName,
  step = 1,
  value,
}: {
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  sectionHeadingClassName: string;
  step?: number;
  value: number;
}) {
  return (
    <div className="space-y-1.5 rounded-[10px] border border-white/46 bg-[linear-gradient(180deg,rgba(255,255,255,0.5),rgba(250,247,243,0.32))] px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.74),0_8px_18px_rgba(70,53,38,0.055)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-2">
        <Label className={sectionHeadingClassName}>{label}</Label>
        <span className="rounded-full bg-white/72 px-1.5 py-0.5 text-[9px] font-black tabular-nums text-[#5d5045] shadow-[inset_0_1px_0_rgba(255,255,255,0.74)]">
          {value}
        </span>
      </div>
      <Slider
        className="[&_[data-slot=slider-range]]:bg-[#362e28] [&_[data-slot=slider-thumb]]:size-3 [&_[data-slot=slider-thumb]]:border-none [&_[data-slot=slider-thumb]]:bg-[#fff8f1] [&_[data-slot=slider-thumb]]:shadow-[0_6px_12px_rgba(53,40,30,0.18),0_0_0_1px_rgba(255,255,255,0.72)_inset] [&_[data-slot=slider-track]]:h-1.5 [&_[data-slot=slider-track]]:bg-white/65"
        max={max}
        min={min}
        step={step}
        value={[value]}
        onValueChange={(next) => onChange(next[0] ?? value)}
      />
    </div>
  );
}

export function DiscArtworkCropDialog({
  applyLabel = "Apply",
  canvasHeight = DISC_IMAGE_CROP_PREVIEW_WIDTH,
  canvasWidth = DISC_IMAGE_CROP_PREVIEW_WIDTH,
  children,
  description = "Move and scale the image inside the circular disc area.",
  draft,
  dragStart,
  infoText = "The circular crop is used inside the record label area.",
  minScale,
  onApply,
  onClose,
  onDragStartChange,
  onOrientationChange,
  onTransformChange,
  pillButtonActiveClassName,
  pillButtonClassName,
  previewMaxHeight = IMAGE_CROP_DIALOG_PREVIEW_MAX_HEIGHT,
  previewRoundedClassName = "rounded-full",
  primaryButtonClassName,
  secondaryButtonClassName,
  showGrid = false,
  subtlePanelClassName,
  infoCardClassName,
  sectionHeadingClassName,
  title = "Crop disc artwork",
}: DiscArtworkCropDialogProps) {
  const previewHeight = canvasHeight;
  const previewDisplayHeight = Math.min(
    previewHeight,
    previewMaxHeight,
  );
  const previewDisplayScale = previewDisplayHeight / previewHeight;
  const previewDisplayWidth = Math.round(canvasWidth * previewDisplayScale);
  const zoomStep = 0.1;

  return (
    <Dialog open={Boolean(draft)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92svh] overflow-y-auto rounded-[18px] border-none bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(246,239,231,0.78))] p-4 shadow-[0_28px_84px_rgba(49,37,28,0.2),0_1px_0_rgba(255,255,255,0.82)_inset,0_0_0_1px_rgba(255,255,255,0.12)_inset] backdrop-blur-2xl sm:max-w-4xl [&_[data-slot=dialog-close]]:top-3.5 [&_[data-slot=dialog-close]]:right-3.5 [&_[data-slot=dialog-close]]:rounded-full [&_[data-slot=dialog-close]]:border-none [&_[data-slot=dialog-close]]:bg-white/72 [&_[data-slot=dialog-close]]:p-1.5 [&_[data-slot=dialog-close]]:opacity-100 [&_[data-slot=dialog-close]]:shadow-[0_10px_22px_rgba(70,53,38,0.12)]">
        <DialogHeader className="gap-2">
          <DialogTitle className="text-[1.35rem] font-black tracking-[-0.02em] text-[#241b16]">
            {title}
          </DialogTitle>
          <DialogDescription className="max-w-2xl text-[12px] leading-5 text-[#706356]">
            {description}
          </DialogDescription>
        </DialogHeader>

        {draft ? (
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_248px]">
            <div className="min-w-0 rounded-[14px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_38%),linear-gradient(180deg,#2e2925,#171412)] p-2.5 shadow-[0_20px_48px_rgba(31,24,19,0.28),0_1px_0_rgba(255,255,255,0.12)_inset]">
              <div
                className={cn(
                  "relative mx-auto max-w-full overflow-visible shadow-[0_24px_46px_rgba(0,0,0,0.32)]",
                  previewRoundedClassName,
                )}
                style={{
                  aspectRatio: `${canvasWidth} / ${previewHeight}`,
                  width: previewDisplayWidth,
                  maxHeight: previewMaxHeight,
                }}
              >
                <div
                  className={cn(
                    "group relative origin-top-left touch-none overflow-hidden bg-black",
                    previewRoundedClassName,
                    dragStart ? "cursor-grabbing" : "cursor-grab",
                  )}
                  style={{
                    height: previewHeight,
                    transform: `scale(${previewDisplayScale})`,
                    width: canvasWidth,
                  }}
                  onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture(event.pointerId);
                    onDragStartChange({
                      pointerX: event.clientX,
                      pointerY: event.clientY,
                      cropX: draft.crop.x,
                      cropY: draft.crop.y,
                    });
                  }}
                  onPointerMove={(event) => {
                    if (!dragStart) return;
                    onTransformChange({
                      x:
                        dragStart.cropX +
                        (event.clientX - dragStart.pointerX) / previewDisplayScale,
                      y:
                        dragStart.cropY +
                        (event.clientY - dragStart.pointerY) / previewDisplayScale,
                    });
                  }}
                  onPointerUp={(event) => {
                    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                      event.currentTarget.releasePointerCapture(event.pointerId);
                    }
                    onDragStartChange(null);
                  }}
                  onPointerCancel={(event) => {
                    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                      event.currentTarget.releasePointerCapture(event.pointerId);
                    }
                    onDragStartChange(null);
                  }}
                >
                  <div
                    className="absolute"
                    style={{
                      height: draft.crop.renderedHeight,
                      left: draft.crop.x,
                      top: draft.crop.y,
                      width: draft.crop.renderedWidth,
                    }}
                  >
                    <img
                      alt="Crop preview"
                      className="absolute left-1/2 top-1/2 max-w-none select-none"
                      draggable={false}
                      src={draft.source}
                      style={{
                        height: draft.imageHeight * draft.crop.scale,
                        transform: getImageCropPreviewTransform(draft.crop),
                        width: draft.imageWidth * draft.crop.scale,
                      }}
                    />
                  </div>
                  {showGrid ? (
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.18)_1px,transparent_1px)] bg-[size:33.333%_33.333%]" />
                  ) : null}
                  <div
                    className={cn(
                      "pointer-events-none absolute inset-0 shadow-[inset_0_0_0_2px_rgba(255,255,255,0.42),inset_0_0_34px_rgba(0,0,0,0.28)]",
                      previewRoundedClassName,
                    )}
                  />
                  <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_9999px_rgba(0,0,0,0.02)]" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
                    <div
                      className={cn(
                        "flex items-center gap-2 rounded-full border border-white/18 bg-[#171412]/58 px-3 py-1.5 text-[11px] font-semibold text-white/92 shadow-[0_12px_28px_rgba(0,0,0,0.22)] backdrop-blur-md transition duration-200",
                        dragStart
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
                      )}
                    >
                      <Move className="size-3.5" />
                      Drag to reposition
                    </div>
                  </div>
                </div>
                <div className="absolute -right-4 top-3 z-20 flex gap-1.5">
                  <Button
                    aria-label="Zoom out"
                    className="size-8 rounded-full border border-white/48 bg-white/38 p-0 text-[#322923] shadow-[0_14px_28px_rgba(37,29,24,0.18),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-xl transition hover:bg-white/54 hover:text-[#211a16]"
                    disabled={draft.crop.scale <= minScale}
                    title="Zoom out"
                    type="button"
                    variant="ghost"
                    onClick={(event) => {
                      event.stopPropagation();
                      onTransformChange({
                        scale: Number(
                          Math.max(minScale, draft.crop.scale - zoomStep).toFixed(2),
                        ),
                      });
                    }}
                    onPointerDown={(event) => event.stopPropagation()}
                  >
                    <ZoomOut className="size-4" />
                  </Button>
                  <Button
                    aria-label="Zoom in"
                    className="size-8 rounded-full border border-white/48 bg-white/38 p-0 text-[#322923] shadow-[0_14px_28px_rgba(37,29,24,0.18),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-xl transition hover:bg-white/54 hover:text-[#211a16]"
                    title="Zoom in"
                    type="button"
                    variant="ghost"
                    onClick={(event) => {
                      event.stopPropagation();
                      onTransformChange({
                        scale: Number((draft.crop.scale + zoomStep).toFixed(2)),
                      });
                    }}
                    onPointerDown={(event) => event.stopPropagation()}
                  >
                    <ZoomIn className="size-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div
              className={cn(
                subtlePanelClassName,
                "space-y-3 border border-white/48 bg-[linear-gradient(180deg,rgba(246,242,236,0.84),rgba(232,225,216,0.7))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),inset_0_-18px_34px_rgba(170,154,136,0.07),0_18px_38px_rgba(70,53,38,0.08)]",
              )}
            >
              {children}
              <div className="space-y-2">
                <Label className={sectionHeadingClassName}>Transform</Label>
                <div className="grid grid-cols-2 gap-1.5">
                  <Button
                    className={cn(
                      draft.crop.flipX
                        ? pillButtonActiveClassName
                        : pillButtonClassName,
                      "h-8 px-2",
                    )}
                    type="button"
                    variant={draft.crop.flipX ? "default" : "ghost"}
                    onClick={() =>
                      onOrientationChange({ flipX: !draft.crop.flipX })
                    }
                  >
                    <FlipHorizontal className="size-4" />
                    Flip H
                  </Button>
                  <Button
                    className={cn(
                      draft.crop.flipY
                        ? pillButtonActiveClassName
                        : pillButtonClassName,
                      "h-8 px-2",
                    )}
                    type="button"
                    variant={draft.crop.flipY ? "default" : "ghost"}
                    onClick={() =>
                      onOrientationChange({ flipY: !draft.crop.flipY })
                    }
                  >
                    <FlipVertical className="size-4" />
                    Flip V
                  </Button>
                  <Button
                    className={cn(pillButtonClassName, "h-8 px-2")}
                    aria-label="Rotate counterclockwise"
                    title="Rotate counterclockwise"
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      onOrientationChange({
                        rotate: getNextImageCropRotation(draft.crop.rotate, -1),
                      })
                    }
                  >
                    <RotateCcw className="size-4" />
                    Rotate L
                  </Button>
                  <Button
                    className={cn(pillButtonClassName, "h-8 px-2")}
                    aria-label="Rotate clockwise"
                    title="Rotate clockwise"
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      onOrientationChange({
                        rotate: getNextImageCropRotation(draft.crop.rotate, 1),
                      })
                    }
                  >
                    <RotateCw className="size-4" />
                    Rotate R
                  </Button>
                </div>
              </div>

              <ControlRow
                label="Move X"
                max={0}
                min={Math.round(
                  canvasWidth - draft.crop.renderedWidth,
                )}
                value={Math.round(draft.crop.x)}
                onChange={(x) => onTransformChange({ x })}
                sectionHeadingClassName={sectionHeadingClassName}
              />
              <ControlRow
                label="Move Y"
                max={0}
                min={Math.round(previewHeight - draft.crop.renderedHeight)}
                value={Math.round(draft.crop.y)}
                onChange={(y) => onTransformChange({ y })}
                sectionHeadingClassName={sectionHeadingClassName}
              />
              <div
                className={cn(
                  infoCardClassName,
                  "border border-white/40 bg-white/44 text-[10px] leading-4 text-[#7b6d62] shadow-[inset_0_1px_0_rgba(255,255,255,0.68),0_8px_18px_rgba(70,53,38,0.045)]",
                )}
              >
                {infoText}
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter className="mt-2">
          <Button
            className={secondaryButtonClassName}
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className={primaryButtonClassName}
            type="button"
            onClick={onApply}
          >
            {applyLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
