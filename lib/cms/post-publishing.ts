import type { PostStatus } from "../db/schema";

export function resolvePublishedAt({
  currentStatus,
  nextStatus,
  currentPublishedAt,
  now,
}: {
  currentStatus: PostStatus;
  nextStatus: PostStatus;
  currentPublishedAt: Date;
  now: Date;
}) {
  if (currentStatus !== "published" && nextStatus === "published") {
    return now;
  }

  return currentPublishedAt;
}
