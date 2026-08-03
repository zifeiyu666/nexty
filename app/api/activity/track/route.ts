import { apiResponse } from "@/lib/api-response";
import { getSession } from "@/lib/auth/server";
import { recordUserActivity, recordUserIssueSignal } from "@/lib/observability/user-activity";
import { z } from "zod";

const schema = z.object({
  feature: z.enum(["wall_art", "share"]),
  action: z.enum(["export", "open_share"]),
  outcome: z.enum(["succeeded", "failed"]),
  resourceId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user) return apiResponse.unauthorized();
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return apiResponse.badRequest("Invalid activity event.");
  const input = parsed.data;
  if (input.outcome === "failed") {
    await recordUserIssueSignal({ userId: session.user.id, feature: input.feature, action: input.action, error: "Client operation failed", resourceType: "song", resourceId: input.resourceId });
  } else {
    await recordUserActivity({ userId: session.user.id, feature: input.feature, action: input.action, outcome: "succeeded", resourceType: "song", resourceId: input.resourceId });
  }
  return apiResponse.success({});
}
