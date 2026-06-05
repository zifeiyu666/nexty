"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { type VideoModelCapabilities } from "@/config/ai-models";
import { cn } from "@/lib/utils";
import {
  Camera,
  Dices,
  Monitor,
  Proportions,
  SlidersHorizontal,
  Type,
  Volume2,
} from "lucide-react";
import { useTranslations } from "next-intl";

export interface VideoAdvancedValues {
  aspectRatio?: string;
  resolution?: string;
  negativePrompt?: string;
  cfgScale?: number;
  generateAudio?: boolean;
  cameraFixed?: boolean;
  seed?: number;
}

interface VideoAdvancedSettingsProps {
  capabilities: VideoModelCapabilities;
  values: VideoAdvancedValues;
  onChange: (values: VideoAdvancedValues) => void;
  disabled?: boolean;
}

function AspectRatioIcon({ ratio }: { ratio: string }) {
  const [w, h] = ratio.split(":").map(Number);
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

export default function VideoAdvancedSettings({
  capabilities,
  values,
  onChange,
  disabled,
}: VideoAdvancedSettingsProps) {
  const t = useTranslations("AIDemo.video");

  const hasAnySettings =
    capabilities.aspectRatios ||
    capabilities.resolutions ||
    capabilities.negativePrompt ||
    capabilities.cfgScale ||
    capabilities.generateAudio ||
    capabilities.cameraFixed ||
    capabilities.seed;

  if (!hasAnySettings) {
    return null;
  }

  const update = (patch: Partial<VideoAdvancedValues>) => {
    onChange({ ...values, ...patch });
  };

  return (
    <div className="space-y-5">
      {/* Aspect Ratio */}
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

      {/* Generate Audio */}
      {capabilities.generateAudio && (
        <div>
          <SectionLabel icon={Volume2}>{t("generateAudio")}</SectionLabel>
          <div className="flex gap-2">
            {[true, false].map((val) => (
              <button
                key={String(val)}
                type="button"
                disabled={disabled}
                onClick={() => update({ generateAudio: val })}
                className={cn(
                  "h-10 min-w-[72px] px-4 rounded-lg border text-sm font-medium transition-all",
                  "hover:border-primary/50",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  values.generateAudio === val
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-foreground"
                )}
              >
                {val ? "ON" : "OFF"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Camera Fixed */}
      {capabilities.cameraFixed && (
        <div>
          <SectionLabel icon={Camera}>{t("cameraFixed")}</SectionLabel>
          <div className="flex gap-2">
            {[true, false].map((val) => (
              <button
                key={String(val)}
                type="button"
                disabled={disabled}
                onClick={() => update({ cameraFixed: val })}
                className={cn(
                  "h-10 min-w-[72px] px-4 rounded-lg border text-sm font-medium transition-all",
                  "hover:border-primary/50",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  values.cameraFixed === val
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-foreground"
                )}
              >
                {val ? "ON" : "OFF"}
              </button>
            ))}
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

      {/* CFG Scale */}
      {capabilities.cfgScale && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs text-muted-foreground">
              {t("cfgScale")}
            </Label>
            <span className="text-xs font-medium tabular-nums">
              {(values.cfgScale ?? capabilities.cfgScale[2]).toFixed(2)}
            </span>
          </div>
          <Slider
            min={capabilities.cfgScale[0]}
            max={capabilities.cfgScale[1]}
            step={0.05}
            value={[values.cfgScale ?? capabilities.cfgScale[2]]}
            onValueChange={([v]) => update({ cfgScale: v })}
            disabled={disabled}
          />
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
    </div>
  );
}
