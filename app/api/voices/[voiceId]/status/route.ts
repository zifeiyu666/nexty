import { apiResponse } from "@/lib/api-response";
import { getSession } from "@/lib/auth/server";
import { refreshCustomVoiceStatus, updateCustomVoiceDetails } from "@/lib/ai/custom-voices";
import { getLogger } from "@/lib/logger";
import { z } from "zod";

const paramsSchema = z.object({ voiceId: z.string().uuid() });
const updateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(1000).optional(),
  style: z.string().trim().max(300).optional(),
  imageUrl: z.string().url().optional(),
  imageKey: z.string().startsWith("voices/image/").optional(),
});
const logger = getLogger("voice-status-api");

type Params = Promise<{ voiceId: string }>;

export async function GET(_request: Request, { params }: { params: Params }) {
  const session = await getSession();
  if (!session?.user) return apiResponse.unauthorized();

  try {
    const { voiceId } = paramsSchema.parse(await params);
    const startedAt = Date.now();
    const voice = await refreshCustomVoiceStatus(session.user.id, voiceId);

    if (!voice) return apiResponse.notFound("Voice not found.");

    logger.info(
      { userId: session.user.id, voiceId, status: voice.status, elapsedMs: Date.now() - startedAt },
      "Completed targeted custom voice status refresh",
    );
    return apiResponse.success(voice);
  } catch (error) {
    logger.error({ err: error, userId: session.user.id }, "Unable to refresh custom voice status");
    return apiResponse.badRequest(
      error instanceof Error ? error.message : "Unable to refresh voice status.",
    );
  }
}

export async function PATCH(request: Request, { params }: { params: Params }) {
  const session = await getSession();
  if (!session?.user) return apiResponse.unauthorized();

  try {
    const { voiceId } = paramsSchema.parse(await params);
    const input = updateSchema.parse(await request.json());
    const voice = await updateCustomVoiceDetails({ ...input, voiceId, userId: session.user.id });
    return apiResponse.success(voice);
  } catch (error) {
    logger.error({ err: error, userId: session.user.id }, "Unable to update custom voice details");
    return apiResponse.badRequest(
      error instanceof Error ? error.message : "Unable to update voice details.",
    );
  }
}
