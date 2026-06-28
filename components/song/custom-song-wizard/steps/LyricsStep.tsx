"use client";

import { Edit3, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  EditableLyricLine,
  LyricsLineRewriteSuggestion,
} from "@/lib/ai/song-lyrics";

import type { LyricsStage } from "../types";
import {
  EditableBlock,
  LyricsGenerationView,
  LyricsLineEditor,
} from "../components/wizard-ui";

type LyricsStepProps = {
  editableLyricLines: EditableLyricLine[];
  lyricLoadingStep: number;
  lyricRewriteError: string;
  lyricRewriteInstruction: string;
  lyricRewriteSuggestions: LyricsLineRewriteSuggestion[];
  lyricsError: string;
  lyricsStage: LyricsStage;
  recipientNameList: string[];
  selectedLyricLineIds: string[];
  songTitle: string;
  isRewritingLyricLines: boolean;
  onAcceptLyricRewriteSuggestion: (lineId: string) => void;
  onKeepOriginalLyricLine: (lineId: string) => void;
  onLyricLineChange: (lineId: string, text: string) => void;
  onLyricLineSelectionChange: (lineId: string, selected: boolean) => void;
  onLyricRewriteInstructionChange: (value: string) => void;
  onOpenNewLyricsVersionDialog: () => void;
  onRewriteLyrics: () => void;
  onRewriteSelectedLyricLines: () => void;
  onSongTitleChange: (value: string) => void;
};

export function LyricsStep({
  editableLyricLines,
  lyricLoadingStep,
  lyricRewriteError,
  lyricRewriteInstruction,
  lyricRewriteSuggestions,
  lyricsError,
  lyricsStage,
  recipientNameList,
  selectedLyricLineIds,
  songTitle,
  isRewritingLyricLines,
  onAcceptLyricRewriteSuggestion,
  onKeepOriginalLyricLine,
  onLyricLineChange,
  onLyricLineSelectionChange,
  onLyricRewriteInstructionChange,
  onOpenNewLyricsVersionDialog,
  onRewriteLyrics,
  onRewriteSelectedLyricLines,
  onSongTitleChange,
}: LyricsStepProps) {
  if (lyricsStage === "loading") {
    return (
      <LyricsGenerationView
        activeStep={lyricLoadingStep}
        names={recipientNameList}
      />
    );
  }

  return (
    <div className="mx-auto mt-14 max-w-5xl space-y-4">
      {lyricsError && (
        <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
          <p className="font-bold text-foreground">Lyrics generation failed</p>
          <p className="mt-1 leading-6">{lyricsError}</p>
          <Button
            className="mt-3 h-9 rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground hover:bg-primary/90"
            type="button"
            onClick={onRewriteLyrics}
          >
            <RefreshCw className="size-4" />
            Try again
          </Button>
        </div>
      )}
      <EditableBlock
        actionText="You can edit"
        icon={<span className="text-primary">Aa</span>}
        label="Song Title"
      >
        <Input
          className="h-auto rounded-xl border-0 bg-muted px-3.5 py-3 text-base font-bold text-foreground shadow-none focus-visible:ring-primary/25 md:text-xl"
          value={songTitle}
          onChange={(event) => onSongTitleChange(event.target.value)}
        />
      </EditableBlock>

      <EditableBlock
        actionText="Write a new version"
        icon={<Edit3 className="size-4 text-primary" />}
        label="Lyrics"
        onAction={onOpenNewLyricsVersionDialog}
      >
        <LyricsLineEditor
          error={lyricRewriteError}
          instruction={lyricRewriteInstruction}
          isRewriting={isRewritingLyricLines}
          lines={editableLyricLines}
          selectedLineIds={selectedLyricLineIds}
          suggestions={lyricRewriteSuggestions}
          onAcceptSuggestion={onAcceptLyricRewriteSuggestion}
          onInstructionChange={onLyricRewriteInstructionChange}
          onKeepOriginal={onKeepOriginalLyricLine}
          onLineChange={onLyricLineChange}
          onRewriteSelected={onRewriteSelectedLyricLines}
          onSelectionChange={onLyricLineSelectionChange}
        />
      </EditableBlock>
    </div>
  );
}
