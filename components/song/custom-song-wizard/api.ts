import type { Occasion, RecipientInput } from "./types";

type SongWizardInput = {
  genre: string;
  language: string;
  occasion: Occasion | null;
  recipients: RecipientInput[];
  recipientNames: string[];
  recipientRelationships: string[];
  story: string;
  vocalGender: string;
};

type LyricsGenerationInput = SongWizardInput & {
  revisionInstruction?: string;
};

type SongGenerationInput = SongWizardInput & {
  lyrics: string;
  title: string;
};

type SongCoverGenerationInput = SongWizardInput & {
  lyrics: string;
  songId?: string;
  title: string;
};

type LyricsRewriteInput = SongWizardInput & {
  fullLyrics: string;
  instruction: string;
  selectedLines: string[];
};

type StoryHelperGenerationInput = Omit<SongWizardInput, "story" | "occasion"> & {
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
): Promise<T> {
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || fallbackError);
  }

  return result.data as T;
}

export async function generateStoryFromHelper(
  input: StoryHelperGenerationInput,
) {
  const response = await fetch("/api/songs/story", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseApiResponse<{ story: string }>(
    response,
    "Unable to generate story.",
  );
}

export async function startLyricsGeneration(input: LyricsGenerationInput) {
  const response = await fetch("/api/songs/lyrics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseApiResponse<{
    lyrics?: string;
    status: "succeeded" | "processing" | "failed";
    taskId: string;
    title?: string;
  }>(response, "Unable to start lyrics generation.");
}

export async function getLyricsGenerationStatus(taskId: string) {
  const response = await fetch(
    `/api/songs/lyrics/status?taskId=${encodeURIComponent(taskId)}`,
  );

  return parseApiResponse<{
    error?: string;
    lyrics?: string;
    status: "succeeded" | "processing" | "failed";
    title?: string;
  }>(response, "Unable to check lyrics status.");
}

export async function rewriteLyricsLines(input: LyricsRewriteInput) {
  const response = await fetch("/api/songs/lyrics/rewrite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseApiResponse<{ lines?: string[] }>(
    response,
    "Unable to rewrite selected lines.",
  );
}

export async function startSongGeneration(input: SongGenerationInput) {
  const response = await fetch("/api/songs/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseApiResponse<{ songId: string }>(
    response,
    "Unable to start song generation.",
  );
}

export async function getSongGenerationStatus(songId: string) {
  const response = await fetch(
    `/api/songs/generate/status?songId=${encodeURIComponent(songId)}`,
  );

  return parseApiResponse<{
    error?: string;
    expiresAt?: string;
    previewLimitSeconds?: number | null;
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
  const response = await fetch("/api/songs/cover/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseApiResponse<{
    imageUrl: string;
    prompt: string;
  }>(response, "Unable to generate cover image.");
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
  songId,
  versionId,
}: {
  coverImageUrl?: string;
  songId: string;
  versionId: string;
}) {
  const response = await fetch("/api/songs/finalize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      coverImageUrl,
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
