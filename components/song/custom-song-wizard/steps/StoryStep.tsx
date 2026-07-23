"use client";

import {
  Edit3,
  Lightbulb,
  Loader2,
  Mic2,
  MicOff,
  Play,
  Sparkles,
  Upload,
  Wand2,
} from "lucide-react";
import type { RefObject } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { storyPlaceholders } from "../constants";
import type { Occasion, SpokenIntroDraft } from "../types";

const detailTemplates = [
  { label: "Nickname", text: "[Nickname: ]" },
  { label: "Shared Memory", text: "[Remember when we: ]" },
  { label: "Quirks", text: "[Their funny habit/quirk: ]" },
  { label: "Proud Moment", text: "[Something they are proud of: ]" },
];

type StoryStepProps = {
  isRecording: boolean;
  isRecordingBlessing: boolean;
  isUploadingBlessing: boolean;
  isPolishingStory: boolean;
  occasion: Occasion | null;
  story: string;
  storyTextareaRef: RefObject<HTMLTextAreaElement | null>;
  storyWordCount: number;
  spokenBlessing: string;
  spokenIntro: SpokenIntroDraft | null;
  spokenMode: "recording" | "text";
  onOpenHelper: () => void;
  onPolishStory: () => void;
  onStoryChange: (value: string) => void;
  onToggleRecording: () => void;
  onSpokenBlessingChange: (value: string) => void;
  onSpokenModeChange: (value: "recording" | "text") => void;
  onToggleBlessingRecording: () => void;
  onUploadBlessing: (file: File) => void;
  onToggleBlessingPlayback: () => void;
};

