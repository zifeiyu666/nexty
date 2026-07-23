import {
  getMockKieSunoTaskId,
  submitTimestampedLyricsTask,
  type KieSongVersion,
  type MusicTaskResult,
} from "@/lib/ai/adapters/kie-suno";
import { persistKieSongVersionMediaToR2 } from "@/lib/ai/kie-suno-media";
import {
  getSpokenIntroRenderProgress,
  startSpokenIntroRender,
  type SpokenIntroRender,
  type SpokenIntroRenderProgress,
} from "@/lib/ai/song-intro-composer";
import {
  getSongPreviewRenderProgress,
  startSongPreviewRender,
  type SongPreviewRender,
  type SongPreviewRenderProgress,
} from "@/lib/ai/song-preview-composer";
import { mergeSpokenIntroTimeline } from "@/lib/ai/spoken-intro";
import { songSampleEmail } from "@/lib/ai/song-sample-email";
import {
  createSongSampleFromTask,
  songSampleStore,
} from "@/lib/ai/song-sample-store";
import {
  songTaskStore,
  type SongGenerationTask,
} from "@/lib/ai/song-task-store";
import { getSpokenIntroAudioTiming } from "@/lib/music-video/spoken-intro-audio";
import { SONG_AUDIO_PREVIEW_LIMIT_SECONDS } from "@/lib/music-video/song-audio-preview";

type SongCompletionDependencies = {
  getSpokenIntroRenderProgress?: (
    render: SpokenIntroRender,
  ) => Promise<SpokenIntroRenderProgress>;
  startSpokenIntroRender?: typeof startSpokenIntroRender;
  getSongPreviewRenderProgress?: (
    render: SongPreviewRender,
  ) => Promise<SongPreviewRenderProgress>;
  startSongPreviewRender?: typeof startSongPreviewRender;
};

async function attachTimestampedLyricsToVersions({
  taskId,
  versions,
}: {
  taskId: string;
  versions: KieSongVersion[];
}): Promise<KieSongVersion[]> {
  if (taskId === getMockKieSunoTaskId()) {
    console.log(
      "[KIE Suno Completion] Skipping timestamped lyrics for mock task",
      {
        taskId,
        versions: versions.map((version) => ({
          id: version.id,
          audioId: version.audioId,
          title: version.title,
        })),
      },
    );
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
        console.warn(
          "[KIE Suno Completion] Failed to fetch timestamped lyrics",
          {
            taskId,
            versionId: version.id,
            audioId,
            title: version.title,
            error,
          },
        );
        return version;
      }
    }),
  );
}

async function startSpokenIntroComposition({
  dependencies,
  task,
  versions,
}: {
  dependencies: SongCompletionDependencies;
  task: SongGenerationTask;
  versions: KieSongVersion[];
}): Promise<SongGenerationTask | null> {
  if (!task.spokenIntro) {
    return startSongPreviewComposition({ dependencies, task, versions });
  }

  const startRender =
    dependencies.startSpokenIntroRender ?? startSpokenIntroRender;
  const renders = await Promise.all(
    versions.map(async (version) => ({
      ...(await startRender({
        intro: task.spokenIntro!,
        songId: task.songId,
        version,
      })),
      versionId: version.id,
    })),
  );

  return songTaskStore.updateSong(task.songId, {
    error: undefined,
    spokenIntroRenders: renders,
    status: "processing",
    versions,
  });
}

export async function startSongPreviewComposition({
  dependencies,
  task,
  versions,
}: {
  dependencies: SongCompletionDependencies;
  task: SongGenerationTask;
  versions: KieSongVersion[];
}): Promise<SongGenerationTask | null> {
  const startRender =
    dependencies.startSongPreviewRender ?? startSongPreviewRender;
  const renders = await Promise.all(
    versions.map(async (version) => ({
      ...(await startRender({ songId: task.songId, version })),
      versionId: version.id,
    })),
  );

  return songTaskStore.updateSong(task.songId, {
    error: undefined,
    fullVersions: versions,
    songPreviewRenders: renders,
    spokenIntroRenders: undefined,
    status: "processing",
    versions: [],
  });
}

function withCompletedSpokenIntro({
  audioUrl,
  task,
  version,
}: {
  audioUrl: string;
  task: SongGenerationTask;
  version: KieSongVersion;
}): KieSongVersion {
  const intro = task.spokenIntro!;
  const timing = getSpokenIntroAudioTiming({
    introDurationSeconds: intro.durationSeconds,
    songDurationSeconds: version.duration || 0,
  });

  return {
    ...version,
    audioUrl,
    duration: version.duration ? timing.durationSeconds : undefined,
    spokenIntro: {
      audioUrl: intro.audioUrl,
      durationSeconds: intro.durationSeconds,
      songStartOffsetSeconds: timing.songStartOffsetSeconds,
      transcript: intro.transcript,
    },
    timestampedLyrics: mergeSpokenIntroTimeline({
      intro,
      songStartOffsetSeconds: timing.songStartOffsetSeconds,
      songTimeline: version.timestampedLyrics,
    }),
  };
}

