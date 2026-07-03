import { apiResponse } from "@/lib/api-response";
import { submitIndexNowUrls } from "@/lib/indexnow";
import { NextRequest } from "next/server";
import { z } from "zod";

const submitSchema = z.object({
  urls: z.array(z.string().url()).min(1).max(10000),
});

function isAuthorized(request: NextRequest) {
  const secret = process.env.INDEXNOW_SUBMIT_SECRET?.trim();
  if (!secret) return false;

  const bearerToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const headerToken = request.headers.get("x-indexnow-secret");

  return bearerToken === secret || headerToken === secret;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return apiResponse.unauthorized("Invalid IndexNow submit secret.");
  }

  const body = await request.json().catch(() => null);
  const parsedBody = submitSchema.safeParse(body);

  if (!parsedBody.success) {
    return apiResponse.badRequest("Expected JSON body: { urls: string[] }.");
  }

  try {
    const result = await submitIndexNowUrls(parsedBody.data.urls);
    return apiResponse.success(result);
  } catch (error) {
    console.error("[IndexNow] Manual submission failed:", error);
    return apiResponse.serverError("Failed to submit URLs to IndexNow.");
  }
}
