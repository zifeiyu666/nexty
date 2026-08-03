import { db } from "@/lib/db";
import { customVoices, type CustomVoiceStatus } from "@/lib/db/schema";
import { hasActiveSubscription } from "@/lib/ai/song";
import { deleteFile } from "@/lib/cloudflare/r2";
import { getLogger } from "@/lib/logger";
import { MIN_VOICE_SAMPLE_SECONDS } from "@/lib/voice-sample";
import { and, desc, eq, inArray, ne } from "drizzle-orm";

const KIE_BASE_URL = "https://api.kie.ai";
const VERIFICATION_PHRASE_LANGUAGE = "zh";
const logger = getLogger("custom-voices");

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function taskSummary(data: Record<string, unknown>) {
  const nested = (data.data && typeof data.data === "object" ? data.data : {}) as Record<string, unknown>;
  return {
    code: data.code ?? nested.code,
    message: data.msg ?? data.message ?? nested.msg ?? nested.message,
    status: data.status ?? nested.status,
    taskId: data.task_id ?? data.taskId ?? nested.task_id ?? nested.taskId,
    hasVerifyText: Boolean(
      data.verifyText ??
        data.verify_text ??
        data.validateInfo ??
        data.validate_info ??
        nested.verifyText ??
        nested.verify_text ??
        nested.validateInfo ??
        nested.validate_info,
    ),
    hasVoiceId: Boolean(data.voiceId ?? data.voice_id ?? nested.voiceId ?? nested.voice_id),
  };
}

function apiKey() {
  const key = process.env.KIE_API_KEY;
  if (!key) throw new Error("KIE_API_KEY is not configured");
  return key;
}

function callbackUrl() {
  const base = process.env.WEBHOOK_BASE_URL?.replace(/\/+$/, "");
  if (!base) throw new Error("WEBHOOK_BASE_URL is not configured");
  return `${base}/api/webhooks/kie/voice`;
}

function kiePayloadSummary(payload: Record<string, unknown>) {
  return {
    keys: Object.keys(payload),
    taskId: payload.taskId,
    voiceName: payload.voiceName,
    language: payload.language,
    vocalStartS: payload.vocalStartS,
    vocalEndS: payload.vocalEndS,
    hasVoiceUrl: Boolean(payload.voiceUrl),
    hasVerifyUrl: Boolean(payload.verifyUrl),
    hasCallbackUrl: Boolean(payload.callBackUrl),
  };
}

async function kie(path: string, payload: Record<string, unknown>) {
  const startedAt = Date.now();
  const url = `${KIE_BASE_URL}${path}`;
  const request = {
    method: "POST",
    path,
    url,
    payload: kiePayloadSummary(payload),
  };
  logger.info({ request }, "Submitting KIE voice request");
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok || (json.code !== undefined && json.code !== 200)) {
    logger.error({ request, statusCode: response.status, elapsedMs: Date.now() - startedAt, response: taskSummary(json), kieResponse: json }, "KIE voice request failed");
    throw new Error(json.msg || json.message || "KIE Voice request failed.");
  }
  logger.info({ request, statusCode: response.status, elapsedMs: Date.now() - startedAt, response: taskSummary(json), kieResponse: json }, "KIE voice request accepted");
  return json.data || {};
}

