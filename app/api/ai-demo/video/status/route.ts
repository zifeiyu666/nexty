import { getVideoTaskStatus } from "@/lib/ai/video";
import { getSession } from "@/lib/auth/server";
import { apiResponse } from "@/lib/api-response";

// TODO [Auth]: Verify the requesting user owns this task before returning status.
//   import { getSession } from "@/lib/auth/server";
//   const session = await getSession();
//   if (!session?.user) return apiResponse.unauthorized();
//   Compare task.userId (stored in DB) to session.user.id.

// TODO [Polling Reduction - Task History Page]: The current client-side polling
//   (every 3 seconds in VideoResultArea.tsx) creates constant HTTP traffic.
//   Consider building a dashboard page that shows the user's video task history
//   (queried from the database), so users can leave the generation page and check
//   results later without keeping the browser open.
//   Route suggestion: /dashboard/ai-tasks or /[locale]/(dashboard)/ai-tasks/page.tsx
//   This page queries the DB for the user's tasks sorted by createdAt DESC,
//   shows status badges and thumbnails, and provides download links via presigned URLs.

// TODO [DB Fallback]: Redis keys expire after 1 hour (see lib/ai/task-store.ts TTL).
//   If the client polls after expiry, `getVideoTaskStatus` returns null even if the task
//   completed. For production, also query the database here as a fallback:
//   const dbTask = await db.query.aiVideoTasks.findFirst({ where: eq(tasks.taskId, taskId) });
//   Return the DB record when Redis returns null.

export async function GET(req: Request) {
  // Demo restriction: Only admins can use AI demo to prevent API key abuse.
  // In production, remove this check and use proper auth + rate limiting instead.
  const session = await getSession();
  if (!session?.user) {
    return apiResponse.unauthorized("Please sign in to use the AI demo.");
  }
  if (session.user.role !== "admin") {
    return apiResponse.forbidden("Admin privileges required.");
  }

  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId");

  if (!taskId) {
    return apiResponse.badRequest("taskId is required");
  }

  const task = await getVideoTaskStatus(taskId);
  if (!task) {
    return apiResponse.notFound("Task not found");
  }

  return apiResponse.success({
    taskId: task.taskId,
    status: task.status,
    videoUrl: task.videoUrl,
    error: task.error,
  });
}
