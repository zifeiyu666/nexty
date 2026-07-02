import {
  getMockKieSunoTaskId,
  submitTimestampedLyricsTask,
  type KieSongVersion,
  type MusicTaskResult,
} from "@/lib/ai/adapters/kie-suno";
import { persistKieSongVersionMediaToR2 } from "@/lib/ai/kie-suno-media";
import { songSampleEmail } from "@/lib/ai/song-sample-email";
import {
  createSongSampleFromTask,
  songSampleStore,
} from "@/lib/ai/song-sample-store";
import { songTaskStore, type SongGenerationTask } from "@/lib/ai/song-task-store";

async function attachTimestampedLyricsToVersions({
  taskId,
  versions,
}: {
  taskId: string;
  versions: KieSongVersion[];
}): Promise<KieSongVersion[]> {
  if (taskId === getMockKieSunoTaskId()) {
    console.log("[KIE Suno Completion] Skipping timestamped lyrics for mock task", {
      taskId,
      versions: versions.map((version) => ({
        id: version.id,
        audioId: version.audioId,
        title: version.title,
      })),
    });
    return versions;
  }

  return Promise.all(
    versions.map(async (version) => {
      const audioId = version.audioId || version.id;
      try {
        console.log("[KIE Suno Completion] Fetching timestamped lyrics", {
          taskId,
          versionId: version.id,
          audioId,
          title: version.title,
          audioUrl: version.audioUrl,
        });

        const result = await submitTimestampedLyricsTask({
          taskId,
          audioId,
        });

        console.log("[KIE Suno Completion] Timestamped lyrics response", {
          taskId,
          versionId: version.id,
          audioId,
          status: result.status,
          alignedWords: result.alignedWords.length,
          waveformPoints: result.waveformData?.length || 0,
          error: result.error,
        });

        if (result.status !== "succeeded" || result.alignedWords.length === 0) {
          return version;
        }

        return {
          ...version,
          timestampedLyrics: {
            alignedWords: result.alignedWords,
            waveformData: result.waveformData,
            hootCer: result.hootCer,
            isStreamed: result.isStreamed,
          },
        };
      } catch (error) {
        console.warn("[KIE Suno Completion] Failed to fetch timestamped lyrics", {
          taskId,
          versionId: version.id,
          audioId,
          title: version.title,
          error,
        });
        return version;
      }
    }),
  );
}

export async function completeSongTaskFromKieResult({
  result,
  task,
}: {
  result: MusicTaskResult;
  task: SongGenerationTask;
}): Promise<SongGenerationTask | null> {
  if (result.status === "failed") {
    return songTaskStore.updateSong(task.songId, {
      status: "failed",
      error: result.error || "KIE song generation failed.",
    });
  }

  if (result.status !== "succeeded" || !result.versions.length) {
    return task;
  }

  const isMockTask = task.externalId === getMockKieSunoTaskId();
  console.log("[KIE Suno Completion] Starting completion", {
    songId: task.songId,
    externalId: task.externalId,
    incomingVersions: result.versions.length,
    isMockTask,
  });

  const r2Versions = isMockTask
    ? result.versions
    : await persistKieSongVersionMediaToR2({
        externalId: task.externalId,
        songId: task.songId,
        versions: result.versions,
      });

  console.log("[KIE Suno Completion] Media persistence completed", {
    songId: task.songId,
    externalId: task.externalId,
    versions: r2Versions.map((version) => ({
      id: version.id,
      hasAudioUrl: Boolean(version.audioUrl),
      hasImageUrl: Boolean(version.imageUrl),
      audioHost: safeUrlHost(version.audioUrl),
      imageHost: version.imageUrl ? safeUrlHost(version.imageUrl) : undefined,
    })),
  });

  const versions = await attachTimestampedLyricsToVersions({
    taskId: task.externalId,
    versions: r2Versions,
  });
  console.log("[KIE Suno Completion] Timestamped lyrics attached summary", {
    songId: task.songId,
    externalId: task.externalId,
    versions: versions.map((version) => ({
      id: version.id,
      audioId: version.audioId,
      title: version.title,
      alignedWords: version.timestampedLyrics?.alignedWords?.length || 0,
      hasWaveform: Boolean(version.timestampedLyrics?.waveformData?.length),
    })),
  });

  const updated = await songTaskStore.updateSong(task.songId, {
    status: "succeeded",
    versions,
  });

  if (updated) {
    console.log("[KIE Suno Completion] Task state updated", {
      songId: updated.songId,
      status: updated.status,
      versions: updated.versions.length,
      timestampedLyrics: updated.versions.filter(
        (version) => version.timestampedLyrics?.alignedWords?.length,
      ).length,
    });

    const sample = createSongSampleFromTask(updated);
    console.log("[KIE Suno Completion] Saving song sample", {
      songId: updated.songId,
      sampleSongId: sample.songId,
      versions: sample.versions.length,
      previewLimitSeconds: sample.previewLimitSeconds,
      accessExpiresAt: sample.accessExpiresAt,
    });
    await songSampleStore.save(sample);
    console.log("[KIE Suno Completion] Song sample saved", {
      songId: updated.songId,
      sampleSongId: sample.songId,
    });

    const shouldSendReadyEmail = await songTaskStore.claimSongSampleReadyEmail(
      updated.songId
    );
    console.log("[KIE Suno Completion] Song sample ready email claim", {
      songId: updated.songId,
      shouldSendReadyEmail,
    });
    if (shouldSendReadyEmail) {
      await songSampleEmail.sendSongSampleReadyEmail(sample);
      console.log("[KIE Suno Completion] Song sample ready email sent", {
        songId: updated.songId,
        sampleSongId: sample.songId,
      });
    } else {
      console.log("[KIE Suno Completion] Song sample ready email already sent", {
        songId: updated.songId,
      });
    }
  }

  return updated;
}

function safeUrlHost(url: string): string | undefined {
  try {
    return new URL(url).host;
  } catch {
    return undefined;
  }
}
