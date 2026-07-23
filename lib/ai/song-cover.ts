import Replicate from "replicate";

import { fetchExternalUrlToR2 } from "@/lib/cloudflare/r2-fetch-upload";
import { generateR2Key } from "@/lib/cloudflare/r2-utils";
import type { SongCoverArtDirection } from "@/types/song-cover";

export const SONG_COVER_IMAGE_MODEL = "black-forest-labs/flux-dev";

export function getSongCoverImageModel() {
  return process.env.SONG_COVER_IMAGE_MODEL || SONG_COVER_IMAGE_MODEL;
}

export type SongCoverGenerationInput = {
  title: string;
  lyrics: string;
  occasion: string;
  genre: string;
  language: string;
  recipientNames: string[];
  story: string;
  vocalGender: string;
  coverArt?: SongCoverArtDirection;
  songId?: string;
};

export type SongCoverGenerationResult = {
  imageUrl: string;
  prompt: string;
};

type TextPromptGenerator = (input: {
  prompt: string;
  system: string;
}) => Promise<string>;

type ImageGenerator = (prompt: string) => Promise<string>;

type UploadGeneratedImage = (
  externalUrl: string,
  key: string,
) => Promise<{ url: string; key: string }>;

type GenerateSongCoverDependencies = {
  generatePrompt?: TextPromptGenerator;
  generateImage?: ImageGenerator;
  uploadImage?: UploadGeneratedImage;
};

export function buildSongCoverPromptRequest(input: SongCoverGenerationInput) {
  const recipientNames = input.recipientNames
    .map((name) =>
      name
        .replace(/[\r\n"\\]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 40),
    )
    .filter(Boolean)
    .slice(0, 3);
  const recipientLabel =
    recipientNames.length <= 1
      ? recipientNames[0] || "Someone Special"
      : recipientNames.length === 2
        ? recipientNames.join(" & ")
        : `${recipientNames.slice(0, -1).join(", ")} & ${recipientNames.at(-1)}`;
  const dedication = `For ${recipientLabel}`;
  const art: SongCoverArtDirection = input.coverArt ?? {
    style: "cinematic-keepsake",
    styleDescription:
      "emotionally composed cinematic realism with refined keepsake texture",
    subject: `a symbolic scene inspired by this personal story: ${input.story}`,
    mood: "warm, sincere, intimate and quietly celebratory",
    palette: "harmonious warm neutrals with restrained celebratory accents",
    lighting: "soft cinematic light with a gentle natural glow",
    composition:
      "a balanced central scene with subtle breathing room in the lower-right",
    giftFeeling: "a treasured personal keepsake, thoughtful and premium",
  };

  return [
    "Create a premium square album cover designed as a deeply personal gift.",
    "",
    "Personal dedication:",
    `- Include exactly one small, elegant handwritten inscription reading "${dedication}".`,
    "- Spell the dedication exactly as written, preserving capitalization.",
    "- Integrate it naturally into the lower-right area like a tasteful personal signature on a keepsake.",
    "- Include no other readable text, letters, words, title, logo, caption, watermark, or signature.",
    "",
    `Selected visual style: ${art.style}.`,
    `Medium and texture: ${art.styleDescription}.`,
    `Subject: ${art.subject}.`,
    `Mood: ${art.mood}.`,
    `Color palette: ${art.palette}.`,
    `Lighting: ${art.lighting}.`,
    `Composition: ${art.composition}.`,
    `Gift feeling: ${art.giftFeeling}.`,
    "",
    "Use no celebrity, living artist style, brand, copyrighted character, or imitation of existing artwork.",
    "Keep the result emotionally specific, polished, cohesive, and framed for a 1:1 album cover.",
  ].join("\n");
}

export function normalizeSongCoverPrompt(value: string) {
  const prompt = value
    .trim()
    .replace(/^```(?:text)?/i, "")
    .replace(/```$/i, "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .trim();

  if (!prompt) {
    throw new Error("Received an empty album-cover prompt.");
  }

  return prompt.slice(0, 2400);
}

function assertReplicateEnvironment() {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error(
      "Missing API key: REPLICATE_API_TOKEN is required for cover image generation.",
    );
  }
}

function assertR2Environment() {
  if (
    !process.env.R2_ACCOUNT_ID ||
    !process.env.R2_ACCESS_KEY_ID ||
    !process.env.R2_SECRET_ACCESS_KEY ||
    !process.env.R2_BUCKET_NAME ||
    !process.env.R2_PUBLIC_URL
  ) {
    throw new Error(
      "R2 configuration is required to store generated cover images.",
    );
  }
}

async function generatePromptFromSongContext({
  prompt,
}: {
  prompt: string;
  system: string;
}) {
  return prompt;
}

async function generateImageWithReplicate(prompt: string) {
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
    useFileOutput: false,
  });

  const output = await replicate.run(
    getSongCoverImageModel() as `${string}/${string}`,
    {
      input: {
        prompt,
        aspect_ratio: "1:1",
        output_format: "webp",
        num_outputs: 1,
        go_fast: true,
      },
    },
  );

  const imageUrl = extractReplicateImageUrl(output);
  if (!imageUrl) {
    throw new Error("Replicate did not return a generated cover image URL.");
  }

  return imageUrl;
}

export function extractReplicateImageUrl(output: unknown): string | null {
  if (typeof output === "string") return output;

  if (Array.isArray(output)) {
    const firstUrl = output
      .map((item) => extractReplicateImageUrl(item))
      .find((item): item is string => Boolean(item));
    return firstUrl ?? null;
  }

  if (output && typeof output === "object") {
    const maybeUrl = (output as { url?: unknown }).url;
    if (typeof maybeUrl === "function") {
      return String(maybeUrl.call(output));
    }
    if (typeof maybeUrl === "string") return maybeUrl;

    const maybeOutput = (output as { output?: unknown }).output;
    if (maybeOutput !== undefined) return extractReplicateImageUrl(maybeOutput);
  }

  return null;
}

export async function generateSongCover(
  input: SongCoverGenerationInput,
  dependencies: GenerateSongCoverDependencies = {},
): Promise<SongCoverGenerationResult> {
  if (!dependencies.generateImage) assertReplicateEnvironment();
  if (!dependencies.uploadImage) assertR2Environment();

  const generatePrompt =
    dependencies.generatePrompt ?? generatePromptFromSongContext;
  const generateImage =
    dependencies.generateImage ?? generateImageWithReplicate;
  const uploadImage = dependencies.uploadImage ?? fetchExternalUrlToR2;
  const promptRequest = buildSongCoverPromptRequest(input);
  const prompt = normalizeSongCoverPrompt(
    await generatePrompt({
      prompt: promptRequest,
      system:
        "You are an expert album-cover art director. Convert song context into one concise image-generation prompt.",
    }),
  );
  const externalImageUrl = await generateImage(prompt);
  const key = generateR2Key({
    fileName: "cover.webp",
    path: `song-covers/${input.songId?.trim() || crypto.randomUUID()}`,
  });
  const upload = await uploadImage(externalImageUrl, key);

  return {
    imageUrl: upload.url,
    prompt,
  };
}
