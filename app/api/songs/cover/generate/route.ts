import { generateSongCover } from "@/lib/ai/song-cover";
import { apiResponse } from "@/lib/api-response";
import { getSession } from "@/lib/auth/server";
import { checkRateLimit, getClientIPFromRequest } from "@/lib/upstash";
import { REDIS_RATE_LIMIT_CONFIGS } from "@/lib/upstash/redis-rate-limit-configs";
import { z } from "zod";
import { SONG_COVER_STYLES } from "@/types/song-cover";

const coverArtSchema = z.object({
  style: z.enum(SONG_COVER_STYLES),
  styleDescription: z.string().trim().min(3).max(500),
  subject: z.string().trim().min(3).max(500),
  mood: z.string().trim().min(3).max(300),
  palette: z.string().trim().min(3).max(300),
  lighting: z.string().trim().min(3).max(300),
  composition: z.string().trim().min(3).max(500),
  giftFeeling: z.string().trim().min(3).max(500),
});

const coverSchema = z.object({
  title: z.string().trim().min(1).max(120),
  lyrics: z.string().trim().min(20).max(5000),
  occasion: z.string().trim().min(1).max(120),
  genre: z.string().trim().min(1).max(120),
  language: z.string().trim().min(1).max(80),
  recipientNames: z.array(z.string().trim().min(1).max(80)).max(3).default([]),
  story: z.string().trim().min(10).max(5000),
  vocalGender: z.string().trim().min(1).max(80),
  coverArt: coverArtSchema.optional(),
  songId: z.string().trim().min(1).max(120).optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  const shouldApplyAnonymousLimit =
    !session?.user ||
    Boolean((session.user as { isAnonymous?: unknown }).isAnonymous);

  if (shouldApplyAnonymousLimit) {
    const clientIP = getClientIPFromRequest(req);
    const isAllowed = await checkRateLimit(
      clientIP,
      REDIS_RATE_LIMIT_CONFIGS.songCoverGeneration,
    );

    if (!isAllowed) {
      return apiResponse.badRequest(
        `Rate limit exceeded. You can generate up to ${REDIS_RATE_LIMIT_CONFIGS.songCoverGeneration.maxRequests} cover images per day.`,
      );
    }
  }

  let input: z.infer<typeof coverSchema>;

  try {
    input = coverSchema.parse(await req.json());
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message || "Invalid cover generation payload."
        : "Invalid JSON payload.";
    return apiResponse.badRequest(message);
  }

  try {
    const result = await generateSongCover(input);
    return apiResponse.success(result);
  } catch (error) {
    console.error("[songs/cover/generate] Failed to generate cover:", error);
    return apiResponse.serverError(
      error instanceof Error
        ? error.message
        : "Failed to generate cover image.",
    );
  }
}
