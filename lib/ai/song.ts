import { db } from "@/lib/db";
import { subscriptions as subscriptionsSchema } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import {
  SONG_COVER_STYLES,
  type SongCoverArtDirection,
} from "@/types/song-cover";
import {
  getMockKieSunoMusicResult,
  getMockKieSunoDelayMs,
  getMockKieSunoTaskId,
  submitMusicTask,
  type KieSongVersion,
} from "./adapters/kie-suno";
import {
  generateTextWithReplicateGpt5,
  getReplicateGpt5LyricsModel,
} from "./adapters/replicate-gpt5";
import {
  buildLyricsLineRewritePrompt,
  normalizeRewrittenLyricLines,
  SONG_LYRICS_SAFETY_AND_FORMATTING_GUIDELINES,
} from "./song-lyrics";
import {
  assertSongTaskStoreConfigured,
  createExpiresAt,
  SongGenerationTask,
  SongLyricsTask,
  songTaskStore,
} from "./song-task-store";
import {
  completeSongTaskFromKieResult,
  refreshSongPreviewComposition,
  refreshSpokenIntroComposition,
  startSongPreviewComposition,
} from "./kie-suno-song-completion";
import { addSpokenIntroToLyrics, type SpokenIntro } from "./spoken-intro";

export type SongInputContext = {
  occasion: string;
  genre: string;
  language: string;
  recipients?: Array<{
    name: string;
    relationship: string;
  }>;
  recipientNames: string[];
  recipientRelationships?: string[];
  story: string;
  userRevisionInstruction?: string;
  vocalGender: string;
};

export type SongGenerationInput = SongInputContext & {
  title: string;
  lyrics: string;
  spokenIntro?: SpokenIntro;
  sessionUser: {
    id: string;
    email: string;
    isAnonymous?: boolean;
  };
};

export function getPublicSongGenerationVersions(
  task: Pick<SongGenerationTask, "status" | "versions">,
): KieSongVersion[] {
  return task.status === "succeeded" ? task.versions : [];
}

export function needsSongPreview(
  task: Pick<
    SongGenerationTask,
    "fullVersions" | "songPreviewRenders" | "status" | "versions"
  >,
): boolean {
  return (
    task.status === "succeeded" &&
    task.versions.length > 0 &&
    !task.fullVersions?.length &&
    !task.songPreviewRenders?.length &&
    task.versions.some((version) => !version.audioUrl.includes("/preview.mp3"))
  );
}

const songCoverArtDirectionSchema = z.object({
  style: z.enum(SONG_COVER_STYLES),
  styleDescription: z.string().trim().min(3).max(500),
  subject: z.string().trim().min(3).max(500),
  mood: z.string().trim().min(3).max(300),
  palette: z.string().trim().min(3).max(300),
  lighting: z.string().trim().min(3).max(300),
  composition: z.string().trim().min(3).max(500),
  giftFeeling: z.string().trim().min(3).max(500),
});

const songLyricsGenerationSchema = z.object({
  title: z.string().trim().min(1).max(120),
  lyrics: z.string().trim().min(20).max(8000),
  coverArt: songCoverArtDirectionSchema,
});

export function parseSongLyricsGeneration(value: string): {
  title: string;
  lyrics: string;
  coverArt: SongCoverArtDirection;
} {
  const normalized = value
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return songLyricsGenerationSchema.parse(JSON.parse(normalized));
  } catch (error) {
    console.error("[song lyrics] Invalid structured generation", {
      error: error instanceof Error ? error.message : error,
      outputLength: value.length,
    });
    throw new Error(
      "The lyrics model did not return a valid gift cover art direction.",
    );
  }
}

export type SongLyricsRewriteInput = Pick<
  SongInputContext,
  | "occasion"
  | "genre"
  | "language"
  | "recipients"
  | "recipientNames"
  | "recipientRelationships"
> & {
  fullLyrics: string;
  selectedLines: string[];
  instruction?: string;
};

