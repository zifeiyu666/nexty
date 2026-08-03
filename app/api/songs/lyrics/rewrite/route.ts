import { apiResponse } from "@/lib/api-response";
import { rewriteSongLyricsLines } from "@/lib/ai/song";
import { getSession } from "@/lib/auth/server";
import { recordUserActivity, recordUserIssueSignal } from "@/lib/observability/user-activity";
import { z } from "zod";

const rewriteSchema = z.object({
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
  fullLyrics: z.string().trim().min(20).max(6000),
  selectedLines: z.array(z.string().trim().min(1).max(500)).min(1).max(8),
  instruction: z.string().trim().max(500).optional(),
});

export async function POST(req: Request) {
  const startedAt = Date.now();
  const session = await getSession();
  let input: z.infer<typeof rewriteSchema>;

  try {
    input = rewriteSchema.parse(await req.json());
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message || "Invalid lyric rewrite payload."
        : "Invalid JSON payload.";
    return apiResponse.badRequest(message);
  }

  try {
    await recordUserActivity({ userId: session?.user.id, feature: "lyrics", action: "rewrite", outcome: "started" });
    const result = await rewriteSongLyricsLines(input);
    await recordUserActivity({ userId: session?.user.id, feature: "lyrics", action: "rewrite", outcome: "succeeded", durationMs: Date.now() - startedAt });
    return apiResponse.success(result);
  } catch (error) {
    console.error("[songs/lyrics/rewrite] Failed to rewrite lyric lines:", error);
    await recordUserIssueSignal({ userId: session?.user.id, feature: "lyrics", action: "rewrite", error, durationMs: Date.now() - startedAt });
    return apiResponse.serverError(
      error instanceof Error ? error.message : "Failed to rewrite lyric lines."
    );
  }
}
