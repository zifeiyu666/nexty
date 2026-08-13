import { apiResponse } from "@/lib/api-response";
import { consumeExtensionDraft } from "@/lib/extension-drafts";
import { recordUserActivity, recordUserIssueSignal } from "@/lib/observability/user-activity";

type Params = { params: Promise<{ token: string }> };

export async function GET(request: Request, { params }: Params) {
  const { token } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(token)) {
    return apiResponse.notFound("Draft expired or unavailable.");
  }

  const startedAt = Date.now();
  try {
    const draft = await consumeExtensionDraft(token);
    if (!draft) return apiResponse.notFound("Draft expired or unavailable.");

    await recordUserActivity({
      feature: "extension",
      action: "draft_consume",
      outcome: "succeeded",
      resourceType: "extension_draft",
      resourceId: token,
      durationMs: Date.now() - startedAt,
      metadata: { source: "browser-extension", language: "en" },
    });

    return apiResponse.success({
      occasion: draft.occasion,
      recipientName: draft.recipientName,
      relationship: draft.relationship,
      story: draft.story,
      genre: draft.genre,
      language: draft.language,
    });
  } catch (error) {
    await recordUserIssueSignal({
      feature: "extension",
      action: "draft_consume",
      outcome: "failed",
      error,
      resourceType: "extension_draft",
      resourceId: token,
      durationMs: Date.now() - startedAt,
    });
    return apiResponse.serverError("Unable to restore your draft.");
  }
}
