import {
  getMockKieSunoMusicResult,
  getMusicTask,
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
    return versions;
  }

  return Promise.all(
    versions.map(async (version) => {
      try {
        const result = await submitTimestampedLyricsTask({
          taskId,
          audioId: version.id,
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
          audioId: version.id,
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
  const r2Versions = isMockTask
    ? result.versions
    : await persistKieSongVersionMediaToR2({
        externalId: task.externalId,
        songId: task.songId,
        versions: result.versions,
      });
  const versions = await attachTimestampedLyricsToVersions({
    taskId: task.externalId,
    versions: r2Versions,
  });
  const updated = await songTaskStore.updateSong(task.songId, {
    status: "succeeded",
    versions,
  });

  if (updated) {
    const sample = createSongSampleFromTask(updated);
    await songSampleStore.save(sample);

    const shouldSendReadyEmail = await songTaskStore.claimSongSampleReadyEmail(
      updated.songId
    );
    if (shouldSendReadyEmail) {
      await songSampleEmail.sendSongSampleReadyEmail(sample);
    } else {
      console.log("[KIE Suno Completion] Song sample ready email already sent", {
        songId: updated.songId,
      });
    }
  }

  return updated;
}

export async function refreshProcessingSongTaskFromKie(
  task: SongGenerationTask
): Promise<SongGenerationTask | null> {
  if (task.status !== "processing" || !task.externalId) {
    return task;
  }

  const mockResult = getMockKieSunoMusicResult(task.externalId);
  if (mockResult) {
    console.log("[KIE Suno Completion] Using offline mock result", {
      songId: task.songId,
      externalId: task.externalId,
      status: mockResult.status,
      versions: mockResult.versions.length,
    });
    return completeSongTaskFromKieResult({ result: mockResult, task });
  }

  const result = await getMusicTask(task.externalId);
  return completeSongTaskFromKieResult({ result, task });
}