export function StoryStep({
  isRecording,
  isRecordingBlessing,
  isUploadingBlessing,
  isPolishingStory,
  occasion,
  story,
  storyTextareaRef,
  storyWordCount,
  spokenBlessing,
  spokenIntro,
  spokenMode,
  onOpenHelper,
  onPolishStory,
  onStoryChange,
  onToggleRecording,
  onSpokenBlessingChange,
  onSpokenModeChange,
  onToggleBlessingRecording,
  onUploadBlessing,
  onToggleBlessingPlayback,
}: StoryStepProps) {
  function insertTemplate(template: string) {
    const textarea = storyTextareaRef.current;

    if (!textarea) {
      const separator = story.trim().length ? "\n\n" : "";
      onStoryChange(`${story}${separator}${template}`);
      return;
    }

    const start = textarea.selectionStart ?? story.length;
    const end = textarea.selectionEnd ?? story.length;
    const before = story.slice(0, start);
    const after = story.slice(end);
    const separator =
      before && !before.endsWith(" ") && !before.endsWith("\n") ? " " : "";
    const nextStory = `${before}${separator}${template}${after}`;
    const nextCursor = start + separator.length + template.length - 1;

    onStoryChange(nextStory);
    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  }

  return (
    <div className="mx-auto mt-16 max-w-5xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-lg font-black text-foreground">
          <Edit3 className="size-5 text-primary" />
          Your story
        </div>
        <span className="text-sm font-semibold text-muted-foreground">
          100-200 words works best
        </span>
      </div>
      <div className="mb-4 flex flex-nowrap items-center gap-2 sm:gap-3">
        <Button
          className="shrink-0 whitespace-nowrap rounded-full bg-card px-3 py-2 text-sm font-bold text-foreground shadow-sm hover:bg-primary/10 hover:text-primary sm:px-4"
          type="button"
          variant="ghost"
          onClick={onOpenHelper}
        >
          <Wand2 className="hidden size-5 text-primary sm:block" />
          Help me write
        </Button>
        <Button
          className={cn(
            "shrink-0 whitespace-nowrap rounded-full px-3 text-sm font-bold shadow-sm sm:px-4",
            isRecording
              ? "bg-primary/10 text-primary hover:bg-primary/15"
              : "bg-card text-foreground hover:bg-primary/10 hover:text-primary",
          )}
          type="button"
          variant="ghost"
          onClick={onToggleRecording}
        >
          {isRecording ? (
            <MicOff className="hidden size-5 text-primary sm:block" />
          ) : (
            <Mic2 className="hidden size-5 text-primary sm:block" />
          )}
          {isRecording ? "Stop recording" : "Speak"}
        </Button>
        {isRecording && (
          <span className="hidden text-sm font-semibold text-primary/70 sm:inline">
            Listening...
          </span>
        )}
        <Button
          className="ml-auto shrink-0 whitespace-nowrap rounded-full bg-primary/10 px-3 py-2 text-sm font-bold text-primary shadow-sm hover:bg-primary/15 sm:px-4"
          disabled={isPolishingStory || story.trim().length < 10}
          type="button"
          variant="ghost"
          onClick={onPolishStory}
        >
          {isPolishingStory ? (
            <Loader2 className="hidden size-5 animate-spin text-primary sm:block" />
          ) : (
            <Sparkles className="hidden size-5 text-primary sm:block" />
          )}
          {isPolishingStory ? "AI polishing..." : "AI polish story"}
        </Button>
      </div>
      <section className="mb-8 overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-black text-foreground">
              <Mic2 className="size-4 text-primary" /> Opening blessing
            </div>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              Optional: begin with your own voice or an AI narration.
            </p>
          </div>
          <div
            className="inline-flex rounded-lg bg-muted p-1"
            role="group"
            aria-label="Opening blessing mode"
          >
            {(["recording", "text"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onSpokenModeChange(mode)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-bold transition",
                  spokenMode === mode
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {mode === "recording" ? "My voice" : "AI narration"}
              </button>
            ))}
          </div>
        </div>
        <div className="p-5">
          {spokenMode === "text" ? (
            <Textarea
              className="min-h-[100px] resize-y rounded-xl border-border bg-background text-base leading-7"
              maxLength={1000}
              placeholder="e.g. Happy birthday, Mom. I hope this song makes you smile today..."
              value={spokenBlessing}
              onChange={(event) => onSpokenBlessingChange(event.target.value)}
            />
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "shrink-0 rounded-full font-bold",
                  isRecordingBlessing &&
                    "border-primary bg-primary/10 text-primary",
                )}
                onClick={onToggleBlessingRecording}
                disabled={isUploadingBlessing}
              >
                {isRecordingBlessing ? (
                  <MicOff className="size-4" />
                ) : (
                  <Mic2 className="size-4" />
                )}
                {isRecordingBlessing ? "Stop recording" : "Record my blessing"}
              </Button>
              <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground">
                <Upload className="size-4" /> Upload audio
                <input
                  className="sr-only"
                  type="file"
                  accept="audio/webm,audio/mpeg,audio/mp4,audio/wav,audio/ogg"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) onUploadBlessing(file);
                    event.currentTarget.value = "";
                  }}
                />
              </label>
              {isUploadingBlessing ? (
                <span className="text-sm font-semibold text-primary">
                  Transcribing your blessing...
                </span>
              ) : null}
              {spokenIntro ? (
                <div className="flex min-w-0 items-center gap-3 text-sm font-semibold text-foreground sm:ml-auto">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-8 rounded-full"
                    onClick={onToggleBlessingPlayback}
                  >
                    <Play className="size-4" />
                  </Button>
                  <span className="truncate">{spokenIntro.transcript}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {Math.ceil(spokenIntro.durationSeconds)}s
                  </span>
                </div>
              ) : (
                <span className="text-sm font-medium text-muted-foreground">
                  10-30 seconds works best
                </span>
              )}
            </div>
          )}
          {spokenMode === "recording" && spokenIntro ? (
            <Textarea
              className="mt-4 min-h-[76px] resize-y rounded-xl border-border bg-muted/40 text-sm leading-6"
              value={spokenIntro.transcript}
              onChange={(event) => onSpokenBlessingChange(event.target.value)}
            />
          ) : null}
        </div>
      </section>
      <Textarea
        ref={storyTextareaRef}
        className="min-h-[230px] resize-y rounded-2xl border-border bg-card p-5 text-base leading-8 text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:border-primary/60 focus-visible:ring-primary/20"
        placeholder={
          occasion
            ? storyPlaceholders[occasion]
            : "e.g., Tell us about the person, the moment, and the details that should become lyrics..."
        }
        value={story}
        onChange={(event) => onStoryChange(event.target.value)}
      />
      <div className="-mt-9 mr-4 flex justify-end text-sm text-muted-foreground">
        {storyWordCount} words
      </div>
      <div className="mt-8 flex gap-4 rounded-2xl border border-primary/20 bg-primary/10 p-5 text-muted-foreground">
        <Lightbulb className="mt-1 size-5 shrink-0 text-primary" />
        <div className="text-base leading-7">
          <p>
            <span className="font-black text-foreground">Tip:</span> Add a{" "}
            {detailTemplates.map((template, index) => (
              <span key={template.label}>
                <button
                  className="font-black text-foreground underline decoration-primary decoration-2 underline-offset-4 transition hover:text-primary"
                  type="button"
                  onClick={() => insertTemplate(template.text)}
                >
                  {template.label}
                </button>
                {index === detailTemplates.length - 2
                  ? ", or a "
                  : index < detailTemplates.length - 1
                    ? ", a "
                    : ""}
              </span>
            ))}{" "}
            to make the lyrics truly one-of-a-kind.
          </p>
          <p className="mt-1 text-sm font-semibold text-muted-foreground/85">
            Click words to use templates.
          </p>
        </div>
      </div>
    </div>
  );
}
