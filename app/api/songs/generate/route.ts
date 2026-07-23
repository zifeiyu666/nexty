import { createSongGeneration } from "@/lib/ai/song";
import { apiResponse } from "@/lib/api-response";
import { getSession } from "@/lib/auth/server";
import { z } from "zod";

const generateSchema = z.object({
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
  story: z.string().trim().min(10).max(5000),
  title: z.string().trim().min(1).max(120),
  lyrics: z.string().trim().min(20).max(5000),
  vocalGender: z.string().trim().min(1).max(80),
  spokenIntro: z
    .object({
      alignedWords: z
        .array(
          z.object({
            word: z.string().trim().min(1).max(80),
            startS: z.number().min(0),
            endS: z.number().min(0),
          }),
        )
        .min(1)
        .max(500),
      audioKey: z.string().startsWith("songs/spoken-intros/").max(300),
      audioUrl: z.string().url(),
      durationSeconds: z.number().positive().max(90),
      transcript: z.string().trim().min(1).max(1000),
    })
    .optional(),
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
  if (!session?.user) {
    return apiResponse.unauthorized("Please sign in to generate a song.");
  }

  if (
    input.spokenIntro &&
    !input.spokenIntro.audioKey.startsWith(
      `songs/spoken-intros/${session.user.id}/`,
    )
  ) {
    return apiResponse.forbidden(
      "This recording does not belong to your account.",
    );
  }

  try {
    const task = await createSongGeneration({
      ...input,
      sessionUser: {
        id: session.user.id,
        email: session.user.email,
        isAnonymous: (session.user as any).isAnonymous,
      },
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
      mockMode: Boolean(task.mockMode),
      previewLimitSeconds: 60,
      expiresAt: new Date(task.expiresAt).toISOString(),
    });
  } catch (error) {
    console.error("[songs/generate] Failed to submit song task:", error);
    return apiResponse.serverError(
      error instanceof Error ? error.message : "Failed to generate song.",
    );
  }
}
