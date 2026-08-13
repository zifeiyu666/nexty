import type { ApiResponse, ExtensionDraft } from "./types";

const SITE_URL = "https://sendthesong.io";

export async function createRemoteDraft(draft: ExtensionDraft) {
  const response = await fetch(`${SITE_URL}/api/extension/drafts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(draft),
  });
  const payload = (await response.json()) as ApiResponse<{ token: string }>;
  if (!response.ok || !payload.success) {
    throw new Error(payload.success ? "Unable to save your draft." : payload.error || "Unable to save your draft.");
  }
  return payload.data;
}

export function createSongUrl(token: string) {
  return `${SITE_URL}/create-song?draft_token=${encodeURIComponent(token)}`;
}

export { SITE_URL };
