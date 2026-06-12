import { apiResponse } from "@/lib/api-response";
import { db, isDatabaseEnabled } from "@/lib/db";
import { user as userSchema } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const captureLeadSchema = z.object({
  email: z.string().trim().email(),
  occasion: z.string().trim().min(1).max(120),
  genre: z.string().trim().min(1).max(120),
  language: z.string().trim().min(1).max(80).optional(),
  recipientNames: z.array(z.string().trim().min(1).max(80)).max(3).optional(),
  story: z.string().trim().min(10).max(5000),
  vocalGender: z.string().trim().min(1).max(80).optional(),
});

const previewLyrics = [
  {
    time: 0,
    line: "I kept the small things you told me",
  },
  {
    time: 6,
    line: "Turned every laugh into a melody",
  },
  {
    time: 12,
    line: "If home is a voice, then yours is mine",
  },
  {
    time: 18,
    line: "Thirty seconds, but a lifetime inside",
  },
  {
    time: 24,
    line: "This is your story learning how to shine",
  },
];

export async function POST(req: Request) {
  if (!isDatabaseEnabled) {
    return apiResponse.serverError(
      "Database is not configured. Set DATABASE_URL before capturing song leads."
    );
  }

  let input: z.infer<typeof captureLeadSchema>;

  try {
    const body = await req.json();
    input = captureLeadSchema.parse(body);
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message || "Invalid lead capture payload."
        : "Invalid JSON payload.";

    return apiResponse.badRequest(message);
  }

  try {
    const existingUsers = await db
      .select({
        id: userSchema.id,
        email: userSchema.email,
        isAnonymous: userSchema.isAnonymous,
      })
      .from(userSchema)
      .where(eq(userSchema.email, input.email))
      .limit(1);

    let leadUser = existingUsers[0];
    let isNewGuest = false;

    if (!leadUser) {
      const insertedUsers = await db
        .insert(userSchema)
        .values({
          email: input.email,
          emailVerified: false,
          isAnonymous: true,
          name: "Song Preview Guest",
        })
        .onConflictDoNothing({
          target: userSchema.email,
        })
        .returning({
          id: userSchema.id,
          email: userSchema.email,
          isAnonymous: userSchema.isAnonymous,
        });

      leadUser = insertedUsers[0];
      isNewGuest = Boolean(leadUser);

      if (!leadUser) {
        const racedUsers = await db
          .select({
            id: userSchema.id,
            email: userSchema.email,
            isAnonymous: userSchema.isAnonymous,
          })
          .from(userSchema)
          .where(eq(userSchema.email, input.email))
          .limit(1);

        leadUser = racedUsers[0];
      }
    }

    if (!leadUser) {
      return apiResponse.serverError("Unable to create or find the lead user.");
    }

    const songId = crypto.randomUUID();

    // Future production hook:
    // Persist a song_generations row here with songId, leadUser.id, occasion,
    // genre, story, preview asset URL, and generation status.
    return apiResponse.success({
      userId: leadUser.id,
      email: leadUser.email,
      isNewGuest,
      songId,
      previewAudioUrl: "/mock-audio/custom-song-preview.mp3",
      lyrics: previewLyrics,
    });
  } catch (error) {
    console.error("[capture-lead] Failed to capture song lead:", error);
    return apiResponse.serverError("Failed to capture song lead.");
  }
}
