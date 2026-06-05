import { getLanguageModel } from "@/config/ai-providers";
import { streamText } from "ai";

interface ChatOptions {
  provider: string;
  modelId: string;
  messages?: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  prompt?: string;
  system?: string;
}

/**
 * Unified chat generation entry point. Supports both single-turn (prompt) and multi-turn (messages).
 * Returns the AI SDK streamText result; the API route calls .toTextStreamResponse() to stream it to the client.
 */
export function streamChat(options: ChatOptions) {
  const model = getLanguageModel(options.provider, options.modelId);

  const messages = options.messages ?? [
    { role: "user" as const, content: options.prompt ?? "" },
  ];

  return streamText({
    model,
    system: options.system,
    messages,
    onFinish: ({ text }) => {
      console.log(text);
      // you can insert data to database here
    },
  });
}
