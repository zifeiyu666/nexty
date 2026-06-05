"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { type ImageModelCapabilities } from "@/config/ai-models";
import { cn } from "@/lib/utils";
import {
  Dices,
  Monitor,
  Proportions,
  SlidersHorizontal,
  Type,
} from "lucide-react";
import { useTranslations } from "next-intl";

export interface ImageAdvancedValues {
  aspectRatio?: string;
  size?: string;
  quality?: string;
  background?: string;
  outputFormat?: string;
  seed?: number;
  negativePrompt?: string;
  guidanceScale?: number;
  inferenceSteps?: number;
  strength?: number;
  resolution?: string;
}

interface ImageAdvancedSettingsProps {
  capabilities: ImageModelCapabilities;
  values: ImageAdvancedValues;
  onChange: (values: ImageAdvancedValues) => void;
  hasSourceImage?: boolean;
  disabled?: boolean;
}

/** Visual aspect ratio preview block */
function AspectRatioIcon({ ratio }: { ratio: string }) {
  const [w, h] = ratio.split(":").map(Number);
  // Normalize so the larger dimension is 24px
  const maxDim = 22;
  const scale = maxDim / Math.max(w, h);
  const width = Math.max(Math.round(w * scale), 6);
  const height = Math.max(Math.round(h * scale), 6);

  return (
    <div
      className="rounded-sm bg-muted-foreground/30"
      style={{ width, height }}
    />
  );
}

/** Section header with icon */
function SectionLabel({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
      <Icon className="h-3.5 w-3.5" />
      {children}
    </Label>
  );
}

