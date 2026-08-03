"use server";

import { actionResponse, type ActionResult } from "@/lib/action-response";
import { isAdmin } from "@/lib/auth/server";
import { db } from "@/lib/db";
import {
  creditLogs,
  customVoices,
  musicVideos,
  orders,
  songs,
  user,
  userActivityEvents,
} from "@/lib/db/schema";
import { getErrorMessage } from "@/lib/error-utils";
import { createIssueFingerprint } from "@/lib/observability/activity-safety";
import { and, count, desc, eq, gte, ilike, lte, or } from "drizzle-orm";
import { z } from "zod";

export type AdminActivityRecord = {
  id: string;
  source: "event" | "historical";
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  feature: string;
  action: string;
  outcome: string;
  resourceType: string | null;
  resourceId: string | null;
  durationMs: number | null;
  issueFingerprint: string | null;
  metadata: Record<string, unknown>;
  occurredAt: Date;
};

const FilterSchema = z.object({
  pageIndex: z.coerce.number().int().min(0).default(0),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  filter: z.string().trim().max(200).default(""),
  feature: z.string().trim().max(80).optional(),
  outcome: z.string().trim().max(24).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

type ActivityFilter = z.infer<typeof FilterSchema>;
const LEGACY_LIMIT = 1000;

function matchesFilter(record: AdminActivityRecord, filter: ActivityFilter) {
  if (filter.feature && record.feature !== filter.feature) return false;
  if (filter.outcome && record.outcome !== filter.outcome) return false;
  if (filter.dateFrom && record.occurredAt < filter.dateFrom) return false;
  if (filter.dateTo && record.occurredAt > filter.dateTo) return false;
  if (!filter.filter) return true;
  const value = filter.filter.toLowerCase();
  return [record.userName, record.userEmail, record.feature, record.action, record.resourceId, record.issueFingerprint]
    .filter(Boolean)
    .some((item) => item!.toLowerCase().includes(value));
}

async function getHistoricalActivity(): Promise<AdminActivityRecord[]> {
  const [users, songRows, voiceRows, videoRows, orderRows, creditRows] = await Promise.all([
    db.select({ id: user.id, name: user.name, email: user.email }).from(user),
    db.select().from(songs).orderBy(desc(songs.createdAt)).limit(LEGACY_LIMIT),
    db.select().from(customVoices).orderBy(desc(customVoices.updatedAt)).limit(LEGACY_LIMIT),
    db.select().from(musicVideos).orderBy(desc(musicVideos.updatedAt)).limit(LEGACY_LIMIT),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(LEGACY_LIMIT),
    db.select().from(creditLogs).orderBy(desc(creditLogs.createdAt)).limit(LEGACY_LIMIT),
  ]);
  const userById = new Map(users.map((item) => [item.id, item]));
  const identity = (userId: string) => userById.get(userId);
  const getUserFields = (userId: string) => {
    const actor = identity(userId);
    return { userId, userName: actor?.name ?? null, userEmail: actor?.email ?? null };
  };

  return [
    ...songRows.map((item) => ({
      id: `legacy-song-${item.id}`,
      source: "historical" as const,
      ...getUserFields(item.userId),
      feature: "song",
      action: "saved",
      outcome: item.status === "failed" ? "failed" : "succeeded",
      resourceType: "song",
      resourceId: item.id,
      durationMs: null,
      issueFingerprint: item.status === "failed" ? createIssueFingerprint({ feature: "song", action: "saved", error: item.status }) : null,
      metadata: { status: item.status, title: item.title.slice(0, 120), historical: true },
      occurredAt: item.createdAt,
    })),
    ...voiceRows.map((item) => ({
      id: `legacy-voice-${item.id}`,
      source: "historical" as const,
      ...getUserFields(item.userId),
      feature: "voice",
      action: "clone",
      outcome: item.status === "failed" ? "failed" : item.status === "ready" ? "succeeded" : "started",
      resourceType: "custom_voice",
      resourceId: item.id,
      durationMs: null,
      issueFingerprint: item.status === "failed" ? createIssueFingerprint({ feature: "voice", action: "clone", error: item.error ?? "voice_failed" }) : null,
      metadata: { status: item.status, historical: true },
      occurredAt: item.updatedAt,
    })),
    ...videoRows.map((item) => ({
      id: `legacy-video-${item.id}`,
      source: "historical" as const,
      ...getUserFields(item.userId),
      feature: "music_video",
      action: "render",
      outcome: item.status === "failed" ? "failed" : item.status === "completed" ? "succeeded" : "started",
      resourceType: "music_video",
      resourceId: item.id,
      durationMs: null,
      issueFingerprint: item.status === "failed" ? createIssueFingerprint({ feature: "music_video", action: "render", error: item.error ?? "render_failed" }) : null,
      metadata: { status: item.status, templateId: item.templateId, historical: true },
      occurredAt: item.updatedAt,
    })),
    ...orderRows.map((item) => ({
      id: `legacy-order-${item.id}`,
      source: "historical" as const,
      ...getUserFields(item.userId),
      feature: "payment",
      action: item.orderType,
      outcome: item.status === "succeeded" ? "succeeded" : "failed",
      resourceType: "order",
      resourceId: item.id,
      durationMs: null,
      issueFingerprint: item.status === "succeeded" ? null : createIssueFingerprint({ feature: "payment", action: item.orderType, error: item.status }),
      metadata: { provider: item.provider, status: item.status, historical: true },
      occurredAt: item.createdAt,
    })),
    ...creditRows.map((item) => ({
      id: `legacy-credit-${item.id}`,
      source: "historical" as const,
      ...getUserFields(item.userId),
      feature: "entitlement",
      action: item.type,
      outcome: "succeeded",
      resourceType: "credit_log",
      resourceId: item.id,
      durationMs: null,
      issueFingerprint: null,
      metadata: { historical: true },
      occurredAt: item.createdAt,
    })),
  ];
}

export type GetActivityResult = ActionResult<{ items: AdminActivityRecord[]; totalCount: number }>;

export async function getActivity(params: z.input<typeof FilterSchema>): Promise<GetActivityResult> {
  if (!(await isAdmin())) return actionResponse.forbidden("Admin privileges required.");
  try {
    const filter = FilterSchema.parse(params);
    const conditions = [
      filter.feature ? eq(userActivityEvents.feature, filter.feature) : undefined,
      filter.outcome ? eq(userActivityEvents.outcome, filter.outcome) : undefined,
      filter.dateFrom ? gte(userActivityEvents.occurredAt, filter.dateFrom) : undefined,
      filter.dateTo ? lte(userActivityEvents.occurredAt, filter.dateTo) : undefined,
      filter.filter ? or(ilike(user.email, `%${filter.filter}%`), ilike(user.name, `%${filter.filter}%`), ilike(userActivityEvents.feature, `%${filter.filter}%`), ilike(userActivityEvents.action, `%${filter.filter}%`)) : undefined,
    ].filter(Boolean);
    const where = conditions.length ? and(...conditions) : undefined;
    const [eventRows, countRows, legacy] = await Promise.all([
      db.select({ event: userActivityEvents, userName: user.name, userEmail: user.email })
        .from(userActivityEvents).leftJoin(user, eq(userActivityEvents.userId, user.id))
        .where(where).orderBy(desc(userActivityEvents.occurredAt)).limit(LEGACY_LIMIT),
      db.select({ value: count() }).from(userActivityEvents).leftJoin(user, eq(userActivityEvents.userId, user.id)).where(where),
      getHistoricalActivity(),
    ]);
    const events: AdminActivityRecord[] = eventRows.map(({ event, userName, userEmail }) => ({
      id: event.id, source: "event", userId: event.userId, userName, userEmail,
      feature: event.feature, action: event.action, outcome: event.outcome,
      resourceType: event.resourceType, resourceId: event.resourceId, durationMs: event.durationMs,
      issueFingerprint: event.issueFingerprint, metadata: (event.metadataJsonb ?? {}) as Record<string, unknown>, occurredAt: event.occurredAt,
    }));
    const items = [...events, ...legacy.filter((item) => matchesFilter(item, filter))]
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
    const start = filter.pageIndex * filter.pageSize;
    return actionResponse.success({
      items: items.slice(start, start + filter.pageSize),
      totalCount: Math.max(Number(countRows[0]?.value ?? 0), events.length) + legacy.filter((item) => matchesFilter(item, filter)).length,
    });
  } catch (error) {
    return actionResponse.error(getErrorMessage(error));
  }
}

export type AdminIssue = {
  fingerprint: string;
  feature: string;
  action: string;
  occurrences: number;
  affectedUsers: number;
  firstOccurredAt: Date;
  lastOccurredAt: Date;
  latestOutcome: string;
};

export async function getIssues(): Promise<ActionResult<{ items: AdminIssue[] }>> {
  if (!(await isAdmin())) return actionResponse.forbidden("Admin privileges required.");
  try {
    const rows = await db.select().from(userActivityEvents)
      .orderBy(desc(userActivityEvents.occurredAt)).limit(LEGACY_LIMIT);
    const timeoutBefore = new Date(Date.now() - 30 * 60 * 1000);
    const completedResources = new Set(rows.filter((row) => row.outcome === "succeeded" && row.resourceId)
      .map((row) => `${row.feature}:${row.action}:${row.resourceId}`));
    const problemRows = rows.filter((row) => {
      if (row.outcome === "failed" || row.outcome === "timed_out") return true;
      return row.outcome === "started" && row.occurredAt < timeoutBefore && Boolean(row.resourceId) && !completedResources.has(`${row.feature}:${row.action}:${row.resourceId}`);
    });
    const issues = new Map<string, AdminIssue & { users: Set<string> }>();
    for (const row of problemRows) {
      const effectiveOutcome = row.outcome === "started" ? "timed_out" : row.outcome;
      const fingerprint = row.issueFingerprint ?? createIssueFingerprint({ feature: row.feature, action: row.action, error: effectiveOutcome });
      const current = issues.get(fingerprint) ?? {
        fingerprint, feature: row.feature, action: row.action, occurrences: 0, affectedUsers: 0,
        firstOccurredAt: row.occurredAt, lastOccurredAt: row.occurredAt, latestOutcome: effectiveOutcome, users: new Set<string>(),
      };
      current.occurrences += 1;
      if (row.userId) current.users.add(row.userId);
      if (row.occurredAt < current.firstOccurredAt) current.firstOccurredAt = row.occurredAt;
      if (row.occurredAt > current.lastOccurredAt) {
        current.lastOccurredAt = row.occurredAt;
        current.latestOutcome = effectiveOutcome;
      }
      issues.set(fingerprint, current);
    }
    return actionResponse.success({ items: [...issues.values()].map(({ users, ...item }) => ({ ...item, affectedUsers: users.size })).sort((a, b) => b.lastOccurredAt.getTime() - a.lastOccurredAt.getTime()) });
  } catch (error) {
    return actionResponse.error(getErrorMessage(error));
  }
}
