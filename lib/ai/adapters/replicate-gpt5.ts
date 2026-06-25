import Replicate from "replicate";

export const DEFAULT_REPLICATE_GPT5_MODEL = "openai/gpt-5";

export type ReplicateGpt5ReasoningEffort =
  | "minimal"
  | "low"
  | "medium"
  | "high";

export type ReplicateGpt5Verbosity = "low" | "medium" | "high";

type GenerateReplicateGpt5TextInput = {
  prompt: string;
  maxCompletionTokens?: number;
  model?: string;
  reasoningEffort?: ReplicateGpt5ReasoningEffort;
  systemPrompt?: string;
  verbosity?: ReplicateGpt5Verbosity;
};

export function getReplicateGpt5LyricsModel(): string {
  return process.env.REPLICATE_LYRICS_MODEL || DEFAULT_REPLICATE_GPT5_MODEL;
}

export function normalizeReplicateTextOutput(output: unknown): string {
  if (typeof output === "string") {
    return output;
  }

  if (Array.isArray(output)) {
    return output
      .map((part) => {
        if (typeof part === "string") return part;
        if (part == null) return "";
        return String(part);
      })
      .join("");
  }

  if (output && typeof output === "object") {
    const maybeText = (output as { text?: unknown; output?: unknown }).text;
    if (typeof maybeText === "string") return maybeText;

    const maybeOutput = (output as { output?: unknown }).output;
    if (maybeOutput !== undefined) return normalizeReplicateTextOutput(maybeOutput);
  }

  throw new Error("Replicate GPT-5 response did not include text output.");
}

export async function generateTextWithReplicateGpt5({
  prompt,
  maxCompletionTokens,
  model = getReplicateGpt5LyricsModel(),
  reasoningEffort = "minimal",
  systemPrompt,
  verbosity = "medium",
}: GenerateReplicateGpt5TextInput): Promise<string> {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error(
      "Missing API key: REPLICATE_API_TOKEN is required for Replicate GPT-5 lyrics."
    );
  }

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  const input: Record<string, unknown> = {
    prompt,
    reasoning_effort: reasoningEffort,
    verbosity,
  };

  if (systemPrompt) input.system_prompt = systemPrompt;
  if (maxCompletionTokens !== undefined) {
    input.max_completion_tokens = maxCompletionTokens;
  }

  const output = await replicate.run(model as `${string}/${string}`, {
    input,
  });

  return normalizeReplicateTextOutput(output).trim();
}
