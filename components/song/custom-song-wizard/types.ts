import type { ReactNode } from "react";
import type { SongCoverArtDirection } from "@/types/song-cover";

export type Occasion = string;
export type WizardStep = 1 | 2 | 3 | 4 | 5;
export type SongStage = "loading" | "player";
export type LyricsStage = "loading" | "editor";

export type LyricLine = {
  time: number;
  line: string;
};

export type SpokenIntroDraft = {
  alignedWords: Array<{ word: string; startS: number; endS: number }>;
  audioKey: string;
  audioUrl: string;
  durationSeconds: number;
  transcript: string;
};

export type SongVersion = {
  id: string;
  title: string;
  audioUrl: string;
  imageUrl?: string;
  duration?: number;
};

export type LyricsVersionComparison = {
  originalTitle: string;
  originalLyrics: string;
  newTitle: string;
  newLyrics: string;
  newCoverArt?: SongCoverArtDirection;
};

export type CaptureLeadResponse = {
  userId: string;
  songId: string;
  previewAudioUrl: string;
  previewLimitSeconds?: number | null;
  expiresAt?: string;
  lyrics: LyricLine[];
  versions?: SongVersion[];
};

export type GenreOption = {
  value: string;
  label: string;
  icon: ReactNode;
  accent: string;
};

export type LanguageOption = {
  code: string;
  label: string;
};

export type RecipientInput = {
  name: string;
  relationship: string;
};

export type StoredDraft = {
  coverArt?: SongCoverArtDirection;
  generatedLyrics?: string;
  genre?: string;
  language?: string;
  lyricsGeneratedBy?: "ai";
  lyricsInputKey?: string;
  occasion?: Occasion | null;
  personalNote?: string;
  recipients?: RecipientInput[];
  recipientNames?: string[];
  recipientRelationships?: string[];
  songStage?: SongStage;
  songTitle?: string;
  story?: string;
  spokenBlessing?: string;
  spokenIntro?: SpokenIntroDraft;
  spokenMode?: "recording" | "text";
  vocalGender?: string;
};
