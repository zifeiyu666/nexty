/**
 * ai sdk docs:
 * https://sdk.vercel.ai/docs/reference/ai-sdk-core/stream-text
 * https://sdk.vercel.ai/docs/reference/ai-sdk-core/generate-text
 * https://sdk.vercel.ai/providers/ai-sdk-providers
 */

import { getLanguageModel } from "@/config/ai-providers";
import { apiResponse } from "@/lib/api-response";
import { isAdmin } from "@/lib/auth/server";
import {
  streamText
} from "ai";
import { z } from 'zod';

const inputSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty"),
  modelId: z.string().min(1, "Model ID cannot be empty"),
  provider: z.string().min(1, "Provider cannot be empty"),
});

export async function POST(req: Request) {
  try {
    if (!(await isAdmin())) {
      return apiResponse.forbidden('Admin privileges required.');
    }

    const rawBody = await req.json();

    const validationResult = inputSchema.safeParse(rawBody);
    if (!validationResult.success) {
      return apiResponse.badRequest(`Invalid input: ${validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
    }

    const { prompt, modelId, provider } = validationResult.data;

    let model;
    try {
      model = getLanguageModel(provider, modelId);
    } catch (error) {
      console.error("Failed to create AI model:", error);
      const message = error instanceof Error ? error.message : String(error);
      return apiResponse.serverError(message);
    }

    const result = await streamText({
      model: model,
      prompt: prompt,
    });

    return result.toTextStreamResponse();

  } catch (error: any) {
    console.error("Chat generation failed:", error);
    const errorMessage = error?.message || "Failed to generate response";
    if (errorMessage.includes("API key")) {
      return apiResponse.serverError(`Server configuration error: ${errorMessage}`);
    }
    return apiResponse.serverError(errorMessage);
  }
}