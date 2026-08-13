import { apiResponse } from "@/lib/api-response";
import {
  createExtensionDraft,
} from "@/lib/extension-drafts";
import { extensionDraftSchema } from "@/lib/extension-draft-validation";
import { checkRateLimit, getClientIPFromRequest } from "@/lib/upstash";
import { REDIS_RATE_LIMIT_CONFIGS } from "@/lib/upstash/redis-rate-limit-configs";
import { recordUserActivity, recordUserIssueSignal } from "@/lib/observability/user-activity";

const ALLOWED_ORIGINS = new Set([
  "https://sendthesong.io",
  "https://www.sendthesong.io",
  ...(process.env.EXTENSION_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  ...(process.env.NODE_ENV === "development" ? ["http://localhost:3000"] : []),
]);

function corsHeaders(request: Request) {
  const origin = request.headers.get("origin");
  const headers = new Headers({ "Cache-Control": "no-store" });
  if (
    origin &&
    (ALLOWED_ORIGINS.has(origin) || origin.startsWith("moz-extension://"))
  ) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }
  return headers;
}

function withCors<T extends Response>(response: T, headers: Headers): T {
  headers.forEach((value, key) => response.headers.set(key, value));
  return response;
}

export async function POST(request: Request) {
  const responseHeaders = corsHeaders(request);
  const clientIp = getClientIPFromRequest(request);
  if (!(await checkRateLimit(clientIp, REDIS_RATE_LIMIT_CONFIGS.extensionDraft))) {
    const response = apiResponse.error("Too many draft requests. Please try again later.", 429);
    response.headers.set("Retry-After", "3600");
    return withCors(response, responseHeaders);
  }

  const parsed = extensionDraftSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return withCors(
      apiResponse.badRequest(parsed.error.issues[0]?.message || "Invalid draft."),
      responseHeaders,
    );
  }

  const startedAt = Date.now();
  try {
    const result = await createExtensionDraft(parsed.data);
    await recordUserActivity({
      feature: "extension",
      action: "draft_create",
      outcome: "succeeded",
      resourceType: "extension_draft",
      resourceId: result.token,
      durationMs: Date.now() - startedAt,
      metadata: { source: "browser-extension", language: "en" },
    });
    return withCors(apiResponse.success(
      { token: result.token, expiresAt: result.expiresAt.toISOString() },
      201,
    ), responseHeaders);
  } catch (error) {
    await recordUserIssueSignal({
      feature: "extension",
      action: "draft_create",
      outcome: "failed",
      error,
      durationMs: Date.now() - startedAt,
      metadata: { source: "browser-extension" },
    });
    return withCors(apiResponse.serverError("Unable to save your draft."), responseHeaders);
  }
}

export async function OPTIONS(request: Request) {
  const headers = corsHeaders(request);
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  return new Response(null, { status: 204, headers });
}
