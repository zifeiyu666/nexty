import { db } from "@/lib/db";
import {
  creditLogs as creditLogsSchema,
  songs as songsSchema,
  usage as usageSchema,
} from "@/lib/db/schema";
import { deductEntitlementFromBalances, normalizeEntitlementBalances } from "@/lib/payments/entitlements";
import { getErrorMessage } from "@/lib/error-utils";
import { and, eq } from "drizzle-orm";
import type { KieSongVersion, KieTimestampedLyrics } from "./adapters/kie-suno";
import type { SongSampleView } from "./song-sample-store";

export type FinalSong = typeof songsSchema.$inferSelect;

export type FinalizeSongResult =
  | { success: true; song: FinalSong; alreadyFinalized: boolean }
  | { success: false; status: 400 | 403 | 404 | 409 | 500; error: string };

export function findSampleVersion(
  versions: KieSongVersion[],
  versionId: string
): KieSongVersion | null {
  const direct = versions.find((version) => version.id === versionId);
  if (direct) return direct;

  const alias = versionId.trim().toUpperCase();
  if (alias === "A") return versions[0] ?? null;
  if (alias === "B") return versions[1] ?? null;

  return null;
}

export function createSongShareToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const token = Buffer.from(bytes)
    .toString("base64url")
    .replace(/=+$/g, "");

  return `song_${token}`;
}

export function normalizeSongDuration(duration: unknown): number | null {
  const numeric = typeof duration === "number" ? duration : Number(duration);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return null;
  }
  return Math.floor(numeric);
}

export function getVersionTimestampedLyrics(
  version: KieSongVersion | null | undefined
): KieTimestampedLyrics | null {
  const timestampedLyrics = version?.timestampedLyrics;
  if (!timestampedLyrics?.alignedWords?.length) return null;

  return timestampedLyrics;
}

export async function getSongForOwner(
  songId: string,
  userId: string
): Promise<FinalSong | null> {
  const [song] = await db
    .select()
    .from(songsSchema)
    .where(and(eq(songsSchema.id, songId), eq(songsSchema.userId, userId)))
    .limit(1);

  return song ?? null;
}

export async function getSharedSong(shareToken: string): Promise<FinalSong | null> {
  const [song] = await db
    .select()
    .from(songsSchema)
    .where(and(eq(songsSchema.shareToken, shareToken), eq(songsSchema.shareEnabled, true)))
    .limit(1);

  return song ?? null;
}

export async function finalizeSongFromSample({
  sample,
  userId,
  versionId,
}: {
  sample: SongSampleView;
  userId: string;
  versionId: string;
}): Promise<FinalizeSongResult> {
  if (sample.userId && sample.userId !== userId) {
    return { success: false, status: 403, error: "You cannot finalize this song sample." };
  }

  if (sample.isExpired) {
    return { success: false, status: 400, error: "This song sample has expired." };
  }

  const selectedVersion = findSampleVersion(sample.versions, versionId);
  if (!selectedVersion) {
    return { success: false, status: 400, error: "Song version not found." };
  }

  if (!selectedVersion.audioUrl) {
    return { success: false, status: 409, error: "Selected song version is missing audio." };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const [existingSong] = await tx
        .select()
        .from(songsSchema)
        .where(
          and(
            eq(songsSchema.userId, userId),
            eq(songsSchema.sourceSampleId, sample.songId),
            eq(songsSchema.selectedVersionId, selectedVersion.id)
          )
        )
        .limit(1);

      if (existingSong) {
        return { song: existingSong, alreadyFinalized: true };
      }

      const usageResults = await tx
        .select({
          balanceJsonb: usageSchema.balanceJsonb,
        })
        .from(usageSchema)
        .where(eq(usageSchema.userId, userId))
        .for("update");

      const usage = usageResults[0];
      if (!usage) {
        throw new Error("INSUFFICIENT_SONG_ENTITLEMENT");
      }

      const balanceJsonb = (usage.balanceJsonb ?? {}) as Record<string, unknown>;
      const balances = normalizeEntitlementBalances(balanceJsonb.entitlements);
      const deduction = deductEntitlementFromBalances(balances, "song", 1);

      if (!deduction.success) {
        throw new Error("INSUFFICIENT_SONG_ENTITLEMENT");
      }

      await tx
        .update(usageSchema)
        .set({
          subscriptionCreditsBalance: 0,
          oneTimeCreditsBalance: 0,
          balanceJsonb: {
            ...balanceJsonb,
            entitlements: deduction.balances,
          },
        })
        .where(eq(usageSchema.userId, userId));

      await tx.insert(creditLogsSchema).values({
        userId,
        amount: 0,
        oneTimeCreditsSnapshot: 0,
        subscriptionCreditsSnapshot: 0,
        entitlementDeltaJsonb: deduction.delta,
        entitlementSnapshotJsonb: deduction.balances,
        type: "feature_usage",
        notes: `Finalize song sample ${sample.songId} version ${selectedVersion.id}`,
      });

      let song: FinalSong | null = null;
      for (let attempt = 0; attempt < 3 && !song; attempt += 1) {
        try {
          const [insertedSong] = await tx
            .insert(songsSchema)
            .values({
              userId,
              sourceSampleId: sample.songId,
              selectedVersionId: selectedVersion.id,
              title: selectedVersion.title || sample.title,
              lyrics: sample.lyrics,
              genre: sample.genre,
              occasion: sample.occasion,
              language: sample.language,
              vocalGender: sample.vocalGender,
              recipientNamesJsonb: sample.recipientNames,
              story: sample.story,
              audioUrl: selectedVersion.audioUrl,
              imageUrl: selectedVersion.imageUrl,
              duration: normalizeSongDuration(selectedVersion.duration),
              shareToken: createSongShareToken(),
              metadataJsonb: {
                source: "sample",
                sampleTitle: sample.title,
                selectedVersionTitle: selectedVersion.title,
                kieTaskId: sample.externalId,
                selectedAudioId: selectedVersion.id,
                timestampedLyrics: getVersionTimestampedLyrics(selectedVersion),
              },
            })
            .returning();
          song = insertedSong;
        } catch (insertError) {
          if (!getErrorMessage(insertError).includes("songs_share_token_unique")) {
            throw insertError;
          }
        }
      }

      if (!song) {
        throw new Error("SHARE_TOKEN_COLLISION");
      }

      return { song, alreadyFinalized: false };
    });

    return { success: true, ...result };
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_SONG_ENTITLEMENT") {
      return { success: false, status: 400, error: "Insufficient song balance." };
    }
    if (error instanceof Error && error.message === "SHARE_TOKEN_COLLISION") {
      return { success: false, status: 500, error: "Failed to create a share link." };
    }

    console.error("[final-song] Failed to finalize song", {
      sampleId: sample.songId,
      versionId,
      userId,
      error,
    });
    return { success: false, status: 500, error: "Failed to finalize song." };
  }
}
