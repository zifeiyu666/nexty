"use client";

import {
  Edit3,
  Lightbulb,
  Loader2,
  Mic2,
  MicOff,
  Pause,
  Play,
  Sparkles,
  Upload,
  Wand2,
} from "lucide-react";
import type { RefObject } from "react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LiveRecordingPanel } from "@/components/voice/LiveRecordingPanel";
import { cn } from "@/lib/utils";

import { storyPlaceholders } from "../constants";
import { useWizardCopy, useWizardLocale } from "../i18n";
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
  blessingAnalyser: AnalyserNode | null;
  blessingElapsedSeconds: number;
  blessingMaxDurationSeconds: number | null;
  isUploadingBlessing: boolean;
  isPolishingStory: boolean;
  occasion: Occasion | null;
  story: string;
  storyTextareaRef: RefObject<HTMLTextAreaElement | null>;
  storyWordCount: number;
  spokenBlessing: string;
  spokenIntro: SpokenIntroDraft | null;
  spokenMode: "recording" | "text";
  blessingPlaybackTime: number;
  isBlessingPlaying: boolean;
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
  blessingAnalyser,
  blessingElapsedSeconds,
  blessingMaxDurationSeconds,
  isUploadingBlessing,
  isPolishingStory,
  occasion,
  story,
  storyTextareaRef,
  storyWordCount,
  spokenBlessing,
  spokenIntro,
  spokenMode,
  blessingPlaybackTime,
  isBlessingPlaying,
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
  const copy = useWizardCopy();
  const locale = useWizardLocale();
  const spokenIntroPreview = useMemo(() => {
    if (!spokenIntro?.transcript.trim()) return "";

    const transcriptWords = spokenIntro.transcript.trim().split(/\s+/);
    return transcriptWords.slice(0, 6).join(" ");
  }, [spokenIntro]);
  const transcriptSegments = useMemo(() => {
    if (!spokenIntro?.alignedWords?.length) return [];

    const segments: Array<{ text: string; startS: number; endS: number }> = [];

    for (let index = 0; index < spokenIntro.alignedWords.length; index += 4) {
      const chunk = spokenIntro.alignedWords.slice(index, index + 4);
      const text = chunk.map((item) => item.word).join(" ").trim();
      if (!text) continue;
      segments.push({
        text,
        startS: chunk[0]?.startS ?? 0,
        endS: chunk[chunk.length - 1]?.endS ?? chunk[0]?.endS ?? 0,
      });
    }

    return segments;
  }, [spokenIntro]);
  const activeTranscriptSegmentIndex = useMemo(() => {
    if (!transcriptSegments.length) return 0;

    const foundIndex = transcriptSegments.findIndex(
      (segment) =>
        blessingPlaybackTime >= segment.startS &&
        blessingPlaybackTime <= segment.endS,
    );

    if (foundIndex >= 0) return foundIndex;

    return transcriptSegments.reduce((activeIndex, segment, index) => {
      return blessingPlaybackTime >= segment.startS ? index : activeIndex;
    }, 0);
  }, [blessingPlaybackTime, transcriptSegments]);
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
          {copy.storyHeading}
        </div>
        <span className="text-sm font-semibold text-muted-foreground">
          100-200 {copy.words}
        </span>
      </div>
      <section className="mb-8 overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-black text-foreground">
              <Mic2 className="size-4 text-primary" /> {copy.openingBlessing} ({copy.optional})
            </div>
            {/* <p className="mt-1 text-sm font-medium text-muted-foreground">

            </p> */}
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {copy.openingBlessingHelp}
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
                {mode === "recording" ? copy.record : copy.typeMessage}
              </button>
            ))}
          </div>
        </div>
        <div className="p-5">
          {spokenMode === "text" ? (
            <Textarea
              className="min-h-[100px] resize-y rounded-xl border-border bg-background text-base leading-7"
              maxLength={1000}
              placeholder={copy.messagePlaceholder}
              value={spokenBlessing}
              onChange={(event) => onSpokenBlessingChange(event.target.value)}
            />
          ) : (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {!isRecordingBlessing && (
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0 rounded-full font-bold"
                  onClick={onToggleBlessingRecording}
                  disabled={isUploadingBlessing}
                >
                  <Mic2 className="size-4" />
                  {copy.record}
                </Button>
              )}
              <label
                className={cn(
                  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground",
                  isRecordingBlessing && "pointer-events-none opacity-50",
                )}
              >
                <Upload className="size-4" /> {copy.uploadAudio}
                <input
                  className="sr-only"
                  type="file"
                  accept="audio/webm,audio/mpeg,audio/mp4,audio/wav,audio/ogg"
                  disabled={isRecordingBlessing}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) onUploadBlessing(file);
                    event.currentTarget.value = "";
                  }}
                />
              </label>
              {isUploadingBlessing ? (
                <span className="text-sm font-semibold text-primary">
                  {copy.transcribing}
                </span>
              ) : null}
              {spokenIntro ? (
                <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-primary/15 bg-primary/[0.03] px-3 py-3 text-sm font-semibold text-foreground sm:ml-auto">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "relative size-11 shrink-0 rounded-full border border-primary/15 bg-background shadow-sm transition-all hover:bg-primary/5",
                      isBlessingPlaying &&
                        "border-primary/40 bg-primary/[0.08] shadow-[0_0_0_6px_rgba(239,68,48,0.08)]",
                    )}
                    onClick={onToggleBlessingPlayback}
                  >
                    <span className="pointer-events-none absolute inset-0 rounded-full bg-primary/10 opacity-0 transition-opacity duration-300 motion-safe:animate-pulse" />
                    {isBlessingPlaying ? (
                      <Pause className="relative z-10 size-4 text-primary" />
                    ) : (
                      <Play className="relative z-10 size-4 text-primary" />
                    )}
                  </Button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 items-end gap-1">
                        {[0, 1, 2, 3].map((bar) => (
                          <span
                            key={bar}
                            className={cn(
                              "block w-1 rounded-full bg-primary/35 transition-all",
                              isBlessingPlaying && "motion-safe:animate-[song-wave_0.9s_ease-in-out_infinite]",
                            )}
                            style={{
                              animationDelay: `${bar * 0.12}s`,
                              height: isBlessingPlaying
                                ? `${14 + ((bar % 2) + 1) * 6}px`
                                : `${10 + bar * 2}px`,
                            }}
                          />
                        ))}
                      </div>
                      <span className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-primary/70">
                        {isBlessingPlaying ? "Playing your intro" : "Voice intro ready"}
                      </span>
                    </div>
                    <div className="mt-2 overflow-hidden">
                      {isBlessingPlaying && transcriptSegments.length ? (
                        <div
                          className="transition-transform duration-500 ease-out"
                          style={{
                            transform: `translateY(-${activeTranscriptSegmentIndex * 1.9}rem)`,
                          }}
                        >
                          {transcriptSegments.map((segment, index) => (
                            <p
                              key={`${segment.startS}-${segment.endS}-${index}`}
                              className={cn(
                                "h-[1.9rem] truncate text-sm leading-[1.9rem] text-muted-foreground transition-all duration-300",
                                index === activeTranscriptSegmentIndex
                                  ? "font-bold text-foreground"
                                  : "opacity-55",
                              )}
                            >
                              {segment.text}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="truncate text-sm text-muted-foreground">
                          {spokenIntroPreview}
                          {spokenIntroPreview &&
                          spokenIntro.transcript.trim().split(/\s+/).length > 6
                            ? "..."
                            : ""}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 text-sm text-muted-foreground">
                    {Math.ceil(spokenIntro.durationSeconds)}s
                  </span>
                </div>
              ) : (
                <span className="text-sm font-medium text-muted-foreground">
                  {copy.recordingLength}
                </span>
              )}
              </div>
              {isRecordingBlessing && (
                <LiveRecordingPanel
                  analyser={blessingAnalyser}
                  description="Recording in progress. Speak your opening blessing now."
                  elapsedSeconds={blessingElapsedSeconds}
                  maxDurationSeconds={blessingMaxDurationSeconds}
                  onStop={onToggleBlessingRecording}
                  stopLabel={copy.stop}
                />
              )}
            </>
          )}
        </div>
      </section>
      <div className="mb-2 flex flex-wrap items-center gap-2 sm:gap-3">
        <Button
          className="shrink-0 whitespace-nowrap rounded-full bg-card px-3 py-2 text-sm font-bold text-foreground shadow-sm hover:bg-primary/10 hover:text-primary sm:px-4"
          type="button"
          variant="ghost"
          onClick={onOpenHelper}
        >
          <Wand2 className="hidden size-5 text-primary sm:block" />
          {copy.storyHelper}
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
          {isRecording ? copy.stop : copy.record}
        </Button>
        {isRecording && (
          <span className="hidden text-sm font-semibold text-primary/70 sm:inline">
            Listening...
          </span>
        )}
        <Button
          className="shrink-0 whitespace-nowrap rounded-full bg-primary/10 px-3 py-2 text-sm font-bold text-primary shadow-sm hover:bg-primary/15 sm:ml-auto sm:px-4"
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
          {isPolishingStory ? copy.aiPolishing : copy.aiPolish}
        </Button>
      </div>
      <Textarea
        ref={storyTextareaRef}
        className="min-h-[230px] resize-y rounded-2xl border-border bg-card p-5 text-base leading-8 text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:border-primary/60 focus-visible:ring-primary/20"
        placeholder={
          occasion && locale === "en"
            ? storyPlaceholders[occasion]
            : copy.storyPlaceholder
        }
        value={story}
        onChange={(event) => onStoryChange(event.target.value)}
      />
      <div className="-mt-9 mr-4 flex justify-end text-sm text-muted-foreground">
        {storyWordCount} {copy.words}
      </div>
      <div className="mt-8 flex gap-4 rounded-2xl border border-primary/20 bg-primary/10 p-5 text-muted-foreground">
        <Lightbulb className="mt-1 size-5 shrink-0 text-primary" />
        <div className="text-base leading-7">
          <p>
            <span className="font-black text-foreground">{copy.tip}</span>{" "}
            {copy.tipIntro}{" "}
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
            {copy.tipOutro}
          </p>
          <p className="mt-1 text-sm font-semibold text-muted-foreground/85">
            {copy.clickTemplates}
          </p>
        </div>
      </div>
    </div>
  );
}
