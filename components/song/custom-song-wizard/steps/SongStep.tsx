"use client";

import {
  Cake,
  Gift,
  Heart,
  Languages,
  Loader2,
  Mic2,
  RefreshCw,
} from "lucide-react";
import type { RefObject } from "react";

import ChooseButton from "@/components/song/ChooseButton";
import {
  SongResultView,
  type SongResultMetadataPill,
} from "@/components/song/song-result/SongResultView";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { SongGenerationPage } from "../components/wizard-ui";
import type {
  CaptureLeadResponse,
  Occasion,
  SongStage,
  SongVersion,
} from "../types";

type SelectedOccasionLike =
  | {
      title: string;
      value: Occasion;
    }
  | undefined;

type SongStepProps = {
  activeVersion: string;
  audioRef: RefObject<HTMLAudioElement | null>;
  coverError: string;
  coverImageUrl: string;
  coverPrompt: string;
  currentVersion?: SongVersion;
  displayDuration: number;
  finalizingVersion: string | null;
  generatedLyrics: string;
  genre: string;
  language: string;
  leadData: CaptureLeadResponse | null;
  personalNote: string;
  previewLimitSeconds: number | null;
  previewTime: number;
  progress: number;
  recipientLabel: string;
  selectedOccasion: SelectedOccasionLike;
  songError: string;
  songStage: SongStage;
  songTitle: string;
  songVersions: SongVersion[];
  story: string;
  vocalGender: string;
  isGeneratingCover: boolean;
  isUploadingCover: boolean;
  isMockMode: boolean;
  isPlaying: boolean;
  onChooseVersion: (version: string) => void;
  onGenerateCover: () => void;
  onUploadCover: (file: File) => void;
  onNoteChange: (value: string) => void;
  onSaveNote: () => void;
  onPlaybackToggle: (version: string, audioUrl: string) => void;
  onRespin: () => void;
  onRetryGeneration: () => void;
};

export function SongStep({
  activeVersion,
  audioRef,
  coverError,
  coverImageUrl,
  coverPrompt,
  currentVersion,
  displayDuration,
  finalizingVersion,
  generatedLyrics,
  genre,
  language,
  personalNote,
  previewTime,
  progress,
  recipientLabel,
  selectedOccasion,
  songError,
  songStage,
  songTitle,
  songVersions,
  vocalGender,
  isGeneratingCover,
  isUploadingCover,
  isMockMode,
  isPlaying,
  onChooseVersion,
  onGenerateCover,
  onUploadCover,
  onNoteChange,
  onSaveNote,
  onPlaybackToggle,
  onRespin,
  onRetryGeneration,
}: SongStepProps) {
  if (songStage === "loading") {
    if (songError) {
      return (
        <div className="mx-auto mt-16 max-w-xl rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <RefreshCw className="size-5" />
          </div>
          <h2 className="text-xl font-black text-foreground">
            Song generation needs another try
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {songError}
          </p>
          <Button
            className="mt-5 h-11 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground hover:bg-primary/90"
            type="button"
            onClick={onRetryGeneration}
          >
            <RefreshCw className="size-4" />
            Try again
          </Button>
        </div>
      );
    }

    return (
      <SongGenerationPage
        coverError={coverError}
        coverImageUrl={coverImageUrl}
        coverPrompt={coverPrompt}
        isGeneratingCover={isGeneratingCover}
        isUploadingCover={isUploadingCover}
        isMockMode={isMockMode}
        note={personalNote}
        onGenerateCover={onGenerateCover}
        onUploadCover={onUploadCover}
        onNoteChange={onNoteChange}
        onSaveNote={onSaveNote}
        progress={progress}
        recipientLabel={recipientLabel}
      />
    );
  }

  const displayTitle = songTitle || "Your Custom Song";
  const resultCoverImageUrl =
    coverImageUrl || currentVersion?.imageUrl || songVersions[0]?.imageUrl;
  const metadataPills: SongResultMetadataPill[] = [
    {
      icon: <Heart className="size-4" />,
      label: selectedOccasion?.title || "For someone special",
    },
    {
      icon: <Cake className="size-4" />,
      label: selectedOccasion?.title.split("/")[0].trim() || "Birthday",
    },
    { icon: <Gift className="size-4" />, label: genre },
    { icon: <Mic2 className="size-4" />, label: vocalGender },
    { icon: <Languages className="size-4" />, label: language },
  ];

  return (
    <>
      <audio ref={audioRef} preload="metadata" src={currentVersion?.audioUrl} />
      <SongResultView
        activeVersion={activeVersion}
        coverImageUrl={resultCoverImageUrl}
        displayDuration={displayDuration}
        heroEyebrow="Ta-da! Congratulation!"
        isPlaying={isPlaying}
        lyrics={generatedLyrics}
        lyricsOccasionLabel={
          selectedOccasion?.title.split("/")[0].trim() || "you"
        }
        metadataPills={metadataPills}
        previewTime={previewTime}
        title={displayTitle}
        versions={["A", "B"].map((version, index) => {
          const songVersion = songVersions[index];

          return {
            displayId: version,
            title: songVersion?.title || displayTitle,
            audioUrl: songVersion?.audioUrl || "",
            providerVersionId: songVersion?.id || version,
          };
        })}
        versionsHeading="Two takes. Pick the one that feels right."
        onPlaybackToggle={onPlaybackToggle}
        renderVersionAction={({ index, version }) => (
          <ChooseButton
            className={cn(
              "h-10 w-full cursor-pointer rounded-full text-xs font-black text-primary-foreground shadow-sm transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 active:translate-y-0 active:scale-[0.99]",
              index === 0
                ? "border-foreground bg-foreground hover:border-foreground/90 hover:bg-foreground/90 hover:shadow-[0_14px_28px_rgba(45,31,24,0.22)]"
                : "border-primary bg-primary hover:border-primary/90 hover:bg-primary/90 hover:shadow-[0_14px_28px_rgba(239,62,53,0.28)]",
            )}
            onChoose={() => onChooseVersion(version.displayId)}
          >
            {finalizingVersion === version.displayId ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Gift className="size-4" />
            )}
            {finalizingVersion === version.displayId
              ? "Saving..."
              : "Choose this one"}
          </ChooseButton>
        )}
        bottomCta={
          <button
            className="group relative z-10 mx-auto mt-6 flex w-full max-w-5xl items-center justify-between gap-4 rounded-2xl bg-card px-5 py-4 text-left shadow-[0_14px_44px_rgba(255,120,150,0.09)] transition-[background-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:bg-primary/5 hover:shadow-[0_20px_56px_rgba(255,104,142,0.16)]"
            type="button"
            onClick={onRespin}
          >
            <span className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <RefreshCw className="size-4" />
              </span>
              <span>
                <span className="block font-[cursive] text-base text-accent-foreground">
                  not quite right?
                </span>
                <span className="block text-base font-black text-foreground">
                  Try fresh takes
                </span>
                <span className="block text-sm text-muted-foreground">
                  Generate two fresh takes with the same lyrics and style.
                </span>
              </span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-black text-primary-foreground shadow-[0_12px_28px_rgba(239,62,53,0.24)] transition-[transform,box-shadow,background-color] duration-200 ease-out group-hover:rotate-3 group-hover:scale-105">
              <RefreshCw className="size-4" />
              Respin
            </span>
          </button>
        }
      />
    </>
  );
}
