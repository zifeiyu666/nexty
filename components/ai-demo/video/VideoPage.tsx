"use client";

import GenerateButton from "@/components/ai-demo/shared/GenerateButton";
import ImageUploader from "@/components/ai-demo/shared/ImageUploader";
import ModelSelector from "@/components/ai-demo/shared/ModelSelector";
import PromptInput from "@/components/ai-demo/shared/PromptInput";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VIDEO_MODELS, type VideoModelCapabilities, type VideoModelConfig, getVideoModelsByType } from "@/config/ai-models";
import { cn } from "@/lib/utils";
import { Clock, FileText, ImagePlus, Layers, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import VideoAdvancedSettings, { type VideoAdvancedValues } from "./VideoAdvancedSettings";
import VideoResultArea from "./VideoResultArea";

const T2V_MODELS = getVideoModelsByType("text-to-video");
const I2V_MODELS = getVideoModelsByType("image-to-video");

function getDefaults(capabilities: VideoModelCapabilities): VideoAdvancedValues {
  return {
    aspectRatio: capabilities.aspectRatios?.[0],
    resolution: capabilities.resolutions?.[0],
    generateAudio: capabilities.generateAudio ? (capabilities.generateAudioDefault ?? false) : undefined,
    cameraFixed: capabilities.cameraFixed ? false : undefined,
  };
}

export default function VideoPage() {
  const t = useTranslations("AIDemo.video");
  const [activeTab, setActiveTab] = useState<
    "text-to-video" | "image-to-video"
  >("text-to-video");
  const [selected, setSelected] = useState<{
    provider: string;
    modelId: string;
  }>({
    provider: T2V_MODELS[0].provider,
    modelId: T2V_MODELS[0].id,
  });

  const models = activeTab === "text-to-video" ? T2V_MODELS : I2V_MODELS;
  const currentModel =
    models.find(
      (m) => m.provider === selected.provider && m.id === selected.modelId
    ) ?? models[0];

  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState(
    String(currentModel.supportedDurations[0])
  );
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [advanced, setAdvanced] = useState<VideoAdvancedValues>(() =>
    getDefaults(currentModel.capabilities)
  );
  const [taskId, setTaskId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isI2V = activeTab === "image-to-video";

  const handleTabChange = (tab: string) => {
    if (loading) return;
    const newTab = tab as "text-to-video" | "image-to-video";
    setActiveTab(newTab);
    const newModels = newTab === "text-to-video" ? T2V_MODELS : I2V_MODELS;
    setSelected({
      provider: newModels[0].provider,
      modelId: newModels[0].id,
    });
    setDuration(String(newModels[0].supportedDurations[0]));
    setAdvanced(getDefaults(newModels[0].capabilities));
    setSourceImage(null);
    setVideoUrl(null);
    setTaskId(null);
  };

  const handleModelChange = useCallback(
    (value: { provider: string; modelId: string }) => {
      setSelected(value);
      const model = VIDEO_MODELS.find(
        (m) => m.provider === value.provider && m.id === value.modelId
      );
      if (model) {
        setDuration(String(model.supportedDurations[0]));
        setAdvanced(getDefaults(model.capabilities));
      }
    },
    []
  );

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    if (isI2V && !sourceImage) {
      toast.warning(t("referenceImageRequired"));
      return;
    }

    setLoading(true);
    setVideoUrl(null);
    setTaskId(null);

    try {
      const body: Record<string, unknown> = {
        prompt,
        provider: selected.provider,
        modelId: selected.modelId,
        duration: parseInt(duration),
      };

      if (sourceImage) body.image = sourceImage;
      if (advanced.aspectRatio) body.aspectRatio = advanced.aspectRatio;
      if (advanced.resolution) body.resolution = advanced.resolution;
      if (advanced.negativePrompt) body.negativePrompt = advanced.negativePrompt;
      if (advanced.cfgScale !== undefined) body.cfgScale = advanced.cfgScale;
      if (advanced.generateAudio !== undefined) body.generateAudio = advanced.generateAudio;
      if (advanced.cameraFixed !== undefined) body.cameraFixed = advanced.cameraFixed;
      if (advanced.seed !== undefined) body.seed = advanced.seed;

      const response = await fetch("/api/ai-demo/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to submit video generation");
      }
      setTaskId(result.data.taskId);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate video");
      setLoading(false);
    }
  };

  const handleComplete = useCallback((result: { videoUrl: string }) => {
    setVideoUrl(result.videoUrl);
    setLoading(false);
    setTaskId(null);
  }, []);

  const handleError = useCallback((error: string) => {
    toast.error(error);
    setLoading(false);
    setTaskId(null);
  }, []);

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
        <TabsTrigger value="text-to-video" disabled={loading}>
          {t("textToVideo")}
        </TabsTrigger>
        <TabsTrigger value="image-to-video" disabled={loading}>
          {t("imageToVideo")}
        </TabsTrigger>
      </TabsList>

      {/* Both tabs share the same layout — only model list & image section differ */}
      {(["text-to-video", "image-to-video"] as const).map((tab) => (
        <TabsContent key={tab} value={tab} className="mt-0">
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
                    models={models.map((m) => ({
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
                    placeholder={
                      isI2V ? t("motionPlaceholder") : t("promptPlaceholder")
                    }
                    disabled={loading}
                    maxLength={5000}
                  />
                </div>

                {/* Duration pills */}
                {currentModel.supportedDurations.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
                      <Clock className="h-3.5 w-3.5" />
                      {t("duration")}
                    </Label>
                    <div className="flex gap-2">
                      {currentModel.supportedDurations.map((d) => (
                        <button
                          key={d}
                          type="button"
                          disabled={loading}
                          onClick={() => setDuration(String(d))}
                          className={cn(
                            "h-10 min-w-[72px] px-4 rounded-lg border text-sm font-medium transition-all",
                            "hover:border-primary/50",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            duration === String(d)
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background text-foreground"
                          )}
                        >
                          {t("seconds", { count: d })}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Advanced Settings */}
                <VideoAdvancedSettings
                  capabilities={currentModel.capabilities}
                  values={advanced}
                  onChange={setAdvanced}
                  disabled={loading}
                />

                {/* Reference Image (only for I2V tab) */}
                {isI2V && (
                  <div>
                    <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
                      <ImagePlus className="h-3.5 w-3.5" />
                      {t("referenceImage")}
                    </Label>
                    {/* TODO [R2 Upload]: Replace base64 upload with R2 presigned URL upload.
                        When ImageUploader is updated to support presigned uploads (see its TODO),
                        use the returned R2 public URL as `sourceImage` instead of a base64 string.
                        This avoids sending large payloads to the server and eliminates the
                        server-side base64→R2 re-upload in kie-video.ts (ensureImageUrl). */}
                    <ImageUploader
                      value={sourceImage}
                      onChange={(v) => {
                        setSourceImage(v);
                        setVideoUrl(null);
                        setTaskId(null);
                      }}
                      maxSizeMB={10}
                      disabled={loading}
                    />
                  </div>
                )}

                {/* Generate Button */}
                <GenerateButton
                  onClick={handleGenerate}
                  loading={loading}
                  disabled={!prompt.trim() || (isI2V && !sourceImage)}
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
              <VideoResultArea
                taskId={taskId}
                videoUrl={videoUrl}
                loading={loading}
                provider={selected.provider}
                modelName={currentModel.name}
                onComplete={handleComplete}
                onError={handleError}
              />
            </div>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
