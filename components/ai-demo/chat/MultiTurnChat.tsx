"use client";

// TODO [Persist Conversation]: Multi-turn conversations are currently in-memory only
//   (React state via useChat). For production, persist sessions to the database:
//   1. Assign a sessionId (UUID) to each conversation on first message
//   2. Save each message to the DB in the /api/ai-demo/chat route's onFinish callback
//      Schema: ai_chat_messages { id, sessionId, userId, role, content, provider, modelId, createdAt }
//   3. Load previous messages from DB when the user revisits (via a session history page)
//   4. Add a "Load history" button that fetches past sessions from a Server Action

// TODO [Multimodal - Image Attachments]: Same as SingleTurnChat — see its TODO.
//   The AI SDK useChat hook supports attachments via the experimental_attachments option.
//   Upload images to R2 first (presigned URL), then include the R2 URL in the message.

import ModelSelector from "@/components/ai-demo/shared/ModelSelector";
import CopyButton from "@/components/shared/CopyButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LANGUAGE_MODELS } from "@/config/ai-models";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  Bot,
  ChevronDown,
  ChevronRight,
  Layers,
  Loader2,
  SendIcon,
  Trash2,
  User,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-end gap-2 max-w-[80%]">
        <div className="shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center shadow-sm">
          <Bot className="h-4 w-4 text-white" />
        </div>
        <div className="rounded-2xl rounded-bl-sm px-4 py-3 bg-muted shadow-sm">
          <div className="flex gap-1 items-center h-4">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.3s]" />
            <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.15s]" />
            <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ReasoningBlock({
  text,
  isStreaming,
}: {
  text: string;
  isStreaming?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mb-2 rounded-lg border border-primary/20 bg-primary/5 overflow-hidden">
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
        <div className="px-3 pb-3 text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed border-t border-primary/20 pt-2">
          {text}
        </div>
      )}
    </div>
  );
}

function MessageBubble({
  message,
  isStreaming,
}: {
  message: any;
  isStreaming: boolean;
}) {
  const isUser = message.role === "user";

  const textContent =
    message.parts
      ?.filter((p: any) => p.type === "text")
      .map((p: any) => p.text)
      .join("") ?? "";

  const reasoningParts =
    message.parts?.filter((p: any) => p.type === "reasoning") ?? [];

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} group`}>
      <div
        className={`flex items-end gap-2 max-w-[80%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Avatar */}
        <div
          className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center shadow-sm ${
            isUser ? "bg-secondary text-secondary-foreground" : "bg-primary"
          }`}
        >
          {isUser ? (
            <User className="h-4 w-4 text-white" />
          ) : (
            <Bot className="h-4 w-4 text-white" />
          )}
        </div>

        {/* Bubble */}
        <div className="space-y-1">
          {/* Reasoning (AI only) */}
          {!isUser && reasoningParts.length > 0 && (
            <div>
              {reasoningParts.map((part: any, i: number) => (
                <ReasoningBlock
                  key={i}
                  text={part.text ?? ""}
                  isStreaming={isStreaming && part.state === "streaming"}
                />
              ))}
            </div>
          )}

          <div
            className={`relative rounded-2xl px-4 py-3 shadow-sm ${
              isUser
                ? "rounded-br-sm bg-primary text-primary-foreground"
                : "rounded-bl-sm bg-muted"
            }`}
          >
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {textContent}
              {isStreaming && !isUser && (
                <span className="inline-block w-0.5 h-4 bg-foreground/60 ml-0.5 animate-pulse align-middle" />
              )}
            </div>

            {/* Copy button (hover) */}
            {textContent && (
              <CopyButton
                text={textContent}
                variant="bubble"
                className={`absolute -top-2 ${isUser ? "left-2" : "right-2"} opacity-0 group-hover:opacity-100 transition-opacity`}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MultiTurnChat() {
  const t = useTranslations("AIDemo.chat");
  const [selected, setSelected] = useState<{
    provider: string;
    modelId: string;
  }>({
    provider: LANGUAGE_MODELS[0].provider,
    modelId: LANGUAGE_MODELS[0].id,
  });

  const [input, setInput] = useState("");
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  const viewportRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    await sendMessage({ text });
  };

  const handleClearChat = () => {
    setMessages([]);
    setInput("");
  };

  const isLoading = status === "streaming" || status === "submitted";
  const showTypingIndicator =
    isLoading && messages[messages.length - 1]?.role === "user";

  // Auto-scroll to bottom within the chat viewport
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, showTypingIndicator]);

  const selectedModelConfig = LANGUAGE_MODELS.find(
    (m) => m.provider === selected.provider && m.id === selected.modelId
  );

  return (
    <div className="space-y-4">
      {/* Model selector row */}
      <div className="flex items-start gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
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
            className="w-full md:w-72"
          />
          {selectedModelConfig?.outputSupport.includes("reasoning") && (
            <Badge
              variant="secondary"
              className="mt-1.5 text-xs gap-1 bg-primary/10 text-primary"
            >
              <Zap className="h-3 w-3" />
              {t("reasoning")}
            </Badge>
          )}
        </div>

        {messages.length > 0 && (
          <div className="pt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearChat}
              className="gap-1.5 text-muted-foreground hover:text-destructive hover:border-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t("clearChat")}
            </Button>
          </div>
        )}
      </div>

      {/* Chat window */}
      <Card className="w-full flex flex-col" style={{ height: "520px" }}>
        <CardContent className="flex-1 p-0 flex flex-col h-full overflow-hidden">
          {/* Messages area — native scrollable div for reliable scroll control */}
          <div
            ref={viewportRef}
            className="flex-1 overflow-y-auto px-4 py-4 min-h-0"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center p-8 gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground/70">
                    {t("startConversation")}
                  </p>
                  <p className="text-sm mt-1 opacity-60">
                    {t("startConversationDescription")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pb-2">
                {messages.map((message, index) => {
                  const isLastMessage = index === messages.length - 1;
                  const isStreaming =
                    isLoading && isLastMessage && message.role === "assistant";
                  return (
                    <MessageBubble
                      key={message.id ?? index}
                      message={message}
                      isStreaming={isStreaming}
                    />
                  );
                })}
                {showTypingIndicator && <TypingIndicator />}
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="border-t p-3 bg-background/50">
            <div className="flex items-end gap-2">
              <Textarea
                ref={textareaRef}
                placeholder={t("typePlaceholder")}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (!isLoading && input.trim()) handleSend();
                  }
                }}
                disabled={isLoading}
                rows={1}
                className="resize-none min-h-[40px] max-h-[120px] flex-1 text-sm"
                style={{
                  height: "auto",
                  overflowY: input.split("\n").length > 3 ? "auto" : "hidden",
                }}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="shrink-0 h-10 w-10"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <SendIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 px-1">
              {messages.length > 0 && (
                <span>{t("messages", { count: messages.length })} · </span>
              )}
              {t("enterToSend")} · {t("shiftEnterNewLine")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