export default function ImageAdvancedSettings({
  capabilities,
  values,
  onChange,
  hasSourceImage,
  disabled,
}: ImageAdvancedSettingsProps) {
  const t = useTranslations("AIDemo.image");

  const hasAnySettings =
    capabilities.aspectRatios ||
    capabilities.sizes ||
    capabilities.resolutions ||
    capabilities.quality ||
    capabilities.background ||
    capabilities.outputFormats ||
    capabilities.seed ||
    capabilities.negativePrompt ||
    capabilities.guidanceScale ||
    capabilities.inferenceSteps ||
    (capabilities.strength && hasSourceImage);

  if (!hasAnySettings) {
    return null;
  }

  const update = (patch: Partial<ImageAdvancedValues>) => {
    onChange({ ...values, ...patch });
  };

  return (
    <div className="space-y-5">
      {/* Resolution */}
      {capabilities.resolutions && (
        <div>
          <SectionLabel icon={Monitor}>{t("resolution")}</SectionLabel>
          <div className="flex gap-2">
            {capabilities.resolutions.map((res) => (
              <button
                key={res}
                type="button"
                disabled={disabled}
                onClick={() =>
                  update({
                    resolution: values.resolution === res ? undefined : res,
                  })
                }
                className={cn(
                  "h-10 min-w-[72px] px-4 rounded-lg border text-sm font-medium transition-all",
                  "hover:border-primary/50",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  values.resolution === res
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-foreground"
                )}
              >
                {res}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Aspect Ratio — visual grid */}
      {capabilities.aspectRatios && (
        <div>
          <SectionLabel icon={Proportions}>{t("aspectRatio")}</SectionLabel>
          <div className="grid grid-cols-4 gap-2">
            {capabilities.aspectRatios.map((ratio) => (
              <button
                key={ratio}
                type="button"
                disabled={disabled}
                onClick={() =>
                  update({
                    aspectRatio:
                      values.aspectRatio === ratio ? undefined : ratio,
                  })
                }
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 rounded-lg border p-2.5 transition-all",
                  "hover:border-primary/50",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  values.aspectRatio === ratio
                    ? "border-primary bg-primary/10"
                    : "border-border bg-background"
                )}
              >
                <AspectRatioIcon ratio={ratio} />
                <span className="text-[11px] text-muted-foreground">
                  {ratio}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size */}
      {capabilities.sizes && (
        <div>
          <SectionLabel icon={Monitor}>{t("size")}</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {capabilities.sizes.map((s) => (
              <button
                key={s}
                type="button"
                disabled={disabled}
                onClick={() =>
                  update({ size: values.size === s ? undefined : s })
                }
                className={cn(
                  "h-9 px-3 rounded-lg border text-xs font-medium transition-all",
                  "hover:border-primary/50",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  values.size === s
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-foreground"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quality */}
      {capabilities.quality && (
        <div>
          <SectionLabel icon={SlidersHorizontal}>{t("quality")}</SectionLabel>
          <div className="flex gap-2">
            {capabilities.quality.map((q) => (
              <button
                key={q}
                type="button"
                disabled={disabled}
                onClick={() =>
                  update({ quality: values.quality === q ? undefined : q })
                }
                className={cn(
                  "h-9 px-4 rounded-lg border text-xs font-medium transition-all capitalize",
                  "hover:border-primary/50",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  values.quality === q
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-foreground"
                )}
              >
                {t(`quality${q.charAt(0).toUpperCase() + q.slice(1)}` as any)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Background */}
      {capabilities.background && (
        <div>
          <SectionLabel icon={SlidersHorizontal}>
            {t("background")}
          </SectionLabel>
          <div className="flex gap-2">
            {capabilities.background.map((bg) => (
              <button
                key={bg}
                type="button"
                disabled={disabled}
                onClick={() =>
                  update({
                    background: values.background === bg ? undefined : bg,
                  })
                }
                className={cn(
                  "h-9 px-4 rounded-lg border text-xs font-medium transition-all capitalize",
                  "hover:border-primary/50",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  values.background === bg
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-foreground"
                )}
              >
                {t(
                  `background${bg.charAt(0).toUpperCase() + bg.slice(1)}` as any
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Output Format */}
      {capabilities.outputFormats && (
        <div>
          <SectionLabel icon={Type}>{t("outputFormat")}</SectionLabel>
          <div className="flex gap-2">
            {capabilities.outputFormats.map((f) => (
              <button
                key={f}
                type="button"
                disabled={disabled}
                onClick={() =>
                  update({
                    outputFormat: values.outputFormat === f ? undefined : f,
                  })
                }
                className={cn(
                  "h-9 px-4 rounded-lg border text-xs font-medium transition-all uppercase",
                  "hover:border-primary/50",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  values.outputFormat === f
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-foreground"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Seed */}
      {capabilities.seed && (
        <div>
          <SectionLabel icon={Dices}>{t("seed")}</SectionLabel>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              className="h-9 text-sm flex-1"
              placeholder={t("seed")}
              value={values.seed ?? ""}
              onChange={(e) =>
                update({
                  seed: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              disabled={disabled}
            />
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() =>
                update({ seed: Math.floor(Math.random() * 2147483647) })
              }
              disabled={disabled}
              title={t("randomSeed")}
            >
              <Dices className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Negative Prompt */}
      {capabilities.negativePrompt && (
        <div>
          <SectionLabel icon={Type}>{t("negativePrompt")}</SectionLabel>
          <Textarea
            className="resize-none text-sm min-h-[60px]"
            placeholder={t("negativePromptPlaceholder")}
            value={values.negativePrompt || ""}
            onChange={(e) =>
              update({ negativePrompt: e.target.value || undefined })
            }
            disabled={disabled}
          />
        </div>
      )}

      {/* Guidance Scale */}
      {capabilities.guidanceScale && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs text-muted-foreground">
              {t("guidanceScale")}
            </Label>
            <span className="text-xs font-medium tabular-nums">
              {values.guidanceScale ?? capabilities.guidanceScale[2]}
            </span>
          </div>
          <Slider
            min={capabilities.guidanceScale[0]}
            max={capabilities.guidanceScale[1]}
            step={0.5}
            value={[values.guidanceScale ?? capabilities.guidanceScale[2]]}
            onValueChange={([v]) => update({ guidanceScale: v })}
            disabled={disabled}
          />
        </div>
      )}

      {/* Inference Steps */}
      {capabilities.inferenceSteps && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs text-muted-foreground">
              {t("inferenceSteps")}
            </Label>
            <span className="text-xs font-medium tabular-nums">
              {values.inferenceSteps ?? capabilities.inferenceSteps[2]}
            </span>
          </div>
          <Slider
            min={capabilities.inferenceSteps[0]}
            max={capabilities.inferenceSteps[1]}
            step={1}
            value={[values.inferenceSteps ?? capabilities.inferenceSteps[2]]}
            onValueChange={([v]) => update({ inferenceSteps: v })}
            disabled={disabled}
          />
        </div>
      )}

      {/* Strength (only when sourceImage is set) */}
      {capabilities.strength && hasSourceImage && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs text-muted-foreground">
              {t("strength")}
            </Label>
            <span className="text-xs font-medium tabular-nums">
              {(values.strength ?? capabilities.strength[2]).toFixed(2)}
            </span>
          </div>
          <Slider
            min={capabilities.strength[0]}
            max={capabilities.strength[1]}
            step={0.05}
            value={[values.strength ?? capabilities.strength[2]]}
            onValueChange={([v]) => update({ strength: v })}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}
