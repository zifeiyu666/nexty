import Replicate from "replicate";

import type { KieAlignedWord } from "./adapters/kie-suno";

export type SpokenIntroTranscription = {
  alignedWords: KieAlignedWord[];
  durationSeconds: number;
  transcript: string;
};

export const DEFAULT_REPLICATE_WHISPER_MODEL =
  "vaibhavs10/incredibly-fast-whisper:3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c";

const RETIRED_REPLICATE_WHISPER_MODELS = new Set([
  "openai/whisper",
  "vaibhavs10/incredibly-fast-whisper",
]);

type WhisperSegment = {
  end?: unknown;
  start?: unknown;
  text?: unknown;
};

type WhisperOutput = {
  chunks?: Array<{
    text?: unknown;
    timestamp?: unknown;
  }>;
  segments?: WhisperSegment[];
  text?: unknown;
  transcription?: unknown;
};

export function getReplicateWhisperModel(model?: string): string {
  const configuredModel = model?.trim();

  return !configuredModel || RETIRED_REPLICATE_WHISPER_MODELS.has(configuredModel)
    ? DEFAULT_REPLICATE_WHISPER_MODEL
    : configuredModel;
}

function wordsFromSegments(segments: WhisperSegment[]): KieAlignedWord[] {
  return segments.flatMap((segment) => {
    const text = typeof segment.text === "string" ? segment.text.trim() : "";
    const startS = Number(segment.start);
    const endS = Number(segment.end);
    const tokens = text.split(/\s+/).filter(Boolean);
    if (!tokens.length || !Number.isFinite(startS) || !Number.isFinite(endS))
      return [];

    const duration = Math.max(endS - startS, 0.01);
    return tokens.map((word, index) => ({
      word,
      startS: startS + (duration * index) / tokens.length,
      endS: startS + (duration * (index + 1)) / tokens.length,
    }));
  });
}

function transcriptFromOutput(
  value: WhisperOutput | null,
  segments: WhisperSegment[],
): string {
  if (typeof value?.transcription === "string")
    return value.transcription.trim();
  if (typeof value?.text === "string") return value.text.trim();

  return segments
    .map((segment) =>
      typeof segment.text === "string" ? segment.text.trim() : "",
    )
    .filter(Boolean)
    .join(" ");
}

export function normalizeReplicateWhisperOutput(
  output: unknown,
): SpokenIntroTranscription {
  const value = (
    Array.isArray(output) ? output[0] : output
  ) as WhisperOutput | null;
  const chunks = Array.isArray(value?.chunks) ? value.chunks : [];
  const segments = Array.isArray(value?.segments)
    ? value.segments
    : chunks.map((chunk) => {
        const timestamp = Array.isArray(chunk.timestamp) ? chunk.timestamp : [];
        return {
          end: timestamp[1],
          start: timestamp[0],
          text: chunk.text,
        };
      });
  const transcript = transcriptFromOutput(value, segments);
  const durationSeconds = segments.reduce(
    (latest, segment) => Math.max(latest, Number(segment.end) || 0),
    0,
  );

  return {
    transcript,
    durationSeconds,
    alignedWords: wordsFromSegments(segments),
  };
}

export async function transcribeSpokenIntro(
  audioUrl: string,
): Promise<SpokenIntroTranscription> {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error("REPLICATE_API_TOKEN is not configured.");
  }
  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
  const output = await replicate.run(
    getReplicateWhisperModel(
      process.env.REPLICATE_WHISPER_MODEL,
    ) as `${string}/${string}` | `${string}/${string}:${string}`,
    {
      input: {
        audio: audioUrl,
        task: "transcribe",
        timestamp: "word",
      },
    },
  );
  return normalizeReplicateWhisperOutput(output);
}
