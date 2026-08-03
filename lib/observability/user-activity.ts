import "server-only";

import { db } from "@/lib/db";
import { userActivityEvents } from "@/lib/db/schema";
import { getLogger } from "@/lib/logger";
import {
  createIssueFingerprint,
  sanitizeActivityMetadata,
  type SafeActivityMetadata,
} from "./activity-safety";

const logger = getLogger("user-activity");

export const ACTIVITY_OUTCOMES = ["started", "succeeded", "failed", "abandoned", "timed_out"] as const;
export type ActivityOutcome = (typeof ACTIVITY_OUTCOMES)[number];

export type UserActivityInput = {
  userId?: string | null;
  feature: string;
  action: string;
  outcome: ActivityOutcome;
  resourceType?: string;
  resourceId?: string;
  durationMs?: number;
  metadata?: Record<string, unknown>;
  occurredAt?: Date;
};

export async function recordUserActivity(input: UserActivityInput) {
  const metadata = sanitizeActivityMetadata(input.metadata);
  try {
    await db.insert(userActivityEvents).values({
      userId: input.userId ?? null,
      feature: input.feature.slice(0, 80),
      action: input.action.slice(0, 100),
      outcome: input.outcome,
      resourceType: input.resourceType?.slice(0, 80),
      resourceId: input.resourceId?.slice(0, 300),
      durationMs: input.durationMs == null ? null : Math.max(0, Math.round(input.durationMs)),
      metadataJsonb: metadata,
      ...(input.occurredAt ? { occurredAt: input.occurredAt } : {}),
    });
  } catch (error) {
    // Observability must never turn a successful customer operation into a failure.
    logger.warn(
      { feature: input.feature, action: input.action, outcome: input.outcome, errorName: error instanceof Error ? error.name : "UnknownError" },
      "Unable to persist user activity event",
    );
  }
}

export async function recordUserIssueSignal(
  input: Omit<UserActivityInput, "outcome"> & {
    error: unknown;
    outcome?: Extract<ActivityOutcome, "failed" | "timed_out">;
  },
) {
  const issueFingerprint = createIssueFingerprint(input);
  const metadata: SafeActivityMetadata = {
    ...sanitizeActivityMetadata(input.metadata),
    errorType: input.error instanceof Error ? input.error.name : "UnknownError",
  };

  const error = input.error instanceof Error ? input.error : new Error(String(input.error ?? "Unknown error"));
  logger.captureError(error, {
    feature: input.feature,
    action: input.action,
    issueFingerprint,
    userId: input.userId ?? undefined,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    durationMs: input.durationMs,
    ...metadata,
  });

  try {
    await db.insert(userActivityEvents).values({
      userId: input.userId ?? null,
      feature: input.feature.slice(0, 80),
      action: input.action.slice(0, 100),
      outcome: input.outcome ?? "failed",
      resourceType: input.resourceType?.slice(0, 80),
      resourceId: input.resourceId?.slice(0, 300),
      durationMs: input.durationMs == null ? null : Math.max(0, Math.round(input.durationMs)),
      issueFingerprint,
      metadataJsonb: metadata,
      ...(input.occurredAt ? { occurredAt: input.occurredAt } : {}),
    });
  } catch (error) {
    logger.warn(
      { feature: input.feature, action: input.action, issueFingerprint, errorName: error instanceof Error ? error.name : "UnknownError" },
      "Unable to persist user issue signal",
    );
  }
}