export type SongStoryAnswer = {
  question: string;
  answer: string;
};

export type SongStoryInput = Pick<
  SongInputContext,
  | "occasion"
  | "genre"
  | "language"
  | "recipients"
  | "recipientNames"
  | "recipientRelationships"
  | "vocalGender"
> & {
  answers: SongStoryAnswer[];
  sourceStory?: string;
};

function occasionLabel(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatRecipientsForPrompt(input: {
  recipients?: Array<{ name: string; relationship: string }>;
  recipientNames: string[];
  recipientRelationships?: string[];
}): string {
  const recipients = input.recipients?.length
    ? input.recipients
    : input.recipientNames.map((name, index) => ({
        name,
        relationship: input.recipientRelationships?.[index] || "",
      }));
  const labels = recipients
    .map((recipient) => {
      const name = recipient.name.trim();
      const relationship = recipient.relationship.trim();
      if (!name && !relationship) return "";
      if (!relationship) return name;
      if (!name) return relationship;
      return `${name} (${relationship})`;
    })
    .filter(Boolean);

  return labels.length ? labels.join(", ") : "someone special";
}

export function buildStoryPrompt(input: SongStoryInput): string {
  const recipients = formatRecipientsForPrompt(input);
  const occasion = occasionLabel(input.occasion);
  const sourceStory = input.sourceStory?.trim();
  const answers = input.answers
    .map((item, index) => {
      const question = item.question.trim();
      const answer = item.answer.trim();
      return answer ? `${index + 1}. ${question}\nAnswer: ${answer}` : "";
    })
    .filter(Boolean)
    .join("\n\n");

  const sourceMaterial = sourceStory
    ? `[Source Story To Polish]
${sourceStory}`
    : `[User Helper Answers]
${answers || "The user did not provide detailed helper answers."}`;

  return `You are a careful story editor for personalized AI songs.

Your task is to turn the user's material into a polished, lyric-ready personal story brief.

This story brief will be used as source material for a later lyric-writing model, so it must be clear, specific, emotionally useful, and faithful to the user's facts.

[Song Context]
- Recipient(s): ${recipients}
- Occasion: ${occasion}
- Target lyrics language: ${input.language}
- Music style / genre: ${input.genre}
- Vocal direction: ${input.vocalGender}

${sourceMaterial}

[Template Marker Meanings]
If the source material contains these bracketed markers, treat them as structured user intent:
- [Nickname: ] means the user wants to provide a nickname or affectionate name for the recipient.
- [Remember when we: ] means the user wants to provide a shared memory or meaningful scene.
- [Their funny habit/quirk: ] means the user wants to provide a distinctive personality detail, habit, or quirk.
- [Something they are proud of: ] means the user wants to provide an achievement, milestone, or source of pride.
- Use any filled-in text after these markers as factual source material.
- Do not output the bracketed template labels themselves. Convert them into natural story language.

[Writing Requirements]
- Write the story brief entirely in ${input.language}, even when the source material is written in another language.
- Preserve all concrete names, nicknames, places, memories, inside jokes, and meaningful phrases from the user's answers.
- Do not invent new facts, events, names, dates, locations, or promises.
- When polishing an existing story, preserve the user's facts, emotional intent, and relationship context.
- If the user provides only simple details, keep the output simple and do not add imagined scenes, emotions, backstory, settings, or relationship history.
- Do not pad the story to reach a target word count. A shorter faithful story is better than a longer story with unsupported details.
- If an answer is vague, gently make it more natural without adding unsupported details.
- Shape the brief around three things: what makes the recipient special, one memorable scene or emotional moment, and the heartfelt message the song should express.
- Make it useful for lyric generation: include vivid but concise emotional details, images, and relationship context.
- Do not write lyrics.
- Do not include song section tags like [Verse] or [Chorus].
- Do not include a title.
- Do not explain what you are doing.
- Output only the final story brief.

[Length And Style]
- Write 1-2 short paragraphs.
- Use 120-220 words only when the user supplied enough concrete detail.
- If the source material is sparse, write a shorter concise brief.
- Keep the tone sincere, warm, personal, and gift-ready.
- Avoid generic greeting-card language.
- Avoid exaggerated drama unless the user's answers clearly support it.`;
}

export function buildLyricsPrompt(input: SongInputContext): string {
  const recipients = formatRecipientsForPrompt(input);
  const revisionInstruction = input.userRevisionInstruction?.trim();

  return `You are an internationally experienced music producer and elite lyricist. Today I want to write a fully customized song as a gift for ${recipients}.

${SONG_LYRICS_SAFETY_AND_FORMATTING_GUIDELINES}

Please create lyrics strictly according to these customization requirements:

[Core Custom Parameters]
1. Lyrics language: ${input.language}
2. Music style / genre: ${input.genre}
3. Occasion / specific holiday: ${occasionLabel(input.occasion)}
4. Vocal direction: ${input.vocalGender}

[Personal Story And Emotional Details]
1. Dedicated memories, inside jokes, unforgettable scenes, and personal details:
${input.story.trim()}
2. Core blessing / heartfelt message to express:
Turn the story above into a sincere, specific, emotionally resonant message for ${recipients}.

${
  revisionInstruction
    ? `[Additional New Version Direction]
The user wants this newly generated version to follow this extra direction:
${revisionInstruction}
`
    : ""
}

[Lyric Formatting And Generation Rules]
- Must include English structure tags that Suno can recognize. Use only English tags, for example: [Verse 1], [Verse 2], [Chorus], [Bridge], [Outro].
- The lyrics must fit the selected occasion and its emotional atmosphere. Avoid plain narration. Use metaphors and imagery that match the selected genre.
- Pay close attention to rhyme scheme, rhythm alignment, and singability in the target language.
- Keep the lyrics concise enough for a complete song.

[Gift Cover Art Direction]
Recommend one painting or visual-art direction that turns the user's story into a personal, premium gift. Select exactly one style identifier from this curated list:
- heirloom-storybook: warm illustrated-book craftsmanship with a timeless keepsake feeling
- hand-painted-gouache: intimate painted texture, soft edges, and handmade warmth
- cinematic-keepsake: emotionally composed cinematic realism with a treasured-memory feeling
- editorial-collage: sophisticated paper, photograph, and tactile editorial layering
- pressed-botanical: delicate preserved flowers and natural materials arranged like a personal memento
- paper-cut-craft: layered handcrafted paper shapes with depth and celebratory charm
- dreamy-watercolor: luminous washes, gentle transitions, and poetic emotional imagery
- vintage-photo-album: refined analog-photo character with subtle archival texture

Derive the subject, mood, palette, lighting, composition, and gift feeling from the user's real story. Do not mention a living artist, brand, copyrighted character, existing artwork, album title, lettering, or typography. Reserve subtle visual breathing room in the lower-right area for a short personal dedication that will be added later.

[Required Output]
Return only one valid JSON object with exactly this structure. Do not use markdown fences or add commentary:
{
  "title": "concise original song title",
  "lyrics": "complete lyrics using \\n for line breaks and English section tags such as [Verse 1]",
  "coverArt": {
    "style": "one curated style identifier",
    "styleDescription": "specific English description of the selected visual medium and texture",
    "subject": "specific symbolic scene derived only from the user's story",
    "mood": "emotional atmosphere",
    "palette": "cohesive color palette",
    "lighting": "lighting direction",
    "composition": "square album-cover composition with dedication space",
    "giftFeeling": "how the artwork should feel personal, handmade, premium, and gift-ready"
  }
}`;
}

export function inferTitleFromLyrics(
  lyrics: string,
  fallback = "Your Custom Song",
): string {
  const lines = lyrics
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const titleLine = lines.find((line) => /^title\s*:/i.test(line));
  if (titleLine) {
    return (
      titleLine
        .replace(/^title\s*:/i, "")
        .trim()
        .replace(/^["']|["']$/g, "") || fallback
    );
  }

  const firstLyric = lines.find(
    (line) => !/^\[.*\]$/.test(line) && !/^(verse|chorus|bridge)/i.test(line),
  );
  return firstLyric ? firstLyric.slice(0, 80) : fallback;
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const [subscription] = await db
    .select({
      status: subscriptionsSchema.status,
      currentPeriodEnd: subscriptionsSchema.currentPeriodEnd,
    })
    .from(subscriptionsSchema)
    .where(eq(subscriptionsSchema.userId, userId))
    .orderBy(desc(subscriptionsSchema.createdAt))
    .limit(1);

  if (!subscription) return false;
  if (!["active", "trialing"].includes(subscription.status)) return false;
  if (
    subscription.currentPeriodEnd &&
    new Date(subscription.currentPeriodEnd).getTime() < Date.now()
  ) {
    return false;
  }

  return true;
}

export async function createLyricsGeneration(
  input: SongInputContext,
): Promise<SongLyricsTask> {
  assertSongTaskStoreConfigured();
  const now = Date.now();
  const result = await generateSongLyrics(input);
  const task: SongLyricsTask = {
    taskId: crypto.randomUUID(),
    externalId: "",
    status: "succeeded",
    title: result.title,
    lyrics: result.lyrics,
    coverArt: result.coverArt,
    createdAt: now,
    updatedAt: now,
    expiresAt: createExpiresAt(now),
  };

  await songTaskStore.setLyrics(task);
  return task;
}

export async function refreshLyricsGeneration(
  taskId: string,
): Promise<SongLyricsTask | null> {
  return songTaskStore.getLyrics(taskId);
}

export async function generateSongStory(
  input: SongStoryInput,
): Promise<{ story: string }> {
  const model = getReplicateGpt5LyricsModel();
  const prompt = buildStoryPrompt(input);

  console.log("[Replicate GPT-5 Story] Request", {
    model,
    promptLength: prompt.length,
    answerCount: input.answers.length,
  });

  const story = await generateTextWithReplicateGpt5({
    model,
    prompt,
    maxCompletionTokens: 700,
    reasoningEffort: "minimal",
    verbosity: "medium",
    systemPrompt:
      "You are a careful, faithful personal-story editor. Preserve user facts exactly and return only the finished story brief.",
  });

  return { story };
}

export async function generateSongLyrics(input: SongInputContext): Promise<{
  title: string;
  lyrics: string;
  coverArt: SongCoverArtDirection;
}> {
  const model = getReplicateGpt5LyricsModel();
  const prompt = buildLyricsPrompt(input);

  console.log("[Replicate GPT-5 Lyrics] Request", {
    model,
    prompt,
    promptLength: prompt.length,
  });

  const output = await generateTextWithReplicateGpt5({
    model,
    prompt,
    maxCompletionTokens: 2800,
    systemPrompt:
      "You are a careful, original lyricist and gift art director. Return only the required valid JSON object and follow all safety instructions exactly.",
    verbosity: "medium",
  });

  return parseSongLyricsGeneration(output);
}

export async function rewriteSongLyricsLines(
  input: SongLyricsRewriteInput,
): Promise<{ lines: string[] }> {
  const selectedLines = input.selectedLines
    .map((line) => line.trim())
    .filter(Boolean);

  if (!selectedLines.length) {
    throw new Error("Select at least one lyric line to rewrite.");
  }

  const model = getReplicateGpt5LyricsModel();
  const prompt = buildLyricsLineRewritePrompt({
    ...input,
    selectedLines,
  });

  console.log("[Replicate GPT-5 Lyrics Rewrite] Request", {
    model,
    selectedLineCount: selectedLines.length,
    promptLength: prompt.length,
  });

  const rewrittenText = await generateTextWithReplicateGpt5({
    model,
    prompt,
    maxCompletionTokens: 800,
    systemPrompt:
      "You are a careful, original lyric editor. Return only the requested lyric lines.",
    verbosity: "low",
  });
  const rewrittenLines = normalizeRewrittenLyricLines(rewrittenText);

  if (rewrittenLines.length < selectedLines.length) {
    throw new Error("The rewrite did not include enough lyric lines.");
  }

  return {
    lines: rewrittenLines.slice(0, selectedLines.length),
  };
}

export async function createSongGeneration(
  input: SongGenerationInput,
): Promise<SongGenerationTask> {
  assertSongTaskStoreConfigured();
  const user = input.sessionUser;
  const isSubscriber =
    user && !user.isAnonymous ? await hasActiveSubscription(user.id) : false;
  console.log("[songs/generate] Subscription check", {
    userId: user?.id,
    email: user?.email,
    isAnonymous: user?.isAnonymous,
    isSubscriber: Boolean(isSubscriber),
  });
  const now = Date.now();
  const externalId = await submitMusicTask(input);
  const mockMode = externalId === getMockKieSunoTaskId();
  const mockDelayMs = mockMode ? getMockKieSunoDelayMs() : 0;
  const task: SongGenerationTask = {
    songId: crypto.randomUUID(),
    externalId,
    status: "processing",
    userId: user?.id,
    isSubscriber: Boolean(isSubscriber),
    title: input.title,
    // Keep the spoken text in display lyrics while sending only song lyrics to Suno.
    lyrics: input.spokenIntro
      ? addSpokenIntroToLyrics(input.lyrics, input.spokenIntro.transcript)
      : input.lyrics,
    genre: input.genre,
    occasion: input.occasion,
    recipientNames: input.recipientNames,
    story: input.story,
    vocalGender: input.vocalGender,
    language: input.language,
    spokenIntro: input.spokenIntro,
    mockMode,
    mockReadyAt: mockMode ? now + mockDelayMs : undefined,
    versions: [],
    createdAt: now,
    updatedAt: now,
    expiresAt: createExpiresAt(now),
  };

  console.log("[songs/generate] Creating song generation task", {
    songId: task.songId,
    externalId: task.externalId,
    userId: task.userId,
    isSubscriber: task.isSubscriber,
    title: task.title,
  });

  await songTaskStore.setSong(task);
  const mockResult = getMockKieSunoMusicResult(externalId);
  if (mockResult) {
    console.log("[songs/generate] Completing offline mock song task", {
      songId: task.songId,
      externalId,
      status: mockResult.status,
      versions: mockResult.versions.length,
      delayMs: mockDelayMs,
    });
    if (mockDelayMs > 0) return task;
    return (
      (await completeSongTaskFromKieResult({ result: mockResult, task })) ||
      task
    );
  }

  return task;
}

export async function refreshSongGeneration(
  songId: string,
): Promise<SongGenerationTask | null> {
  const task = await songTaskStore.getSong(songId);
  if (!task) return task;
  if (needsSongPreview(task)) {
    return startSongPreviewComposition({
      dependencies: {},
      task,
      versions: task.versions,
    });
  }
  if (task.status !== "processing") return task;
  if (task.songPreviewRenders?.length) {
    return refreshSongPreviewComposition({ task });
  }
  if (task.spokenIntroRenders?.length) {
    return refreshSpokenIntroComposition({ task });
  }
  if (!task.mockMode) return task;
  if (task.mockReadyAt && Date.now() < task.mockReadyAt) return task;

  const mockResult = getMockKieSunoMusicResult(task.externalId);
  if (!mockResult) {
    return songTaskStore.updateSong(task.songId, {
      status: "failed",
      error: "KIE Suno mock configuration changed before completion.",
    });
  }

  return completeSongTaskFromKieResult({ result: mockResult, task });
}
