import { apiResponse } from "@/lib/api-response";
import { createLyricsGeneration } from "@/lib/ai/song";
import { z } from "zod";

const lyricsSchema = z.object({
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
  recipientRelationships: z.array(z.string().trim().max(80)).max(3).default([]),
  revisionInstruction: z.string().trim().max(500).optional(),
  story: z.string().trim().min(10).max(5000),
  vocalGender: z.string().trim().min(1).max(80),
});

export async function POST(req: Request) {
  let input: z.infer<typeof lyricsSchema>;

  try {
    input = lyricsSchema.parse(await req.json());
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message || "Invalid lyrics payload."
        : "Invalid JSON payload.";
    return apiResponse.badRequest(message);
  }

  try {
    const task = await createLyricsGeneration({
      ...input,
      userRevisionInstruction: input.revisionInstruction,
    });
    return apiResponse.success({
      taskId: task.taskId,
      status: task.status,
      title: task.title,
      lyrics: task.lyrics,
      coverArt: task.coverArt,
      expiresAt: new Date(task.expiresAt).toISOString(),
    });
  } catch (error) {
    console.error("[songs/lyrics] Failed to submit lyrics task:", error);
    return apiResponse.serverError(
      error instanceof Error ? error.message : "Failed to generate lyrics.",
    );
  }
}
