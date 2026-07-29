import { db } from "@/lib/db";
import { customVoices, type CustomVoiceStatus } from "@/lib/db/schema";
import { hasActiveSubscription } from "@/lib/ai/song";
import { and, desc, eq, ne } from "drizzle-orm";

const KIE_BASE_URL = "https://api.kie.ai";

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

async function kie(path: string, payload: Record<string, unknown>) {
  const response = await fetch(`${KIE_BASE_URL}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok || (json.code !== undefined && json.code !== 200)) {
    throw new Error(json.msg || json.message || "KIE Voice request failed.");
  }
  return json.data || {};
}

export async function listCustomVoices(userId: string) {
  return db.select().from(customVoices).where(eq(customVoices.userId, userId)).orderBy(desc(customVoices.createdAt));
}

export async function canCreateCustomVoice(userId: string) {
  if (await hasActiveSubscription(userId)) return true;
  const [existing] = await db.select({ id: customVoices.id }).from(customVoices)
    .where(and(eq(customVoices.userId, userId), ne(customVoices.status, "failed"))).limit(1);
  return !existing;
}

export async function startVoiceVerification(input: { userId: string; name: string; description?: string; style?: string; sourceAudioUrl: string; sourceAudioKey: string; imageUrl?: string; imageKey?: string; language: string; vocalStartS: number; vocalEndS: number; }) {
  if (!(await canCreateCustomVoice(input.userId))) throw new Error("Free accounts can create one custom voice. Upgrade to add more.");
  const [voice] = await db.insert(customVoices).values({
    userId: input.userId, name: input.name, description: input.description, style: input.style,
    sourceAudioUrl: input.sourceAudioUrl, sourceAudioKey: input.sourceAudioKey, imageUrl: input.imageUrl, imageKey: input.imageKey,
    status: "preparing_verification", consentedAt: new Date(),
  }).returning();
  try {
    const data = await kie("/api/v1/voice/validate", { voiceUrl: input.sourceAudioUrl, vocalStartS: input.vocalStartS, vocalEndS: input.vocalEndS, language: input.language, callBackUrl: callbackUrl() });
    await db.update(customVoices).set({ verificationTaskId: data.taskId, status: "awaiting_recording" }).where(eq(customVoices.id, voice.id));
    return { ...voice, verificationTaskId: data.taskId, status: "awaiting_recording" as CustomVoiceStatus };
  } catch (error) {
    await db.update(customVoices).set({ status: "failed", error: error instanceof Error ? error.message : "Unable to prepare verification." }).where(eq(customVoices.id, voice.id));
    throw error;
  }
}

export async function createCustomVoice(input: { id: string; userId: string; verifyUrl: string; verificationAudioUrl: string; verificationAudioKey: string; }) {
  const [voice] = await db.select().from(customVoices).where(and(eq(customVoices.id, input.id), eq(customVoices.userId, input.userId))).limit(1);
  if (!voice?.verificationTaskId) throw new Error("Voice verification is not ready.");
  const data = await kie("/api/v1/voice/generate", { taskId: voice.verificationTaskId, verifyUrl: input.verifyUrl, voiceName: voice.name, description: voice.description || "", style: voice.style || "", callBackUrl: callbackUrl() });
  await db.update(customVoices).set({ verificationAudioUrl: input.verificationAudioUrl, verificationAudioKey: input.verificationAudioKey, verifyUrl: input.verifyUrl, creationTaskId: data.taskId, status: "creating", error: null }).where(eq(customVoices.id, voice.id));
  return { taskId: data.taskId };
}

export async function completeCustomVoiceTask(taskId: string, data: any) {
  const verifyText = data?.verifyText || data?.verify_text || data?.data?.verifyText || data?.data?.verify_text;
  const [verification] = await db.select({ id: customVoices.id }).from(customVoices).where(eq(customVoices.verificationTaskId, taskId)).limit(1);
  if (verification) {
    await db.update(customVoices).set({ status: "awaiting_recording", verifyText: verifyText || null, error: null }).where(eq(customVoices.id, verification.id));
    return;
  }
  const voiceId = data?.voiceId || data?.voice_id || data?.data?.voiceId || data?.data?.voice_id;
  const failed = data?.code === 501 || /fail/i.test(String(data?.status || data?.data?.status || ""));
  const [voice] = await db.select({ id: customVoices.id }).from(customVoices).where(eq(customVoices.creationTaskId, taskId)).limit(1);
  if (!voice) return;
  await db.update(customVoices).set(voiceId ? { voiceId, status: "ready", error: null } : failed ? { status: "failed", error: data?.msg || "Voice creation failed." } : {}).where(eq(customVoices.id, voice.id));
}
