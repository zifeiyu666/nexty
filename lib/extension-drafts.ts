import "server-only";

import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { extensionDrafts } from "@/lib/db/schema";
import type { ExtensionDraftInput } from "@/lib/extension-draft-types";
import { createExtensionDraftExpiry } from "@/lib/extension-draft-validation";

export type ExtensionDraft = ExtensionDraftInput & {
  token: string;
  expiresAt: Date;
};

export async function createExtensionDraft(input: ExtensionDraftInput) {
  const expiresAt = createExtensionDraftExpiry();
  const token = crypto.randomUUID();

  await db.insert(extensionDrafts).values({
    token,
    occasion: input.occasion,
    recipientName: input.recipientName,
    relationship: input.relationship,
    story: input.story,
    genre: input.genre,
    language: input.language,
    source: input.source,
    campaign: input.campaign ?? "extension",
    expiresAt,
  });

  return { token, expiresAt };
}

/**
 * Claims an unexpired draft atomically. A draft can be restored only once.
 */
export async function consumeExtensionDraft(token: string): Promise<ExtensionDraft | null> {
  const now = new Date();
  const [draft] = await db
    .update(extensionDrafts)
    .set({ consumedAt: now })
    .where(
      and(
        eq(extensionDrafts.token, token),
        isNull(extensionDrafts.consumedAt),
        gt(extensionDrafts.expiresAt, now),
      ),
    )
    .returning();

  if (!draft) return null;

  return {
    token: draft.token,
    occasion: draft.occasion,
    recipientName: draft.recipientName,
    relationship: draft.relationship || "",
    story: draft.story,
    genre: draft.genre,
    language: "en",
    source: "browser-extension",
    campaign: draft.campaign === "extension" ? "extension" : undefined,
    expiresAt: draft.expiresAt,
  };
}