export async function refreshSpokenIntroComposition({
  dependencies = {},
  task,
}: {
  dependencies?: SongCompletionDependencies;
  task: SongGenerationTask;
}): Promise<SongGenerationTask | null> {
  if (!task.spokenIntro || !task.spokenIntroRenders?.length) return task;

  const getProgress =
    dependencies.getSpokenIntroRenderProgress ?? getSpokenIntroRenderProgress;
  const progress = await Promise.all(
    task.spokenIntroRenders.map(async (render) => ({
      render,
      progress: await getProgress(render),
    })),
  );
  const failed = progress.find(({ progress: item }) => item.errorMessage);
  if (failed) {
    return songTaskStore.updateSong(task.songId, {
      error:
        failed.progress.errorMessage || "Remotion audio composition failed.",
      status: "failed",
    });
  }
  if (progress.some(({ progress: item }) => !item.done)) return task;

  const outputByVersion = new Map(
    progress.map(({ progress: item, render }) => [
      render.versionId,
      item.outputFile,
    ]),
  );
  const missingOutput = task.spokenIntroRenders.find(
    (render) => !outputByVersion.get(render.versionId),
  );
  if (missingOutput) {
    return songTaskStore.updateSong(task.songId, {
      error: `Remotion audio composition returned no output for ${missingOutput.versionId}.`,
      status: "failed",
    });
  }

  const versions = task.versions.map((version) =>
    withCompletedSpokenIntro({
      audioUrl: outputByVersion.get(version.id)!,
      task,
      version,
    }),
  );
  return startSongPreviewComposition({ dependencies, task, versions });
}

function withCompletedPreview({
  audioUrl,
  version,
}: {
  audioUrl: string;
  version: KieSongVersion;
}): KieSongVersion {
  const duration = version.duration
    ? Math.min(version.duration, SONG_AUDIO_PREVIEW_LIMIT_SECONDS)
    : SONG_AUDIO_PREVIEW_LIMIT_SECONDS;
  const timestampedLyrics = version.timestampedLyrics
    ? {
        ...version.timestampedLyrics,
        alignedWords: version.timestampedLyrics.alignedWords
          .filter((word) => word.startS < SONG_AUDIO_PREVIEW_LIMIT_SECONDS)
          .map((word) => ({
            ...word,
            endS: Math.min(word.endS, SONG_AUDIO_PREVIEW_LIMIT_SECONDS),
          })),
      }
    : undefined;

  return {
    ...version,
    audioUrl,
    duration,
    timestampedLyrics,
  };
}

export async function refreshSongPreviewComposition({
  dependencies = {},
  task,
}: {
  dependencies?: SongCompletionDependencies;
  task: SongGenerationTask;
}): Promise<SongGenerationTask | null> {
  if (!task.songPreviewRenders?.length || !task.fullVersions?.length) {
    return task;
  }

  const getProgress =
    dependencies.getSongPreviewRenderProgress ?? getSongPreviewRenderProgress;
  const progress = await Promise.all(
    task.songPreviewRenders.map(async (render) => ({
      render,
      progress: await getProgress(render),
    })),
  );
  const failed = progress.find(({ progress: item }) => item.errorMessage);
  if (failed) {
    return songTaskStore.updateSong(task.songId, {
      error:
        failed.progress.errorMessage ||
        "Remotion song preview rendering failed.",
      status: "failed",
    });
  }
  if (progress.some(({ progress: item }) => !item.done)) return task;

  const outputByVersion = new Map(
    progress.map(({ progress: item, render }) => [
      render.versionId,
      item.outputFile,
    ]),
  );
  const missingOutput = task.songPreviewRenders.find(
    (render) => !outputByVersion.get(render.versionId),
  );
  if (missingOutput) {
    return songTaskStore.updateSong(task.songId, {
      error: `Remotion song preview returned no output for ${missingOutput.versionId}.`,
      status: "failed",
    });
  }

  const versions = task.fullVersions.map((version) =>
    withCompletedPreview({
      audioUrl: outputByVersion.get(version.id)!,
      version,
    }),
  );
  return finalizeSongTask(task, versions);
}

export async function completeSongTaskFromKieResult({
  dependencies = {},
  result,
  task,
}: {
  dependencies?: SongCompletionDependencies;
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

  if (task.status === "succeeded") return task;
  if (task.songPreviewRenders?.length) {
    return refreshSongPreviewComposition({ dependencies, task });
  }
  if (task.spokenIntroRenders?.length) {
    return refreshSpokenIntroComposition({ dependencies, task });
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

  const timestampedVersions = await attachTimestampedLyricsToVersions({
    taskId: task.externalId,
    versions: r2Versions,
  });
  console.log("[KIE Suno Completion] Timestamped lyrics attached summary", {
    songId: task.songId,
    externalId: task.externalId,
    versions: timestampedVersions.map((version) => ({
      id: version.id,
      audioId: version.audioId,
      title: version.title,
      alignedWords: version.timestampedLyrics?.alignedWords?.length || 0,
      hasWaveform: Boolean(version.timestampedLyrics?.waveformData?.length),
    })),
  });

  return startSpokenIntroComposition({
    dependencies,
    task,
    versions: timestampedVersions,
  });
}

async function finalizeSongTask(
  task: SongGenerationTask,
  versions: KieSongVersion[],
): Promise<SongGenerationTask | null> {
  const updated = await songTaskStore.updateSong(task.songId, {
    error: undefined,
    songPreviewRenders: undefined,
    spokenIntroRenders: undefined,
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
      updated.songId,
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
      console.log(
        "[KIE Suno Completion] Song sample ready email already sent",
        {
          songId: updated.songId,
        },
      );
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
