import { z } from "zod";

export const EXTENSION_DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

export const extensionDraftSchema = z.object({
  occasion: z.string().trim().min(1).max(120),
  recipientName: z.string().trim().min(1).max(80),
  relationship: z.string().trim().max(80).default(""),
  story: z.string().trim().min(10).max(2000),
  genre: z.string().trim().min(1).max(120),
  language: z.literal("en"),
  source: z.literal("browser-extension"),
  campaign: z.literal("extension").optional(),
});

export function createExtensionDraftExpiry(now = new Date()) {
  return new Date(now.getTime() + EXTENSION_DRAFT_TTL_MS);
}
