import { createSongGeneration } from "@/lib/ai/song";
import { apiResponse } from "@/lib/api-response";
import { getSession } from "@/lib/auth/server";
import { z } from "zod";

const generateSchema = z.object({
  email: z.string().trim().email().optional(),
  occasion: z.string().trim().min(1).max(120),
  genre: z.string().trim().min(1).max(120),
  language: z.string().trim().min(1).max(80),
  recipients: z
    .array(
      z.object({
        name: z.string().trim().max(80).default(""),
        relationship: z.string().trim().max(80).default(""),
      })
    )
    .max(3)
    .optional(),
  recipientNames: z.array(z.string().trim().min(1).max(80)).max(3).default([]),
  recipientRelationships: z
    .array(z.string().trim().max(80))
    .max(3)
    .default([]),
  story: z.string().trim().min(10).max(5000),
  title: z.string().trim().min(1).max(120),
  lyrics: z.string().trim().min(20).max(5000),
  vocalGender: z.string().trim().min(1).max(80),
});

export async function POST(req: Request) {
  let input: z.infer<typeof generateSchema>;

  try {
    input = generateSchema.parse(await req.json());
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message || "Invalid song generation payload."
        : "Invalid JSON payload.";
    return apiResponse.badRequest(message);
  }

  const session = await getSession();
  if (!session?.user && !input.email) {
    return apiResponse.badRequest("Email is required for guest song generation.");
  }

  try {
    const task = await createSongGeneration({
      ...input,
      sessionUser: session?.user
        ? {
            id: session.user.id,
            email: session.user.email,
            isAnonymous: (session.user as any).isAnonymous,
          }
        : null,
    });

    console.log("[songs/generate] Task submitted", {
      songId: task.songId,
      externalId: task.externalId,
      status: task.status,
      isSubscriber: task.isSubscriber,
    });

    return apiResponse.success({
      songId: task.songId,
      status: task.status,
      previewLimitSeconds: task.isSubscriber ? null : 60,
      expiresAt: new Date(task.expiresAt).toISOString(),
    });
  } catch (error) {
    console.error("[songs/generate] Failed to submit song task:", error);
    return apiResponse.serverError(
      error instanceof Error ? error.message : "Failed to generate song."
    );
  }
}
