import { apiResponse } from "@/lib/api-response";
import { getSession } from "@/lib/auth/server";
import { recordUserActivity } from "@/lib/observability/user-activity";
import { z } from "zod";

const schema = z.object({
  page: z.string().trim().startsWith("/").max(300),
  message: z.string().trim().min(3).max(1500),
  requestId: z.string().uuid(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user) return apiResponse.unauthorized();
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return apiResponse.badRequest("Please describe the issue before sending.");

  await recordUserActivity({
    userId: session.user.id,
    feature: "support",
    action: "reported_issue",
    outcome: "started",
    resourceType: "support_request",
    resourceId: parsed.data.requestId,
    metadata: { page: parsed.data.page },
  });
  return apiResponse.success({ requestId: parsed.data.requestId });
}
