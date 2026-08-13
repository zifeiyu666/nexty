import type {
  ExtensionDraftInput,
  RestoredExtensionDraft,
} from "@/lib/extension-draft-types";

export type CreateExtensionDraftResponse = {
  token: string;
  expiresAt: string;
};

export async function createExtensionDraftRequest(
  input: ExtensionDraftInput,
): Promise<CreateExtensionDraftResponse> {
  const response = await fetch("/api/extension/drafts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const payload = await response.json();

  if (!response.ok || !payload.success) {
    throw new Error(payload.error || "Unable to save your draft.");
  }

  return payload.data;
}

export async function consumeExtensionDraftRequest(
  token: string,
): Promise<RestoredExtensionDraft | null> {
  const response = await fetch(`/api/extension/drafts/${encodeURIComponent(token)}`, {
    cache: "no-store",
  });
  const payload = await response.json();

  if (response.status === 404 || response.status === 410) return null;
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || "Unable to restore your draft.");
  }

  return payload.data;
}
