type MetadataValue = string | number | boolean | null;

const SENSITIVE_KEY = /(?:token|secret|password|cookie|authorization|lyrics|story|transcript|audio|image|url|key|prompt|content|body)/i;
const TASK_ID = /(?:task|request|render|trace)[-_ ]?[a-z0-9]+/gi;
const UUID = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;
const NUMBER = /\b\d{3,}\b/g;

export type SafeActivityMetadata = Record<string, MetadataValue>;

export function sanitizeActivityMetadata(
  metadata: Record<string, unknown> | undefined,
): SafeActivityMetadata {
  if (!metadata) return {};
  const safe: SafeActivityMetadata = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (SENSITIVE_KEY.test(key)) continue;
    if (value === null || typeof value === "boolean" || typeof value === "number") {
      safe[key] = value;
    } else if (typeof value === "string" && !/https?:\/\//i.test(value)) {
      safe[key] = value.slice(0, 240);
    }
  }
  return safe;
}

export function createIssueFingerprint({
  feature,
  action,
  error,
}: {
  feature: string;
  action: string;
  error: unknown;
}) {
  const message = error instanceof Error ? error.message : String(error ?? "unknown");
  const normalized = message
    .toLowerCase()
    .replace(TASK_ID, "task")
    .replace(UUID, "uuid")
    .replace(NUMBER, "number")
    .replace(/\s+/g, " ")
    .slice(0, 160);
  let hash = 2166136261;
  for (const char of `${feature}:${action}:${normalized}`) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `issue_${(hash >>> 0).toString(36)}`;
}
