import { apiResponse } from "@/lib/api-response";
import { createLyricsGeneration } from "@/lib/ai/song";
import { z } from "zod";

const lyricsSchema = z.object({
  occasion: z.string().trim().min(1).max(120),
  genre: z.string().trim().min(1).max(120),
  language: z.string().trim().min(1).max(80),
  recipientNames: z.array(z.string().trim().min(1).max(80)).max(3).default([]),
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
    const task = await createLyricsGeneration(input);
    return apiResponse.success({
      taskId: task.taskId,
      status: task.status,
      title: task.title,
      lyrics: task.lyrics,
      expiresAt: new Date(task.expiresAt).toISOString(),
    });
  } catch (error) {
    console.error("[songs/lyrics] Failed to submit lyrics task:", error);
    return apiResponse.serverError(
      error instanceof Error ? error.message : "Failed to generate lyrics."
    );
  }
}
