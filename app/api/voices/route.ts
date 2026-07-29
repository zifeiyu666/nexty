import { apiResponse } from "@/lib/api-response";
import { getSession } from "@/lib/auth/server";
import { createCustomVoice, listCustomVoices, startVoiceVerification } from "@/lib/ai/custom-voices";
import { z } from "zod";

const startSchema = z.object({ name: z.string().trim().min(1).max(100), description: z.string().trim().max(1000).optional(), style: z.string().trim().max(300).optional(), sourceAudioUrl: z.string().url(), sourceAudioKey: z.string().startsWith("voices/source/"), imageUrl: z.string().url().optional(), imageKey: z.string().startsWith("voices/images/").optional(), language: z.string().default("en"), vocalStartS: z.number().min(0).default(0), vocalEndS: z.number().positive().max(60), consent: z.literal(true) });
const createSchema = z.object({ id: z.string().uuid(), verifyUrl: z.string().url(), verificationAudioUrl: z.string().url(), verificationAudioKey: z.string().startsWith("voices/verification/") });

export async function GET() { const session = await getSession(); if (!session?.user) return apiResponse.unauthorized(); return apiResponse.success(await listCustomVoices(session.user.id)); }
export async function POST(request: Request) { const session = await getSession(); if (!session?.user) return apiResponse.unauthorized(); const body = await request.json(); try { if (body.action === "create") return apiResponse.success(await createCustomVoice({ ...createSchema.parse(body), userId: session.user.id })); return apiResponse.success(await startVoiceVerification({ ...startSchema.parse(body), userId: session.user.id })); } catch (error) { return apiResponse.badRequest(error instanceof Error ? error.message : "Unable to create voice."); } }
