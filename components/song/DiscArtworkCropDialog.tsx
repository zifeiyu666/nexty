"use client";

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
} from "lucide-react";

export const DISC_IMAGE_CROP_PREVIEW_WIDTH = 900;
const DISC_IMAGE_CROP_PREVIEW_MAX_HEIGHT = 720;

export type DiscImageCropDraft = {
  source: string;
  imageWidth: number;
  imageHeight: number;
  crop: ImageCropTransform;
};

type DiscArtworkCropDialogProps = {
  draft: DiscImageCropDraft | null;
  dragStart: {
    pointerX: number;
    pointerY: number;
    cropX: number;
    cropY: number;
  } | null;
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
  pillButtonClassName: string;
  primaryButtonClassName: string;
  secondaryButtonClassName: string;
  subtlePanelClassName: string;
  infoCardClassName: string;
  sectionHeadingClassName: string;
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
    <div className="space-y-1 rounded-[8px] bg-white/38 px-2 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.68),0_6px_14px_rgba(70,53,38,0.04)] backdrop-blur-xl">
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
  draft,
  dragStart,
  minScale,
  onApply,
  onClose,
  onDragStartChange,
  onOrientationChange,
  onTransformChange,
  pillButtonActiveClassName,
  pillButtonClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
  subtlePanelClassName,
  infoCardClassName,
  sectionHeadingClassName,
}: DiscArtworkCropDialogProps) {
  const previewHeight = DISC_IMAGE_CROP_PREVIEW_WIDTH;
  const previewDisplayHeight = Math.min(
    previewHeight,
    DISC_IMAGE_CROP_PREVIEW_MAX_HEIGHT,
  );
  const previewDisplayScale = previewDisplayHeight / previewHeight;

  return (
    <Dialog open={Boolean(draft)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92svh] overflow-y-auto rounded-[18px] border-none bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(246,239,231,0.78))] p-4 shadow-[0_28px_84px_rgba(49,37,28,0.2),0_1px_0_rgba(255,255,255,0.82)_inset,0_0_0_1px_rgba(255,255,255,0.12)_inset] backdrop-blur-2xl sm:max-w-4xl [&_[data-slot=dialog-close]]:top-3.5 [&_[data-slot=dialog-close]]:right-3.5 [&_[data-slot=dialog-close]]:rounded-full [&_[data-slot=dialog-close]]:border-none [&_[data-slot=dialog-close]]:bg-white/72 [&_[data-slot=dialog-close]]:p-1.5 [&_[data-slot=dialog-close]]:opacity-100 [&_[data-slot=dialog-close]]:shadow-[0_10px_22px_rgba(70,53,38,0.12)]">
        <DialogHeader className="gap-2">
          <DialogTitle className="text-[1.35rem] font-black tracking-[-0.02em] text-[#241b16]">
            Crop disc artwork
          </DialogTitle>
          <DialogDescription className="max-w-2xl text-[12px] leading-5 text-[#706356]">
            Move and scale the image inside the circular disc area.
          </DialogDescription>
        </DialogHeader>

        {draft ? (
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_248px]">
            <div className="min-w-0 rounded-[14px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_38%),linear-gradient(180deg,#2e2925,#171412)] p-2.5 shadow-[0_20px_48px_rgba(31,24,19,0.28),0_1px_0_rgba(255,255,255,0.12)_inset]">
              <div
                className="mx-auto max-w-full overflow-hidden rounded-full shadow-[0_24px_46px_rgba(0,0,0,0.32)]"
                style={{
                  aspectRatio: "1 / 1",
                  width: previewDisplayHeight,
                  maxHeight: DISC_IMAGE_CROP_PREVIEW_MAX_HEIGHT,
                }}
              >
                <div
                  className="relative origin-top-left touch-none overflow-hidden rounded-full bg-black"
                  style={{
                    height: previewHeight,
                    transform: `scale(${previewDisplayScale})`,
                    width: DISC_IMAGE_CROP_PREVIEW_WIDTH,
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
                  onPointerUp={() => onDragStartChange(null)}
                  onPointerCancel={() => onDragStartChange(null)}
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
                  <div className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_0_2px_rgba(255,255,255,0.42),inset_0_0_34px_rgba(0,0,0,0.28)]" />
                  <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_9999px_rgba(0,0,0,0.02)]" />
                </div>
              </div>
            </div>

            <div className={cn(subtlePanelClassName, "space-y-2.5 p-2.5")}>
              <div className="space-y-1.5">
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
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      onOrientationChange({
                        rotate: getNextImageCropRotation(draft.crop.rotate, -1),
                      })
                    }
                  >
                    <RotateCcw className="size-4" />
                    Rotate
                  </Button>
                  <Button
                    className={cn(pillButtonClassName, "h-8 px-2")}
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      onOrientationChange({
                        rotate: getNextImageCropRotation(draft.crop.rotate, 1),
                      })
                    }
                  >
                    <RotateCw className="size-4" />
                    {draft.crop.rotate}°
                  </Button>
                </div>
              </div>

              <ControlRow
                label="Zoom"
                max={Math.max(draft.crop.scale * 3, draft.crop.scale + 2)}
                min={minScale}
                step={0.01}
                value={Number(draft.crop.scale.toFixed(2))}
                onChange={(scale) => onTransformChange({ scale })}
                sectionHeadingClassName={sectionHeadingClassName}
              />
              <ControlRow
                label="Move X"
                max={0}
                min={Math.round(
                  DISC_IMAGE_CROP_PREVIEW_WIDTH - draft.crop.renderedWidth,
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
                  "text-[10px] leading-4 text-[#7b6d62]",
                )}
              >
                The circular crop is used inside the record label area.
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
            <Move className="size-4" />
            Apply artwork
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
