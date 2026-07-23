import { apiResponse } from "@/lib/api-response";
import { getSession } from "@/lib/auth/server";
import { transcribeSpokenIntro } from "@/lib/ai/spoken-intro-transcription";
import { z } from "zod";

const schema = z.object({
  audioKey: z.string().startsWith("songs/spoken-intros/").max(300),
  audioUrl: z.string().url(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user)
    return apiResponse.unauthorized(
      "Please sign in to transcribe a voice message.",
    );
  const parsed = schema.safeParse(await req.json());
  if (
    !parsed.success ||
    !parsed.data.audioKey.startsWith(`songs/spoken-intros/${session.user.id}/`)
  )
    return apiResponse.badRequest("Invalid audio recording.");
  try {
    const result = await transcribeSpokenIntro(parsed.data.audioUrl);
    if (!result.transcript || !result.alignedWords.length)
      return apiResponse.badRequest(
        "We could not understand that recording. Please try again.",
      );
    return apiResponse.success(result);
  } catch (error) {
    return apiResponse.serverError(
      error instanceof Error
        ? error.message
        : "Unable to transcribe your recording.",
    );
  }
}
