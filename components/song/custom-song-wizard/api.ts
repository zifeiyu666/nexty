import type { Occasion, RecipientInput, SpokenIntroDraft } from "./types";
import type { SongCoverArtDirection } from "@/types/song-cover";
import posthog from "posthog-js";

type SongWizardInput = {
  genre: string;
  language: string;
  occasion: Occasion | null;
  recipients: RecipientInput[];
  recipientNames: string[];
  recipientRelationships: string[];
  story: string;
  spokenBlessing?: string;
  spokenIntro?: SpokenIntroDraft;
  spokenMode?: "recording" | "text";
  vocalGender: string;
  customVoiceId?: string;
};

type LyricsGenerationInput = SongWizardInput & {
  revisionInstruction?: string;
};

type SongGenerationInput = SongWizardInput & {
  lyrics: string;
  title: string;
};

type SongCoverGenerationInput = SongWizardInput & {
  coverArt?: SongCoverArtDirection;
  lyrics: string;
  songId?: string;
  title: string;
};

type LyricsRewriteInput = SongWizardInput & {
  fullLyrics: string;
  instruction: string;
  selectedLines: string[];
};

type StoryHelperGenerationInput = Omit<
  SongWizardInput,
  "story" | "occasion"
> & {
  occasion: Occasion;
  sourceStory?: string;
  answers: Array<{
    question: string;
    answer: string;
  }>;
};

async function parseApiResponse<T>(
  response: Response,
  fallbackError: string,
  tracking?: { feature: string; action: string },
): Promise<T> {
  const result = await response.json();

  if (!response.ok || !result.success) {
    if (tracking) captureFunnel(tracking.feature, tracking.action, "failed");
    throw new Error(result.error || fallbackError);
  }

  if (tracking) captureFunnel(tracking.feature, tracking.action, "succeeded");
  return result.data as T;
}

function captureFunnel(
  feature: string,
  action: string,
  outcome: "started" | "succeeded" | "failed",
) {
  if (typeof window !== "undefined") {
    posthog.capture("product_funnel", { feature, action, outcome });
  }
}

export async function generateStoryFromHelper(
  input: StoryHelperGenerationInput,
) {
  captureFunnel("story", "generate", "started");
  const response = await fetch("/api/songs/story", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseApiResponse<{ story: string }>(
    response,
    "Unable to generate story.",
    { feature: "story", action: "generate" },
  );
}

export async function startLyricsGeneration(input: LyricsGenerationInput) {
  captureFunnel("lyrics", "generate", "started");
  const response = await fetch("/api/songs/lyrics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseApiResponse<{
    coverArt?: SongCoverArtDirection;
    lyrics?: string;
    status: "succeeded" | "processing" | "failed";
    taskId: string;
    title?: string;
  }>(response, "Unable to start lyrics generation.", { feature: "lyrics", action: "generate" });
}

export async function getLyricsGenerationStatus(taskId: string) {
  const response = await fetch(
    `/api/songs/lyrics/status?taskId=${encodeURIComponent(taskId)}`,
  );

  return parseApiResponse<{
    coverArt?: SongCoverArtDirection;
    error?: string;
    lyrics?: string;
    status: "succeeded" | "processing" | "failed";
    title?: string;
  }>(response, "Unable to check lyrics status.");
}

export async function rewriteLyricsLines(input: LyricsRewriteInput) {
  captureFunnel("lyrics", "rewrite", "started");
  const response = await fetch("/api/songs/lyrics/rewrite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseApiResponse<{ lines?: string[] }>(
    response,
    "Unable to rewrite selected lines.",
    { feature: "lyrics", action: "rewrite" },
  );
}

export async function startSongGeneration(input: SongGenerationInput) {
  captureFunnel("song", "generate", "started");
  const response = await fetch("/api/songs/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseApiResponse<{ mockMode: boolean; songId: string }>(
    response,
    "Unable to start song generation.",
    { feature: "song", action: "generate" },
  );
}

export async function createSpokenIntroUpload(input: {
  contentType: string;
  fileName: string;
  size: number;
}) {
  const response = await fetch("/api/songs/intro/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseApiResponse<{
    contentType: string;
    key: string;
    presignedUrl: string;
    publicObjectUrl: string;
  }>(response, "Unable to prepare audio upload.");
}

export async function transcribeSpokenIntro(input: {
  audioKey: string;
  audioUrl: string;
}) {
  const response = await fetch("/api/songs/intro/transcribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseApiResponse<{
    alignedWords: SpokenIntroDraft["alignedWords"];
    durationSeconds: number;
    transcript: string;
  }>(response, "Unable to transcribe your recording.");
}

export async function getSongGenerationStatus(songId: string) {
  const response = await fetch(
    `/api/songs/generate/status?songId=${encodeURIComponent(songId)}`,
  );

  return parseApiResponse<{
    error?: string;
    expiresAt?: string;
    previewLimitSeconds?: number | null;
    mockMode: boolean;
    songId: string;
    status: "succeeded" | "processing" | "failed";
    versions?: Array<{
      audioUrl: string;
      duration?: number;
      id: string;
      imageUrl?: string;
      title: string;
    }>;
  }>(response, "Unable to check song status.");
}

export async function generateSongCover(input: SongCoverGenerationInput) {
  captureFunnel("cover", "generate", "started");
  const response = await fetch("/api/songs/cover/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseApiResponse<{
    imageUrl: string;
    prompt: string;
  }>(response, "Unable to generate cover image.", { feature: "cover", action: "generate" });
}

export async function createSongCoverUpload(input: {
  contentType: "image/jpeg" | "image/png" | "image/webp";
  fileName: string;
  size: number;
}) {
  captureFunnel("song", "finalize", "started");
  const response = await fetch("/api/songs/cover/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseApiResponse<{
    contentType: string;
    key: string;
    presignedUrl: string;
    publicObjectUrl: string;
  }>(response, "Unable to prepare album cover upload.");
}

export async function createCheckoutSession({
  songId,
  stripePriceId,
}: {
  songId?: string;
  stripePriceId: string;
}) {
  const response = await fetch("/api/payment/checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      provider: "stripe",
      stripePriceId,
      songId,
    }),
  });
  const result = await response.json();

  captureFunnel("song", "finalize", response.ok && result.success ? "succeeded" : "failed");

  if (response.status === 401) {
    return { unauthorized: true as const, url: "" };
  }

  if (!response.ok || !result.success) {
    throw new Error(result.error || "Unable to start checkout.");
  }

  const url = result.data?.url;
  if (!url) {
    throw new Error("Checkout URL was not returned.");
  }

  return { unauthorized: false as const, url };
}

export async function finalizeSongVersion({
  coverImageUrl,
  personalNote,
  songId,
  versionId,
}: {
  coverImageUrl?: string;
  personalNote?: string;
  songId: string;
  versionId: string;
}) {
  const response = await fetch("/api/songs/finalize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      coverImageUrl,
      personalNote,
      songId,
      versionId,
    }),
  });
  const result = await response.json();

  return {
    ok: response.ok,
    status: response.status,
    success: Boolean(result.success),
    data: result.data as
      | {
          alreadyFinalized?: boolean;
          songId?: string;
          songUrl?: string;
        }
      | undefined,
    error: result.error as string | undefined,
  };
}
