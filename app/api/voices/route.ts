import { apiResponse } from "@/lib/api-response";
import { getSession } from "@/lib/auth/server";
import { createCustomVoice, deleteCustomVoice, listCustomVoices, retryCustomVoiceVerification, startVoiceVerification } from "@/lib/ai/custom-voices";
import { getLogger } from "@/lib/logger";
import { recordUserActivity, recordUserIssueSignal } from "@/lib/observability/user-activity";
import { MAX_VOICE_SAMPLE_SECONDS, MIN_VOICE_SAMPLE_SECONDS } from "@/lib/voice-sample";
import { z } from "zod";

const startSchema = z.object({ name: z.string().trim().min(1).max(100), description: z.string().trim().max(1000).optional(), style: z.string().trim().max(300).optional(), sourceAudioUrl: z.string().url(), sourceAudioKey: z.string().startsWith("voices/source/"), imageUrl: z.string().url().optional(), imageKey: z.string().startsWith("voices/image/").optional(), language: z.string().default("en"), vocalStartS: z.literal(0), vocalEndS: z.number().int().min(MIN_VOICE_SAMPLE_SECONDS).max(MAX_VOICE_SAMPLE_SECONDS), consent: z.literal(true) });
const createSchema = z.object({ id: z.string().uuid(), verifyUrl: z.string().url(), verificationAudioUrl: z.string().url(), verificationAudioKey: z.string().startsWith("voices/verification/") });
const retrySchema = z.object({ id: z.string().uuid() });
const deleteSchema = z.object({ id: z.string().uuid() });
const logger = getLogger("voices-api");

export async function GET() { const session = await getSession(); if (!session?.user) { logger.warn({}, "Rejected voice list request without a user session"); return apiResponse.unauthorized(); } const startedAt = Date.now(); logger.debug({ userId: session.user.id }, "Received voice list request"); const voices = await listCustomVoices(session.user.id); logger.info({ userId: session.user.id, voiceCount: voices.length, statuses: voices.map((voice) => ({ id: voice.id, status: voice.status })), elapsedMs: Date.now() - startedAt }, "Completed voice list request"); return apiResponse.success(voices); }
export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user) { logger.warn({}, "Rejected voice create request without a user session"); return apiResponse.unauthorized(); }
  const startedAt = Date.now();
  const body = await request.json();
  const action = body.action === "create" ? "submit-verification" : body.action === "retry" ? "retry-verification" : "start-verification";
  try {
    await recordUserActivity({ userId: session.user.id, feature: "voice", action, outcome: "started" });
    logger.info({ userId: session.user.id, action, bodyKeys: Object.keys(body) }, "Received voice mutation request");
    const result = body.action === "create" ? await createCustomVoice({ ...createSchema.parse(body), userId: session.user.id }) : body.action === "retry" ? await retryCustomVoiceVerification({ ...retrySchema.parse(body), userId: session.user.id }) : await startVoiceVerification({ ...startSchema.parse(body), userId: session.user.id });
    const resourceId = "id" in result ? result.id : undefined;
    await recordUserActivity({ userId: session.user.id, feature: "voice", action, outcome: "succeeded", resourceType: "custom_voice", resourceId, durationMs: Date.now() - startedAt });
    logger.info({ userId: session.user.id, action }, "Completed voice mutation request");
    return apiResponse.success(result);
  } catch (error) {
    logger.error({ err: error, userId: session.user.id, action }, "Voice mutation request failed");
    await recordUserIssueSignal({ userId: session.user.id, feature: "voice", action, error, durationMs: Date.now() - startedAt });
    return apiResponse.badRequest(error instanceof Error ? error.message : "Unable to create voice.");
  }
}
export async function DELETE(request: Request) { const session = await getSession(); if (!session?.user) { logger.warn({}, "Rejected voice delete request without a user session"); return apiResponse.unauthorized(); } try { const { searchParams } = new URL(request.url); const { id } = deleteSchema.parse({ id: searchParams.get("id") }); logger.info({ userId: session.user.id, voiceId: id }, "Received custom voice delete request"); return apiResponse.success(await deleteCustomVoice({ id, userId: session.user.id })); } catch (error) { logger.error({ err: error, userId: session.user.id }, "Custom voice delete request failed"); return apiResponse.badRequest(error instanceof Error ? error.message : "Unable to delete voice."); } }
