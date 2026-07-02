import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import Replicate from "replicate";

import { fetchExternalUrlToR2 } from "@/lib/cloudflare/r2-fetch-upload";
import { generateR2Key } from "@/lib/cloudflare/r2-utils";

export const SONG_COVER_PROMPT_MODEL =
  process.env.SONG_COVER_PROMPT_MODEL || "gpt-4o-mini";
export const SONG_COVER_IMAGE_MODEL = "black-forest-labs/flux-2-pro";

export type SongCoverGenerationInput = {
  title: string;
  lyrics: string;
  occasion: string;
  genre: string;
  language: string;
  recipientNames: string[];
  story: string;
  vocalGender: string;
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
  const recipientLabel = input.recipientNames
    .map((name) => name.trim())
    .filter(Boolean)
    .join(", ");

  return [
    "Create one English prompt for an AI image model to generate a square album cover.",
    "",
    "Hard rules:",
    "- Return only the final image prompt, no markdown, no JSON, no labels.",
    "- The cover must contain no readable text, no logo, no album title, no typography, no watermark, no signature.",
    "- Do not ask for a celebrity, living artist style, brand, copyrighted character, or direct imitation of another artwork.",
    "- Use the song's emotional symbols instead of literal lyric transcription.",
    "- Make it suitable for a polished 1:1 music album cover.",
    "",
    "Song context:",
    `Title: ${input.title}`,
    `Occasion: ${input.occasion}`,
    `Genre: ${input.genre}`,
    `Language: ${input.language}`,
    `Vocal gender: ${input.vocalGender}`,
    `Recipients: ${recipientLabel || "someone special"}`,
    `Story: ${input.story}`,
    "",
    "Lyrics:",
    input.lyrics,
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
    throw new Error("OpenAI returned an empty album-cover prompt.");
  }

  return prompt.slice(0, 1400);
}

function assertSongCoverEnvironment() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "Missing API key: OPENAI_API_KEY is required for cover prompt generation.",
    );
  }
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error(
      "Missing API key: REPLICATE_API_TOKEN is required for cover image generation.",
    );
  }
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

async function generatePromptWithOpenAI({
  prompt,
  system,
}: {
  prompt: string;
  system: string;
}) {
  const result = await generateText({
    model: openai(SONG_COVER_PROMPT_MODEL),
    prompt,
    system,
    maxOutputTokens: 420,
    temperature: 0.7,
  });

  return result.text;
}

async function generateImageWithReplicate(prompt: string) {
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
    useFileOutput: false,
  });

  const output = await replicate.run(SONG_COVER_IMAGE_MODEL, {
    input: {
      prompt,
      aspect_ratio: "1:1",
      output_format: "webp",
    },
  });

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
  if (
    !dependencies.generatePrompt ||
    !dependencies.generateImage ||
    !dependencies.uploadImage
  ) {
    assertSongCoverEnvironment();
  }

  const generatePrompt = dependencies.generatePrompt ?? generatePromptWithOpenAI;
  const generateImage = dependencies.generateImage ?? generateImageWithReplicate;
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
