"use client";

// TODO [Multimodal - Image Attachments]: To support sending images in the prompt
//   (for vision-capable models like GPT-4o, Claude, Gemini), add an image attachment
//   feature. Recommended flow:
//   1. Add an <ImageUploader> or file input alongside the prompt textarea
//   2. Upload the image to R2 via presigned URL (client-side) using generateUserPresignedUploadUrl()
//      from actions/r2-resources/index.ts — do NOT send base64 in the chat body
//   3. Include the R2 public URL in the messages parts array sent to /api/ai-demo/chat
//   4. In the chat route, pass the image URL to the AI SDK message parts
//   Check the model's `input.image` capability flag in config/ai-models.ts before enabling.

// TODO [Auth - Login Guard]: For production, wrap this component in an auth guard.
//   Check the user's session and redirect unauthenticated users to the login page.
//   Use the useSession() hook from @/lib/auth/client or check server-side in the page component.

import GenerateButton from "@/components/ai-demo/shared/GenerateButton";
import ModelSelector from "@/components/ai-demo/shared/ModelSelector";
import PromptInput from "@/components/ai-demo/shared/PromptInput";
import CopyButton from "@/components/shared/CopyButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LANGUAGE_MODELS } from "@/config/ai-models";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  Bot,
  ChevronDown,
  ChevronRight,
  FileText,
  Layers,
  RefreshCw,
  Sparkles,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

function ReasoningBlock({
  text,
  isStreaming,
}: {
  text: string;
  isStreaming?: boolean;
}) {
  const [expanded, setExpanded] = useState(true); // default open for single-turn
  return (
    <div className="mb-3 rounded-lg border border-primary/20 bg-primary/5 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
      >
        <Zap className="h-3 w-3" />
        <span>Reasoning</span>
        {isStreaming && (
          <span className="ml-1 inline-block w-1 h-3 bg-primary animate-pulse rounded-sm" />
        )}
        {expanded ? (
          <ChevronDown className="h-3 w-3 ml-auto" />
        ) : (
          <ChevronRight className="h-3 w-3 ml-auto" />
        )}
      </button>
      {expanded && (
        <div className="px-3 pb-3 text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed border-t border-primary/20 pt-2 max-h-48 overflow-y-auto">
          {text}
        </div>
      )}
    </div>
  );
}

export default function SingleTurnChat() {
  const t = useTranslations("AIDemo.chat");
  const [selected, setSelected] = useState<{
    provider: string;
    modelId: string;
  }>({
    provider: LANGUAGE_MODELS[0].provider,
    modelId: LANGUAGE_MODELS[0].id,
  });

  const [prompt, setPrompt] = useState("");
  const [elapsedMs, setElapsedMs] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  const [transport] = useState(
    () =>
      new DefaultChatTransport({
        api: "/api/ai-demo/chat",
        body: () => ({
          modelId: selectedRef.current.modelId,
          provider: selectedRef.current.provider,
        }),
      })
  );

  const { messages, sendMessage, status, setMessages } = useChat({
    transport,
    onError: (error: any) => {
      let errorMessage: string;
      try {
        const parsedError = JSON.parse(error.message);
        errorMessage = parsedError.error || "Failed to generate response";
      } catch {
        errorMessage = error.message || "Failed to generate response";
      }
      toast.error(errorMessage);
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Get the latest assistant message
  const lastAssistantMessage = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");

  const textParts =
    lastAssistantMessage?.parts?.filter((p: any) => p.type === "text") ?? [];
  const reasoningParts =
    lastAssistantMessage?.parts?.filter((p: any) => p.type === "reasoning") ??
    [];
  const completion = textParts.map((p: any) => p.text).join("");

  // Timer for elapsed time during generation
  useEffect(() => {
    if (isLoading) {
      startTimeRef.current = Date.now();
      setElapsedMs(0);
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - (startTimeRef.current ?? Date.now()));
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLoading]);

  const handleSubmit = () => {
    const text = prompt.trim();
    if (!text || isLoading) return;
    setMessages([]);
    sendMessage({ text });
  };

  const handleClear = () => {
    setPrompt("");
    setMessages([]);
  };

  const selectedModelConfig = LANGUAGE_MODELS.find(
    (m) => m.provider === selected.provider && m.id === selected.modelId
  );

  const formatElapsed = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const isStreamingReasoning =
    isLoading && reasoningParts.some((p: any) => p.state === "streaming");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left: Input Panel */}
      <Card>
        <CardContent className="p-5 space-y-5">
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
              <Layers className="h-3.5 w-3.5" />
              {t("model")}
            </Label>
            <ModelSelector
              models={LANGUAGE_MODELS.map((m) => ({
                provider: m.provider,
                id: m.id,
                name: m.name,
              }))}
              value={selected}
              onChange={setSelected}
              disabled={isLoading}
              className="w-full"
            />
            {selectedModelConfig && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {selectedModelConfig.outputSupport.includes("reasoning") && (
                  <Badge
                    variant="secondary"
                    className="text-xs gap-1 bg-primary/10 text-primary"
                  >
                    <Zap className="h-3 w-3" />
                    {t("reasoning")}
                  </Badge>
                )}
                {selectedModelConfig.inputSupport.includes("image") && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    Vision
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
              <FileText className="h-3.5 w-3.5" />
              {t("yourQuestion")}
            </Label>
            <PromptInput
              value={prompt}
              onChange={setPrompt}
              onSubmit={handleSubmit}
              placeholder={t("promptPlaceholder")}
              disabled={isLoading}
              maxLength={4000}
            />
          </div>

          <div className="flex gap-2">
            <GenerateButton
              onClick={handleSubmit}
              loading={isLoading}
              disabled={!prompt?.trim()}
              loadingText={t("generating")}
              onCancel={() => {}}
              className="flex-1"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {t("generateResponse")}
            </GenerateButton>
            {(prompt || completion) && !isLoading && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleClear}
                title={t("clear")}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Right: Response Panel */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-foreground/80">
            {t("response")}
          </div>
          <div className="flex items-center gap-2">
            {isLoading && (
              <span className="text-xs text-muted-foreground animate-pulse">
                {formatElapsed(elapsedMs)}
              </span>
            )}
            {completion && !isLoading && (
              <span className="text-xs text-muted-foreground">
                {t("chars", { count: completion.length })}
              </span>
            )}
            {completion && <CopyButton text={completion} variant="ghost" />}
          </div>
        </div>

        <Card className="flex-1 min-h-[320px] p-0">
          <CardContent className="p-4 h-full overflow-y-auto">
            {isLoading && !completion && reasoningParts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-primary"></span>
                  </span>
                </div>
                <div className="text-sm">{t("thinking")}</div>
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" />
                </div>
              </div>
            ) : completion || reasoningParts.length > 0 ? (
              <div className="space-y-2">
                {/* Reasoning blocks */}
                {reasoningParts.map((part: any, i: number) => (
                  <ReasoningBlock
                    key={i}
                    text={part.text ?? ""}
                    isStreaming={
                      isStreamingReasoning && part.state === "streaming"
                    }
                  />
                ))}
                {/* Main response */}
                {(completion || isLoading) && (
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed">
                    {completion}
                    {isLoading && completion && (
                      <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse align-middle" />
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">{t("readyToRespond")}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {t("responseAppearHere")}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
