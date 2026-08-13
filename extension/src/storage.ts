import type { ExtensionDraft } from "./types";

const DRAFT_KEY = "sendthesong:unsubmitted-draft";

export async function loadDraft(): Promise<Partial<ExtensionDraft>> {
  const stored = await chrome.storage.local.get(DRAFT_KEY);
  return (stored[DRAFT_KEY] as Partial<ExtensionDraft> | undefined) || {};
}

export async function saveDraft(draft: ExtensionDraft) {
  await chrome.storage.local.set({ [DRAFT_KEY]: draft });
}

export async function clearDraft() {
  await chrome.storage.local.remove(DRAFT_KEY);
}
