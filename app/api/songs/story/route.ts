import { apiResponse } from "@/lib/api-response";
import { generateSongStory } from "@/lib/ai/song";
import { z } from "zod";

const storySchema = z.object({
  occasion: z.string().trim().min(1).max(120),
  genre: z.string().trim().min(1).max(120),
  language: z.string().trim().min(1).max(80),
  recipients: z
    .array(
      z.object({
        name: z.string().trim().max(80).default(""),
        relationship: z.string().trim().max(80).default(""),
      }),
    )
    .max(3)
    .optional(),
  recipientNames: z.array(z.string().trim().min(1).max(80)).max(3).default([]),
  recipientRelationships: z
    .array(z.string().trim().max(80))
    .max(3)
    .default([]),
  answers: z.array(
    z.object({
      question: z.string().trim().min(1).max(240),
      answer: z.string().trim().max(1000),
    }),
  )
    .max(10)
    .default([]),
  sourceStory: z.string().trim().min(10).max(5000).optional(),
  vocalGender: z.string().trim().min(1).max(80),
}).refine(
  (input) =>
    Boolean(input.sourceStory?.trim()) ||
    input.answers.some((answer) => answer.answer.trim()),
  {
    message: "Story source is required.",
    path: ["answers"],
  },
);

export async function POST(req: Request) {
  let input: z.infer<typeof storySchema>;

  try {
    input = storySchema.parse(await req.json());
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message || "Invalid story payload."
        : "Invalid JSON payload.";
    return apiResponse.badRequest(message);
  }

  try {
    const story = await generateSongStory(input);
    return apiResponse.success(story);
  } catch (error) {
    console.error("[songs/story] Failed to generate story:", error);
    return apiResponse.serverError(
      error instanceof Error ? error.message : "Failed to generate story.",
    );
  }
}
