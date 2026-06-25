import { db } from "@/lib/db";
import {
  orders as ordersSchema,
  subscriptions as subscriptionsSchema,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { finalizeSongFromSample } from "./final-song";
import { songSampleStore, type SongSampleView } from "./song-sample-store";

export type UnlockSongContext = {
  type: "unlock_song";
  songId: string;
  versionId: string;
  returnTo?: string;
};

export type UnlockSongResult =
  | {
      status: "completed";
      sampleSongId: string;
      versionId: string;
      songId: string;
      songUrl: string;
      alreadyFinalized: boolean;
      returnTo?: string;
    }
  | {
      status: "pending" | "failed";
      sampleSongId: string;
      versionId: string;
      error?: string;
      returnTo?: string;
    };

type MetadataRecord = Record<string, unknown>;
type FinalizeSong = typeof finalizeSongFromSample;

const PAYPAL_UUID_UNLOCK_PREFIX = "u:";
const PAYPAL_SAMPLE_UUID_UNLOCK_PREFIX = "s:";
const PAYPAL_JSON_UNLOCK_PREFIX = "j:";
const PAYPAL_LEGACY_SEPARATOR = "~";
const PAYPAL_UNLOCK_PAYLOAD_MAX_LENGTH = 52;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getString(value: unknown): string | undefined {
  if (Array.isArray(value)) return getString(value[0]);
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function sanitizeReturnTo(value: unknown): string | undefined {
  const returnTo = getString(value);
  if (!returnTo || !returnTo.startsWith("/") || returnTo.startsWith("//")) {
    return undefined;
  }
  return returnTo;
}

function toBase64Url(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string): string | null {
  try {
    return Buffer.from(value, "base64url").toString("utf8");
  } catch {
    return null;
  }
}

function uuidToBase64Url(uuid: string): string | null {
  if (!UUID_REGEX.test(uuid)) return null;

  return Buffer.from(uuid.replace(/-/g, ""), "hex").toString("base64url");
}

function base64UrlToUuid(value: string): string | null {
  try {
    const hex = Buffer.from(value, "base64url").toString("hex");
    if (hex.length !== 32) return null;
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(
      12,
      16
    )}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  } catch {
    return null;
  }
}

function parsePayPalUnlockPayload(value: string): UnlockSongContext | null {
  if (value.startsWith(PAYPAL_UUID_UNLOCK_PREFIX)) {
    const [encodedSongId, encodedVersionId] = value
      .slice(PAYPAL_UUID_UNLOCK_PREFIX.length)
      .split(".");
    const songId = encodedSongId ? base64UrlToUuid(encodedSongId) : null;
    const versionId = encodedVersionId ? base64UrlToUuid(encodedVersionId) : null;
    if (songId && versionId) {
      return {
        type: "unlock_song",
        songId,
        versionId,
      };
    }
  }

  if (value.startsWith(PAYPAL_SAMPLE_UUID_UNLOCK_PREFIX)) {
    const [encodedSongId, encodedVersionId] = value
      .slice(PAYPAL_SAMPLE_UUID_UNLOCK_PREFIX.length)
      .split(".");
    const songId = encodedSongId ? base64UrlToUuid(encodedSongId) : null;
    const versionId = encodedVersionId ? fromBase64Url(encodedVersionId) : null;
    if (songId && versionId) {
      return {
        type: "unlock_song",
        songId,
        versionId,
      };
    }
  }

  if (value.startsWith(PAYPAL_JSON_UNLOCK_PREFIX)) {
    const decoded = fromBase64Url(value.slice(PAYPAL_JSON_UNLOCK_PREFIX.length));
    if (!decoded) return null;

    try {
      const payload = JSON.parse(decoded) as MetadataRecord;
      const songId = getString(payload.s);
      const versionId = getString(payload.v);
      if (songId && versionId) {
        return {
          type: "unlock_song",
          songId,
          versionId,
        };
      }
    } catch {
      return null;
    }
  }

  const [songId, versionId] = value.split(PAYPAL_LEGACY_SEPARATOR);
  if (songId && versionId) {
    return {
      type: "unlock_song",
      songId,
      versionId,
    };
  }

  return null;
}

export function parseUnlockSongContext(input: unknown): UnlockSongContext | null {
  if (!input || typeof input !== "object") return null;

  const source = input as MetadataRecord;
  if (source.type !== "unlock_song") return null;

  const songId = getString(source.songId);
  const versionId = getString(source.versionId);
  if (!songId || !versionId) return null;

  return {
    type: "unlock_song",
    songId,
    versionId,
    ...(sanitizeReturnTo(source.returnTo) && {
      returnTo: sanitizeReturnTo(source.returnTo),
    }),
  };
}

export function buildUnlockSongMetadata(
  context: UnlockSongContext | null | undefined
): Record<string, string> {
  if (!context) return {};

  return {
    unlockType: "unlock_song",
    unlockSongId: context.songId,
    unlockVersionId: context.versionId,
    ...(context.returnTo && { unlockReturnTo: context.returnTo }),
  };
}

export function parseUnlockSongMetadata(
  metadata: unknown
): UnlockSongContext | null {
  if (!metadata || typeof metadata !== "object") return null;

  const source = metadata as MetadataRecord;
  const paypalUnlock = getString(source.paypalUnlock);
  if (paypalUnlock) {
    return parsePayPalUnlockPayload(paypalUnlock);
  }

  if (source.unlockType !== "unlock_song") return null;

  const songId = getString(source.unlockSongId);
  const versionId = getString(source.unlockVersionId);
  if (!songId || !versionId) return null;

  return {
    type: "unlock_song",
    songId,
    versionId,
    ...(sanitizeReturnTo(source.unlockReturnTo) && {
      returnTo: sanitizeReturnTo(source.unlockReturnTo),
    }),
  };
}

export function buildUnlockSongCheckoutParams(
  context: UnlockSongContext | null | undefined
): URLSearchParams {
  const params = new URLSearchParams();
  if (!context) return params;

  params.set("type", "unlock_song");
  params.set("songId", context.songId);
  params.set("versionId", context.versionId);
  if (context.returnTo) params.set("returnTo", context.returnTo);

  return params;
}

export function appendUnlockSongParams(
  path: string,
  context: UnlockSongContext | null | undefined
): string {
  const params = buildUnlockSongCheckoutParams(context);
  const query = params.toString();
  if (!query) return path;

  return `${path}${path.includes("?") ? "&" : "?"}${query}`;
}

export function serializeUnlockSongForPayPal(
  context: UnlockSongContext | null | undefined
): string | null {
  if (!context) return null;

  const encodedSongId = uuidToBase64Url(context.songId);
  const encodedVersionId = uuidToBase64Url(context.versionId);
  if (encodedSongId && encodedVersionId) {
    return `${PAYPAL_UUID_UNLOCK_PREFIX}${encodedSongId}.${encodedVersionId}`;
  }

  if (encodedSongId) {
    const mixedPayload = `${PAYPAL_SAMPLE_UUID_UNLOCK_PREFIX}${encodedSongId}.${toBase64Url(
      context.versionId
    )}`;
    if (mixedPayload.length <= PAYPAL_UNLOCK_PAYLOAD_MAX_LENGTH) {
      return mixedPayload;
    }
  }

  const jsonPayload = `${PAYPAL_JSON_UNLOCK_PREFIX}${toBase64Url(
    JSON.stringify({
      s: context.songId,
      v: context.versionId,
    })
  )}`;
  if (jsonPayload.length <= PAYPAL_UNLOCK_PAYLOAD_MAX_LENGTH) {
    return jsonPayload;
  }

  const legacyPayload = `${context.songId}${PAYPAL_LEGACY_SEPARATOR}${context.versionId}`;
  if (legacyPayload.length <= PAYPAL_UNLOCK_PAYLOAD_MAX_LENGTH) {
    return legacyPayload;
  }

  console.warn(
    "[song-unlock] PayPal unlock context is too long for custom_id",
    {
      songIdLength: context.songId.length,
      versionIdLength: context.versionId.length,
    }
  );
  return null;
}

export function mergeUnlockSongMetadata<T extends MetadataRecord | null | undefined>(
  metadata: T,
  result: UnlockSongResult
): MetadataRecord {
  return {
    ...((metadata && typeof metadata === "object" ? metadata : {}) as MetadataRecord),
    unlockSong: result,
  };
}

export function getUnlockSongResult(metadata: unknown): UnlockSongResult | null {
  if (!metadata || typeof metadata !== "object") return null;
  const value = (metadata as MetadataRecord).unlockSong;
  if (!value || typeof value !== "object") return null;

  const source = value as MetadataRecord;
  const status = source.status;
  const sampleSongId = getString(source.sampleSongId);
  const versionId = getString(source.versionId);
  if (
    (status !== "completed" && status !== "pending" && status !== "failed") ||
    !sampleSongId ||
    !versionId
  ) {
    return null;
  }

  if (status === "completed") {
    const songId = getString(source.songId);
    const songUrl = getString(source.songUrl);
    if (!songId || !songUrl) return null;
    return {
      status,
      sampleSongId,
      versionId,
      songId,
      songUrl,
      alreadyFinalized: source.alreadyFinalized === true,
      ...(sanitizeReturnTo(source.returnTo) && {
        returnTo: sanitizeReturnTo(source.returnTo),
      }),
    };
  }

  return {
    status,
    sampleSongId,
    versionId,
    ...(getString(source.error) && { error: getString(source.error) }),
    ...(sanitizeReturnTo(source.returnTo) && {
      returnTo: sanitizeReturnTo(source.returnTo),
    }),
  };
}

export function buildPendingUnlockSongResult(
  context: UnlockSongContext | null | undefined
): UnlockSongResult | null {
  if (!context) return null;
  return {
    status: "pending",
    sampleSongId: context.songId,
    versionId: context.versionId,
    ...(context.returnTo && { returnTo: context.returnTo }),
  };
}

export async function finalizeSongUnlockAfterPayment({
  userId,
  context,
  sampleStore = songSampleStore,
  finalizeSong = finalizeSongFromSample,
}: {
  userId: string;
  context: UnlockSongContext | null | undefined;
  sampleStore?: {
    get: (
      songId: string,
      options?: { hasActiveSubscription?: boolean }
    ) => Promise<SongSampleView | null>;
  };
  finalizeSong?: FinalizeSong;
}): Promise<UnlockSongResult | null> {
  if (!context) return null;

  const base = {
    sampleSongId: context.songId,
    versionId: context.versionId,
    ...(context.returnTo && { returnTo: context.returnTo }),
  };

  try {
    const sample = await sampleStore.get(context.songId, {
      hasActiveSubscription: true,
    });
    if (!sample) {
      return {
        status: "failed",
        ...base,
        error: "Song sample not found.",
      };
    }

    const result = await finalizeSong({
      sample,
      userId,
      versionId: context.versionId,
    });

    if (!result.success) {
      return {
        status: "failed",
        ...base,
        error: result.error,
      };
    }

    return {
      status: "completed",
      ...base,
      songId: result.song.id,
      songUrl: `/songs/${result.song.id}`,
      alreadyFinalized: result.alreadyFinalized,
    };
  } catch (error) {
    console.error("[song-unlock] Failed to finalize after payment", {
      userId,
      context,
      error,
    });
    return {
      status: "failed",
      ...base,
      error: error instanceof Error ? error.message : "Failed to unlock song.",
    };
  }
}

export async function recordOrderUnlockSongResult(
  orderId: string | null | undefined,
  result: UnlockSongResult | null
): Promise<void> {
  if (!orderId || !result) return;

  const [order] = await db
    .select({ metadata: ordersSchema.metadata })
    .from(ordersSchema)
    .where(eq(ordersSchema.id, orderId))
    .limit(1);

  await db
    .update(ordersSchema)
    .set({ metadata: mergeUnlockSongMetadata(order?.metadata as MetadataRecord, result) })
    .where(eq(ordersSchema.id, orderId));
}

export async function recordSubscriptionUnlockSongResult(
  subscriptionId: string | null | undefined,
  result: UnlockSongResult | null
): Promise<void> {
  if (!subscriptionId || !result) return;

  const [subscription] = await db
    .select({ metadata: subscriptionsSchema.metadata })
    .from(subscriptionsSchema)
    .where(eq(subscriptionsSchema.subscriptionId, subscriptionId))
    .limit(1);

  await db
    .update(subscriptionsSchema)
    .set({
      metadata: mergeUnlockSongMetadata(
        subscription?.metadata as MetadataRecord,
        result
      ),
    })
    .where(eq(subscriptionsSchema.subscriptionId, subscriptionId));
}

export async function finalizeAndRecordOrderUnlockSong({
  userId,
  context,
  orderId,
}: {
  userId: string;
  context: UnlockSongContext | null | undefined;
  orderId: string | null | undefined;
}): Promise<UnlockSongResult | null> {
  const result = await finalizeSongUnlockAfterPayment({ userId, context });
  await recordOrderUnlockSongResult(orderId, result);
  return result;
}

export async function finalizeAndRecordSubscriptionUnlockSong({
  userId,
  context,
  subscriptionId,
}: {
  userId: string;
  context: UnlockSongContext | null | undefined;
  subscriptionId: string | null | undefined;
}): Promise<UnlockSongResult | null> {
  const result = await finalizeSongUnlockAfterPayment({ userId, context });
  await recordSubscriptionUnlockSongResult(subscriptionId, result);
  return result;
}

export async function recordUnlockSongResultForOrderAndSubscription({
  orderId,
  subscriptionId,
  result,
}: {
  orderId?: string | null;
  subscriptionId?: string | null;
  result: UnlockSongResult | null;
}): Promise<void> {
  await Promise.all([
    recordOrderUnlockSongResult(orderId, result),
    recordSubscriptionUnlockSongResult(subscriptionId, result),
  ]);
}
