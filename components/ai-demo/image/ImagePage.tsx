"use client";

import GenerateButton from "@/components/ai-demo/shared/GenerateButton";
import ImageUploader from "@/components/ai-demo/shared/ImageUploader";
import ModelSelector from "@/components/ai-demo/shared/ModelSelector";
import PromptInput from "@/components/ai-demo/shared/PromptInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { IMAGE_MODELS, type ImageModelConfig } from "@/config/ai-models";
import {
  ChevronDown,
  FileText,
  ImagePlus,
  Layers,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import ImageAdvancedSettings, {
  type ImageAdvancedValues,
} from "./ImageAdvancedSettings";
import ImageResultArea from "./ImageResultArea";

function getDefaults(model: ImageModelConfig): ImageAdvancedValues {
  const caps = model.capabilities;
  return {
    size: caps.sizes?.[0],
    aspectRatio: caps.aspectRatios?.[0],
    resolution: caps.resolutions?.[0],
    quality: caps.quality?.[0],
    background: caps.background?.[0],
    outputFormat: caps.outputFormats?.[0],
    guidanceScale: caps.guidanceScale?.[2],
    inferenceSteps: caps.inferenceSteps?.[2],
    strength: caps.strength?.[2],
  };
}

export default function ImagePage() {
  const t = useTranslations("AIDemo.image");
  const [selected, setSelected] = useState<{
    provider: string;
    modelId: string;
  }>({
    provider: IMAGE_MODELS[0].provider,
    modelId: IMAGE_MODELS[0].id,
  });

  const currentModel = IMAGE_MODELS.find(
    (m) => m.provider === selected.provider && m.id === selected.modelId
  )!;

  const [prompt, setPrompt] = useState("");
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [advanced, setAdvanced] = useState<ImageAdvancedValues>(
    getDefaults(currentModel)
  );
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState<number | undefined>();
  const [refImageOpen, setRefImageOpen] = useState(false);
  const startTimeRef = useRef<number>(0);

  const handleModelChange = useCallback(
    (value: { provider: string; modelId: string }) => {
      setSelected(value);
      const model = IMAGE_MODELS.find(
        (m) => m.provider === value.provider && m.id === value.modelId
      );
      if (model) {
        setAdvanced(getDefaults(model));
        if (!model.capabilities.imageToImage) {
          setSourceImage(null);
          setRefImageOpen(false);
        }
      }
    },
    []
  );

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    if (
      currentModel.capabilities.imageToImage &&
      !sourceImage &&
      !currentModel.capabilities.sizes &&
      !currentModel.capabilities.aspectRatios
    ) {
      toast.warning(t("referenceImageRequired"));
      return;
    }

    setLoading(true);
    setImageUrl(null);
    setGenerationTime(undefined);
    startTimeRef.current = Date.now();

    try {
      const body: Record<string, unknown> = {
        prompt,
        provider: selected.provider,
        modelId: selected.modelId,
      };

      if (sourceImage) body.sourceImage = sourceImage;
      if (advanced.aspectRatio) body.aspectRatio = advanced.aspectRatio;
      if (advanced.size) body.size = advanced.size;
      if (advanced.resolution) body.resolution = advanced.resolution;
      if (advanced.quality) body.quality = advanced.quality;
      if (advanced.background) body.background = advanced.background;
      if (advanced.outputFormat) body.outputFormat = advanced.outputFormat;
      if (advanced.seed !== undefined) body.seed = advanced.seed;
      if (advanced.negativePrompt)
        body.negativePrompt = advanced.negativePrompt;
      if (advanced.guidanceScale !== undefined)
        body.guidanceScale = advanced.guidanceScale;
      if (advanced.inferenceSteps !== undefined)
        body.inferenceSteps = advanced.inferenceSteps;
      if (advanced.strength !== undefined && sourceImage)
        body.strength = advanced.strength;

      const response = await fetch("/api/ai-demo/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to generate image");
      }

      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setGenerationTime(elapsed);

      if (result.data?.imageUrl) {
        setImageUrl(result.data.imageUrl);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate image");
    } finally {
      setLoading(false);
    }
  };

  const caps = currentModel.capabilities;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left: Controls */}
      <Card>
        <CardContent className="p-5 space-y-5">
          {/* Model Selector */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
              <Layers className="h-3.5 w-3.5" />
              {t("model")}
            </Label>
            <ModelSelector
              models={IMAGE_MODELS.map((m) => ({
                provider: m.provider,
                id: m.id,
                name: m.name,
              }))}
              value={selected}
              onChange={handleModelChange}
              disabled={loading}
            />
          </div>

          {/* Prompt */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
              <FileText className="h-3.5 w-3.5" />
              {t("prompt")}
            </Label>
            <PromptInput
              value={prompt}
              onChange={setPrompt}
              onSubmit={handleGenerate}
              placeholder={t("promptPlaceholder")}
              disabled={loading}
              maxLength={5000}
            />
          </div>

          {/* Reference Image (collapsible, only for I2I-capable models) */}
          {caps.imageToImage && (
            <Collapsible open={refImageOpen} onOpenChange={setRefImageOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between px-0 has-[>svg]:px-0 hover:bg-transparent"
                  disabled={loading}
                >
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ImagePlus className="h-3.5 w-3.5" />
                    {t("referenceImage")}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${refImageOpen ? "rotate-180" : ""}`}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 space-y-3">
                <ImageUploader
                  value={sourceImage}
                  onChange={(v) => {
                    setSourceImage(v);
                    setImageUrl(null);
                  }}
                  disabled={loading}
                />
                {sourceImage && caps.strength && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs text-muted-foreground">
                        {t("strength")}
                      </Label>
                      <span className="text-xs font-medium tabular-nums">
                        {(advanced.strength ?? caps.strength[2]).toFixed(2)}
                      </span>
                    </div>
                    <Slider
                      min={caps.strength[0]}
                      max={caps.strength[1]}
                      step={0.05}
                      value={[advanced.strength ?? caps.strength[2]]}
                      onValueChange={([v]) =>
                        setAdvanced((prev) => ({ ...prev, strength: v }))
                      }
                      disabled={loading}
                    />
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Advanced Settings — inline, not collapsible */}
          <ImageAdvancedSettings
            capabilities={caps}
            values={advanced}
            onChange={setAdvanced}
            hasSourceImage={!!sourceImage}
            disabled={loading}
          />

          {/* Generate Button */}
          <GenerateButton
            onClick={handleGenerate}
            loading={loading}
            disabled={!prompt.trim()}
            loadingText={t("generating")}
            className="w-full h-11"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {t("generate")}
          </GenerateButton>
        </CardContent>
      </Card>

      {/* Right: Result */}
      <div>
        <ImageResultArea
          imageUrl={imageUrl}
          loading={loading}
          provider={selected.provider}
          modelName={currentModel.name}
          generationTime={generationTime}
          prompt={prompt}
        />
      </div>
    </div>
  );
}
