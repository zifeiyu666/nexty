import { getLanguageModel } from "@/config/ai-providers";
import { db } from "@/lib/db";
import {
  subscriptions as subscriptionsSchema,
  user as userSchema,
} from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { generateText } from "ai";
import { submitMusicTask } from "./adapters/kie-suno";
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

export type SongInputContext = {
  occasion: string;
  genre: string;
  language: string;
  recipientNames: string[];
  story: string;
  vocalGender: string;
};

export type SongGenerationInput = SongInputContext & {
  title: string;
  lyrics: string;
  email?: string;
  sessionUser?: {
    id: string;
    email: string;
    isAnonymous?: boolean;
  } | null;
};

export type SongLyricsRewriteInput = Pick<
  SongInputContext,
  "occasion" | "genre" | "language" | "recipientNames"
> & {
  fullLyrics: string;
  selectedLines: string[];
  instruction?: string;
};

function occasionLabel(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function buildLyricsPrompt(input: SongInputContext): string {
  const recipients = input.recipientNames.length
    ? input.recipientNames.join(", ")
    : "someone special";

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

[Lyric Formatting And Generation Rules]
- Must include English structure tags that Suno can recognize. Use only English tags, for example: [Verse 1], [Verse 2], [Chorus], [Bridge], [Outro].
- The lyrics must fit the selected occasion and its emotional atmosphere. Avoid plain narration. Use metaphors and imagery that match the selected genre.
- Pay close attention to rhyme scheme, rhythm alignment, and singability in the target language.
- Keep the lyrics concise enough for a complete song, with no explanations before or after the lyrics.
- Start with a single title line formatted exactly as: Title: <song title>
- Then output the lyrics only.`;
}

export function inferTitleFromLyrics(lyrics: string, fallback = "Your Custom Song"): string {
  const lines = lyrics
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const titleLine = lines.find((line) => /^title\s*:/i.test(line));
  if (titleLine) {
    return titleLine.replace(/^title\s*:/i, "").trim().replace(/^["']|["']$/g, "") || fallback;
  }

  const firstLyric = lines.find((line) => !/^\[.*\]$/.test(line) && !/^(verse|chorus|bridge)/i.test(line));
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

export async function findOrCreateSongGuest(email: string): Promise<{
  id: string;
  email: string;
  isAnonymous: boolean;
}> {
  const [existingUser] = await db
    .select({
      id: userSchema.id,
      email: userSchema.email,
      isAnonymous: userSchema.isAnonymous,
    })
    .from(userSchema)
    .where(eq(userSchema.email, email))
    .limit(1);

  if (existingUser) return existingUser;

  const [insertedUser] = await db
    .insert(userSchema)
    .values({
      email,
      emailVerified: false,
      isAnonymous: true,
      name: "Song Preview Guest",
    })
    .onConflictDoNothing({
      target: userSchema.email,
    })
    .returning({
      id: userSchema.id,
      email: userSchema.email,
      isAnonymous: userSchema.isAnonymous,
    });

  if (insertedUser) return insertedUser;

  const [racedUser] = await db
    .select({
      id: userSchema.id,
      email: userSchema.email,
      isAnonymous: userSchema.isAnonymous,
    })
    .from(userSchema)
    .where(eq(userSchema.email, email))
    .limit(1);

  if (!racedUser) {
    throw new Error("Unable to create or find the song guest user.");
  }

  return racedUser;
}

export async function createLyricsGeneration(input: SongInputContext): Promise<SongLyricsTask> {
  assertSongTaskStoreConfigured();
  const now = Date.now();
  const result = await generateSongLyrics(input);
  const task: SongLyricsTask = {
    taskId: crypto.randomUUID(),
    externalId: "",
    status: "succeeded",
    title: result.title,
    lyrics: result.lyrics,
    createdAt: now,
    updatedAt: now,
    expiresAt: createExpiresAt(now),
  };

  await songTaskStore.setLyrics(task);
  return task;
}

export async function refreshLyricsGeneration(taskId: string): Promise<SongLyricsTask | null> {
  return songTaskStore.getLyrics(taskId);
}

export async function generateSongLyrics(input: SongInputContext): Promise<{
  title: string;
  lyrics: string;
}> {
  const model = getLanguageModel(
    "deepseek",
    process.env.DEEPSEEK_LYRICS_MODEL || "deepseek-chat"
  );
  const prompt = buildLyricsPrompt(input);

  console.log("[DeepSeek Lyrics] Request", {
    model: process.env.DEEPSEEK_LYRICS_MODEL || "deepseek-chat",
    prompt,
    promptLength: prompt.length,
  });

  const result = await generateText({
    model,
    prompt,
    temperature: 0.85,
  });

  const lyrics = result.text.trim();
  return {
    title: inferTitleFromLyrics(lyrics),
    lyrics,
  };
}

export async function rewriteSongLyricsLines(
  input: SongLyricsRewriteInput
): Promise<{ lines: string[] }> {
  const selectedLines = input.selectedLines
    .map((line) => line.trim())
    .filter(Boolean);

  if (!selectedLines.length) {
    throw new Error("Select at least one lyric line to rewrite.");
  }

  const modelId = process.env.DEEPSEEK_LYRICS_MODEL || "deepseek-chat";
  const model = getLanguageModel("deepseek", modelId);
  const prompt = buildLyricsLineRewritePrompt({
    ...input,
    selectedLines,
  });

  console.log("[DeepSeek Lyrics Rewrite] Request", {
    model: modelId,
    selectedLineCount: selectedLines.length,
    promptLength: prompt.length,
  });

  const result = await generateText({
    model,
    prompt,
    temperature: 0.75,
  });
  const rewrittenLines = normalizeRewrittenLyricLines(result.text);

  if (rewrittenLines.length < selectedLines.length) {
    throw new Error("The rewrite did not include enough lyric lines.");
  }

  return {
    lines: rewrittenLines.slice(0, selectedLines.length),
  };
}

export async function createSongGeneration(input: SongGenerationInput): Promise<SongGenerationTask> {
  assertSongTaskStoreConfigured();
  const user = input.sessionUser
    ? input.sessionUser
    : input.email
      ? await findOrCreateSongGuest(input.email)
      : null;
  const isSubscriber =
    user && !user.isAnonymous ? await hasActiveSubscription(user.id) : false;
  const now = Date.now();
  const externalId = await submitMusicTask(input);
  const task: SongGenerationTask = {
    songId: crypto.randomUUID(),
    externalId,
    status: "processing",
    userId: user?.id,
    email: user?.email || input.email,
    isSubscriber: Boolean(isSubscriber),
    title: input.title,
    lyrics: input.lyrics,
    genre: input.genre,
    occasion: input.occasion,
    recipientNames: input.recipientNames,
    story: input.story,
    vocalGender: input.vocalGender,
    language: input.language,
    versions: [],
    createdAt: now,
    updatedAt: now,
    expiresAt: createExpiresAt(now),
  };

  console.log("[songs/generate] Creating song generation task", {
    songId: task.songId,
    externalId: task.externalId,
    userId: task.userId,
    email: task.email,
    isSubscriber: task.isSubscriber,
    title: task.title,
  });

  await songTaskStore.setSong(task);
  return task;
}

export async function refreshSongGeneration(songId: string): Promise<SongGenerationTask | null> {
  return songTaskStore.getSong(songId);
}