async function kieGet(path: string) {
  const startedAt = Date.now();
  const url = `${KIE_BASE_URL}${path}`;
  const request = { method: "GET", path, url };
  logger.debug({ request }, "Polling KIE voice task");
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey()}` },
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok || (json.code !== undefined && json.code !== 200)) {
    logger.warn({ request, statusCode: response.status, elapsedMs: Date.now() - startedAt, response: taskSummary(json), kieResponse: json }, "KIE voice task poll failed");
    throw new Error(json.msg || json.message || "KIE Voice request failed.");
  }
  logger.info({ request, statusCode: response.status, elapsedMs: Date.now() - startedAt, response: taskSummary(json), kieResponse: json }, "KIE voice task poll completed");
  return json.data || {};
}

export async function listCustomVoices(userId: string) {
  const voices = await db.select().from(customVoices).where(eq(customVoices.userId, userId)).orderBy(desc(customVoices.createdAt));
  logger.debug({ userId, voiceCount: voices.length, statuses: voices.map((voice) => voice.status) }, "Listed custom voices");
  return voices;
}

export async function getCustomVoice(userId: string, voiceId: string) {
  const [voice] = await db
    .select()
    .from(customVoices)
    .where(and(eq(customVoices.id, voiceId), eq(customVoices.userId, userId)))
    .limit(1);

  return voice || null;
}

export async function updateCustomVoiceDetails(input: {
  userId: string;
  voiceId: string;
  name: string;
  description?: string;
  style?: string;
  imageUrl?: string;
  imageKey?: string;
}) {
  const [voice] = await db
    .update(customVoices)
    .set({
      name: input.name,
      description: input.description || null,
      style: input.style || null,
      ...(input.imageUrl ? { imageUrl: input.imageUrl } : {}),
      ...(input.imageKey ? { imageKey: input.imageKey } : {}),
    })
    .where(and(eq(customVoices.id, input.voiceId), eq(customVoices.userId, input.userId)))
    .returning();

  if (!voice) throw new Error("Voice not found.");

  logger.info({ userId: input.userId, voiceId: input.voiceId, hasImage: Boolean(input.imageUrl) }, "Updated custom voice details");
  return voice;
}

async function refreshPendingVoice(voice: typeof customVoices.$inferSelect) {
  if (
    voice.verificationTaskId &&
    (voice.status === "preparing_verification" ||
      (voice.status === "awaiting_recording" && !voice.verifyText))
  ) {
    try {
      const data = await kieGet(
        `/api/v1/voice/validate-info?taskId=${encodeURIComponent(voice.verificationTaskId)}`,
      );
      await completeCustomVoiceTask(voice.verificationTaskId, data);
    } catch (error) {
      logger.warn({ voiceId: voice.id, taskId: voice.verificationTaskId, status: voice.status, error: errorMessage(error) }, "Unable to refresh pending voice verification; keeping it pending for retry");
    }
    return;
  }

  if (voice.status === "creating" && voice.creationTaskId) {
    try {
      const data = await kieGet(
        `/api/v1/voice/record-info?taskId=${encodeURIComponent(voice.creationTaskId)}`,
      );
      await completeCustomVoiceTask(voice.creationTaskId, data);
    } catch (error) {
      logger.warn({ voiceId: voice.id, taskId: voice.creationTaskId, status: voice.status, error: errorMessage(error) }, "Unable to refresh pending custom voice generation; keeping it pending for retry");
    }
  }
}

export async function refreshCustomVoiceStatus(userId: string, voiceId: string) {
  const voice = await getCustomVoice(userId, voiceId);
  if (!voice) return null;

  await refreshPendingVoice(voice);
  return getCustomVoice(userId, voiceId);
}

export async function refreshPendingVoiceVerifications(userId: string) {
  const voices = await listCustomVoices(userId);
  const pendingVerifications = voices.filter(
    (voice) =>
      voice.verificationTaskId &&
      (voice.status === "preparing_verification" ||
        (voice.status === "awaiting_recording" && !voice.verifyText)),
  );
  const pendingGenerations = voices.filter(
    (voice) => voice.status === "creating" && voice.creationTaskId,
  );

  logger.debug({ userId, pendingVerificationCount: pendingVerifications.length, pendingGenerationCount: pendingGenerations.length, pendingVerifications: pendingVerifications.map((voice) => ({ voiceId: voice.id, status: voice.status, taskId: voice.verificationTaskId })), pendingGenerations: pendingGenerations.map((voice) => ({ voiceId: voice.id, status: voice.status, taskId: voice.creationTaskId })) }, "Refreshing pending custom voice tasks");

  await Promise.all([...pendingVerifications, ...pendingGenerations].map(refreshPendingVoice));
}

export async function canCreateCustomVoice(userId: string) {
  if (await hasActiveSubscription(userId)) return true;
  const [existing] = await db.select({ id: customVoices.id }).from(customVoices)
    .where(and(eq(customVoices.userId, userId), ne(customVoices.status, "failed"))).limit(1);
  return !existing;
}

export async function startVoiceVerification(input: { userId: string; name: string; description?: string; style?: string; sourceAudioUrl: string; sourceAudioKey: string; imageUrl?: string; imageKey?: string; language: string; vocalStartS: number; vocalEndS: number; }) {
  logger.info({ userId: input.userId, sourceAudioKey: input.sourceAudioKey, hasImage: Boolean(input.imageKey), requestedLanguage: input.language, verificationPhraseLanguage: VERIFICATION_PHRASE_LANGUAGE, vocalStartS: input.vocalStartS, vocalEndS: input.vocalEndS }, "Starting custom voice verification");
  if (!(await canCreateCustomVoice(input.userId))) throw new Error("Free accounts can create one custom voice. Upgrade to add more.");
  const [voice] = await db.insert(customVoices).values({
    userId: input.userId, name: input.name, description: input.description, style: input.style,
    sourceAudioUrl: input.sourceAudioUrl, sourceAudioKey: input.sourceAudioKey, imageUrl: input.imageUrl, imageKey: input.imageKey,
    status: "preparing_verification", consentedAt: new Date(),
  }).returning();
  logger.info({ voiceId: voice.id, userId: input.userId, status: voice.status }, "Created pending custom voice record");
  try {
    const data = await kie("/api/v1/voice/validate", { voiceUrl: input.sourceAudioUrl, vocalStartS: input.vocalStartS, vocalEndS: input.vocalEndS, language: VERIFICATION_PHRASE_LANGUAGE, callBackUrl: callbackUrl() });
    await db.update(customVoices).set({ verificationTaskId: data.taskId }).where(eq(customVoices.id, voice.id));
    logger.info({ voiceId: voice.id, taskId: data.taskId, status: "preparing_verification" }, "KIE voice verification task created");
    return { ...voice, verificationTaskId: data.taskId, status: "preparing_verification" as CustomVoiceStatus };
  } catch (error) {
    await db.update(customVoices).set({ status: "failed", error: error instanceof Error ? error.message : "Unable to prepare verification." }).where(eq(customVoices.id, voice.id));
    logger.error({ err: error, voiceId: voice.id, userId: input.userId }, "Unable to start KIE voice verification");
    throw error;
  }
}

export async function createCustomVoice(input: { id: string; userId: string; verifyUrl: string; verificationAudioUrl: string; verificationAudioKey: string; }) {
  logger.info({ voiceId: input.id, userId: input.userId, verificationAudioKey: input.verificationAudioKey }, "Submitting custom voice verification recording");
  const [voice] = await db.select().from(customVoices).where(and(eq(customVoices.id, input.id), eq(customVoices.userId, input.userId))).limit(1);
  if (voice?.status !== "awaiting_recording" || !voice.verifyText || !voice.verificationTaskId) {
    throw new Error("Wait for the verification phrase before submitting your recording.");
  }
  const data = await kie("/api/v1/voice/generate", { taskId: voice.verificationTaskId, verifyUrl: input.verifyUrl, voiceName: voice.name, description: voice.description || "", style: voice.style || "", callBackUrl: callbackUrl() });
  await db.update(customVoices).set({ verificationAudioUrl: input.verificationAudioUrl, verificationAudioKey: input.verificationAudioKey, verifyUrl: input.verifyUrl, creationTaskId: data.taskId, status: "creating", error: null }).where(eq(customVoices.id, voice.id));
  logger.info({ voiceId: voice.id, verificationTaskId: voice.verificationTaskId, creationTaskId: data.taskId, status: "creating" }, "KIE custom voice generation task created");
  return { taskId: data.taskId };
}

export async function retryCustomVoiceVerification(input: { id: string; userId: string }) {
  const [voice] = await db
    .select()
    .from(customVoices)
    .where(and(eq(customVoices.id, input.id), eq(customVoices.userId, input.userId)))
    .limit(1);

  if (!voice) {
    throw new Error("Voice not found.");
  }
  if (voice.status !== "failed" || !voice.sourceAudioUrl) {
    throw new Error("Only failed voice verifications can be retried.");
  }

  logger.info({ voiceId: voice.id, userId: input.userId, previousVerificationTaskId: voice.verificationTaskId }, "Retrying failed custom voice verification");

  try {
    const data = await kie("/api/v1/voice/validate", {
      voiceUrl: voice.sourceAudioUrl,
      vocalStartS: 0,
      vocalEndS: MIN_VOICE_SAMPLE_SECONDS,
      language: VERIFICATION_PHRASE_LANGUAGE,
      callBackUrl: callbackUrl(),
    });

    if (!data.taskId) {
      throw new Error("KIE did not return a verification task ID.");
    }

    await db
      .update(customVoices)
      .set({
        status: "preparing_verification",
        verificationTaskId: data.taskId,
        creationTaskId: null,
        verifyText: null,
        verifyUrl: null,
        verificationAudioUrl: null,
        verificationAudioKey: null,
        voiceId: null,
        error: null,
      })
      .where(eq(customVoices.id, voice.id));

    logger.info({ voiceId: voice.id, taskId: data.taskId, status: "preparing_verification" }, "Retried KIE voice verification task created");
    return { taskId: data.taskId };
  } catch (error) {
    const message = errorMessage(error);
    await db.update(customVoices).set({ status: "failed", error: message }).where(eq(customVoices.id, voice.id));
    logger.error({ err: error, voiceId: voice.id, userId: input.userId }, "Failed to retry custom voice verification");
    throw error;
  }
}

export async function deleteCustomVoice(input: { id: string; userId: string }) {
  const [voice] = await db
    .select()
    .from(customVoices)
    .where(and(eq(customVoices.id, input.id), eq(customVoices.userId, input.userId)))
    .limit(1);

  if (!voice) {
    logger.warn({ voiceId: input.id, userId: input.userId }, "Custom voice delete target not found");
    throw new Error("Voice not found.");
  }

  await db.delete(customVoices).where(eq(customVoices.id, voice.id));
  logger.info({ voiceId: voice.id, userId: input.userId, status: voice.status }, "Custom voice record deleted");

  const keys = [
    voice.sourceAudioKey,
    voice.imageKey,
    voice.verificationAudioKey,
  ].filter((key): key is string => Boolean(key));

  const deletedFiles = await Promise.allSettled(keys.map((key) => deleteFile(key)));
  logger.info({ voiceId: voice.id, storageKeyCount: keys.length, failedStorageDeletes: deletedFiles.filter((result) => result.status === "rejected").length }, "Custom voice storage cleanup completed");

  return { id: voice.id };
}

export async function completeCustomVoiceTask(taskId: string, data: any) {
  const verifyText =
    data?.verifyText ||
    data?.verify_text ||
    data?.validateInfo ||
    data?.validate_info ||
    data?.data?.verifyText ||
    data?.data?.verify_text ||
    data?.data?.validateInfo ||
    data?.data?.validate_info;
  const providerCode = Number(data?.code);
  const failed =
    (Number.isFinite(providerCode) && providerCode !== 200) ||
    /fail/i.test(String(data?.status || data?.data?.status || ""));
  const providerMessage = data?.data?.errorMessage || data?.msg || data?.message;
  const taskIds = [...new Set([
    taskId,
    data?.task_id,
    data?.taskId,
    data?.data?.task_id,
    data?.data?.taskId,
  ].filter((value): value is string => typeof value === "string" && value.length > 0))];
  const voiceId = data?.voiceId || data?.voice_id || data?.data?.voiceId || data?.data?.voice_id;
  const [creation] = await db.select({ id: customVoices.id }).from(customVoices).where(inArray(customVoices.creationTaskId, taskIds)).limit(1);

  // KIE normally issues a new creation task ID, but process a returned voice ID as
  // generation output even when a provider reuses the verification task ID.
  if (creation && (voiceId || failed)) {
    await db.update(customVoices).set(voiceId ? { voiceId, status: "ready", error: null } : { status: "failed", error: providerMessage || "Voice creation failed." }).where(eq(customVoices.id, creation.id));
    if (voiceId) {
      logger.info({ voiceId: creation.id, taskId, providerVoiceId: voiceId, status: "ready" }, "Custom voice generation completed");
    } else {
      logger.warn({ voiceId: creation.id, taskId, response: taskSummary(data), kieResponse: data }, "Custom voice generation failed");
    }
    return;
  }

  const [verification] = await db.select({ id: customVoices.id }).from(customVoices).where(eq(customVoices.verificationTaskId, taskId)).limit(1);
  if (verification) {
    if (failed) {
      await db.update(customVoices).set({ status: "failed", error: providerMessage || "Voice verification failed." }).where(eq(customVoices.id, verification.id));
      logger.warn({ voiceId: verification.id, taskId, response: taskSummary(data), kieResponse: data }, "Voice verification task failed");
    } else if (verifyText) {
      await db.update(customVoices).set({ status: "awaiting_recording", verifyText, error: null }).where(eq(customVoices.id, verification.id));
      logger.info({ voiceId: verification.id, taskId, status: "awaiting_recording", verifyTextLength: String(verifyText).length, providerStatus: data?.status || data?.data?.status }, "Voice verification phrase is ready for the user to record");
    } else {
      logger.info({ voiceId: verification.id, taskId, response: taskSummary(data), kieResponse: data }, "Voice verification task has not produced a phrase yet");
    }
    return;
  }
  if (!creation) {
    logger.warn({ taskId, taskIds, response: taskSummary(data), kieResponse: data }, "Received KIE voice task update without a matching custom voice");
    return;
  }
  await db.update(customVoices).set(voiceId ? { voiceId, status: "ready", error: null } : failed ? { status: "failed", error: providerMessage || "Voice creation failed." } : {}).where(eq(customVoices.id, creation.id));
  if (voiceId) {
    logger.info({ voiceId: creation.id, taskId, providerVoiceId: voiceId, status: "ready" }, "Custom voice generation completed");
  } else if (failed) {
    logger.warn({ voiceId: creation.id, taskId, response: taskSummary(data), kieResponse: data }, "Custom voice generation failed");
  } else {
    logger.info({ voiceId: creation.id, taskId, response: taskSummary(data), kieResponse: data }, "Custom voice generation update has no terminal result");
  }
}
