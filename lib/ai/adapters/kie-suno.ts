const KIE_BASE_URL = "https://api.kie.ai";

export type SongTaskStatus = "processing" | "succeeded" | "failed";

export type KieSongVersion = {
  id: string;
  audioId?: string;
  title: string;
  audioUrl: string;
  imageUrl?: string;
  duration?: number;
  timestampedLyrics?: KieTimestampedLyrics;
  spokenIntro?: {
    audioUrl: string;
    durationSeconds: number;
    songStartOffsetSeconds: number;
    transcript: string;
  };
};

export type KieAlignedWord = {
  word: string;
  startS: number;
  endS: number;
};

export type KieTimestampedLyrics = {
  alignedWords: KieAlignedWord[];
  waveformData?: number[];
  hootCer?: number;
  isStreamed?: boolean;
};

export type LyricsTaskResult = {
  status: SongTaskStatus;
  title?: string;
  lyrics?: string;
  error?: string;
};

export type MusicTaskResult = {
  status: SongTaskStatus;
  versions: KieSongVersion[];
  error?: string;
};

export type TimestampedLyricsResult = {
  status: SongTaskStatus;
  alignedWords: KieAlignedWord[];
  waveformData?: number[];
  hootCer?: number;
  isStreamed?: boolean;
  error?: string;
};

export type SubmitMusicInput = {
  title: string;
  lyrics: string;
  genre: string;
  vocalGender: string;
  language: string;
};

type KieApiResponse = {
  code?: number;
  msg?: string;
  message?: string;
  data?: any;
};

function getApiKey(): string {
  const apiKey = process.env.KIE_API_KEY;
  if (!apiKey) {
    throw new Error("KIE_API_KEY is not configured");
  }
  return apiKey;
}

export function buildKieSunoCallbackUrl(): string {
  const explicitUrl = process.env.KIE_SUNO_CALLBACK_URL?.trim();
  if (explicitUrl) return explicitUrl;

  const baseUrl = process.env.WEBHOOK_BASE_URL?.trim().replace(/\/+$/, "");
  if (!baseUrl) {
    throw new Error(
      "WEBHOOK_BASE_URL is not configured. KIE Suno music generation requires a public callback URL.",
    );
  }

  return `${baseUrl}/api/webhooks/kie/suno`;
}

function logKieRequest(
  endpoint: string,
  payload: Record<string, unknown>,
): void {
  if (process.env.KIE_DEBUG_LOGS === "false") return;

  console.log("[KIE Suno] Request", {
    endpoint,
    payload,
  });
}

const SUNO_LYRIC_METADATA_LINE = /^(?:title)\s*:/i;
const SUNO_INTRO_TAG_LINE =
  /^\[(?:instrumental\s+intro|spoken\s+intro(?:\s*\/\s*narration)?|intro)\]$/i;

export function buildKieSunoMusicPrompt(lyrics: string): string {
  const lines = lyrics
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => !SUNO_LYRIC_METADATA_LINE.test(line.trim()));
  const hasIntroTag = lines.some((line) =>
    SUNO_INTRO_TAG_LINE.test(line.trim()),
  );

  if (hasIntroTag) {
    return lines.join("\n").trim();
  }

  const firstContentIndex = lines.findIndex((line) => line.trim());
  if (firstContentIndex === -1) {
    return "[Instrumental Intro]";
  }

  lines.splice(firstContentIndex, 0, "[Instrumental Intro]", "");
  return lines.join("\n").trim();
}

export function getMockKieSunoTaskId(): string | null {
  const configuredTaskId = process.env.KIE_SUNO_MOCK_TASK_ID?.trim();
  if (configuredTaskId === "false") return null;
  return configuredTaskId || null;
}

export function getMockKieSunoDelayMs(): number {
  const configuredDelay = Number(process.env.KIE_SUNO_MOCK_DELAY_MS?.trim());
  if (!Number.isFinite(configuredDelay) || configuredDelay <= 0) return 0;
  return Math.min(Math.floor(configuredDelay), 10 * 60 * 1000);
}

function escapeControlCharactersInsideJsonStrings(input: string): string {
  let escaped = "";
  let inString = false;
  let escaping = false;

  for (const char of input) {
    if (!inString) {
      if (char === '"') inString = true;
      escaped += char;
      continue;
    }

    if (escaping) {
      escaped += char;
      escaping = false;
      continue;
    }

    if (char === "\\") {
      escaped += char;
      escaping = true;
      continue;
    }

    if (char === '"') {
      escaped += char;
      inString = false;
      continue;
    }

    if (char === "\n") {
      escaped += "\\n";
      continue;
    }

    if (char === "\r") {
      escaped += "\\r";
      continue;
    }

    if (char === "\t") {
      escaped += "\\t";
      continue;
    }

    escaped += char;
  }

  return escaped;
}

function insertMissingCommasBetweenJsonStringProperties(input: string): string {
  return input.replace(
    /("(?:\\.|[^"\\])*")(\s+)(?="(?:\\.|[^"\\])*"\s*:)/g,
    "$1,$2",
  );
}

function parseMockJson(value: string): unknown {
  const escapedControlCharacters =
    escapeControlCharactersInsideJsonStrings(value);
  const candidates = [
    value,
    escapedControlCharacters,
    insertMissingCommasBetweenJsonStringProperties(escapedControlCharacters),
  ];

  let lastError: unknown;
  for (const candidate of [...new Set(candidates)]) {
    try {
      return JSON.parse(candidate);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

function getMockVersionsFromSimpleEnv(): KieSongVersion[] {
  return [
    {
      id: process.env.KIE_SUNO_MOCK_AUDIO_ID_A?.trim() || "mock-a",
      title: process.env.KIE_SUNO_MOCK_TITLE_A?.trim() || "Version A",
      audioUrl: process.env.KIE_SUNO_MOCK_AUDIO_URL_A?.trim() || "",
      imageUrl: process.env.KIE_SUNO_MOCK_IMAGE_URL_A?.trim() || undefined,
      duration: asNumber(process.env.KIE_SUNO_MOCK_DURATION_A),
    },
    {
      id: process.env.KIE_SUNO_MOCK_AUDIO_ID_B?.trim() || "mock-b",
      title: process.env.KIE_SUNO_MOCK_TITLE_B?.trim() || "Version B",
      audioUrl: process.env.KIE_SUNO_MOCK_AUDIO_URL_B?.trim() || "",
      imageUrl: process.env.KIE_SUNO_MOCK_IMAGE_URL_B?.trim() || undefined,
      duration: asNumber(process.env.KIE_SUNO_MOCK_DURATION_B),
    },
  ].filter((version) => /^https?:\/\//i.test(version.audioUrl));
}

export function getMockKieSunoMusicResult(
  taskId: string,
): MusicTaskResult | null {
  const mockTaskId = getMockKieSunoTaskId();
  if (!mockTaskId || taskId !== mockTaskId) {
    return null;
  }

  const simpleVersions = getMockVersionsFromSimpleEnv();
  if (simpleVersions.length) {
    return {
      status: "succeeded",
      versions: simpleVersions.slice(0, 2),
    };
  }

  const rawResult = process.env.KIE_SUNO_MOCK_RESULT_JSON?.trim();
  if (rawResult) {
    try {
      return normalizeKieMusicRecord(
        parseMockJson(rawResult) as KieApiResponse,
      );
    } catch (error) {
      return {
        status: "failed",
        versions: [],
        error:
          error instanceof Error
            ? `Invalid KIE_SUNO_MOCK_RESULT_JSON: ${error.message}`
            : "Invalid KIE_SUNO_MOCK_RESULT_JSON.",
      };
    }
  }

  const rawVersions = process.env.KIE_SUNO_MOCK_VERSIONS_JSON?.trim();
  if (rawVersions) {
    try {
      const versions = parseMockJson(rawVersions);
      if (!Array.isArray(versions)) {
        throw new Error("Expected an array of song versions.");
      }

      const normalizedVersions = versions
        .map((version, index) => normalizeTrack(version, index))
        .filter((version): version is KieSongVersion => Boolean(version))
        .slice(0, 2);

      if (!normalizedVersions.length) {
        throw new Error("No valid versions with http(s) audioUrl were found.");
      }

      return {
        status: "succeeded",
        versions: normalizedVersions,
      };
    } catch (error) {
      return {
        status: "failed",
        versions: [],
        error:
          error instanceof Error
            ? `Invalid KIE_SUNO_MOCK_VERSIONS_JSON: ${error.message}`
            : "Invalid KIE_SUNO_MOCK_VERSIONS_JSON.",
      };
    }
  }

  return {
    status: "failed",
    versions: [],
    error:
      "KIE Suno mock mode is enabled, but no offline mock result is configured. Set KIE_SUNO_MOCK_AUDIO_URL_A/B, KIE_SUNO_MOCK_VERSIONS_JSON, or KIE_SUNO_MOCK_RESULT_JSON.",
  };
}

async function parseKieResponse(response: Response): Promise<KieApiResponse> {
  const text = await response.text();
  let json: KieApiResponse;

  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(
      `KIE API returned non-JSON response: ${text.slice(0, 240)}`,
    );
  }

  if (!response.ok) {
    throw new Error(
      `KIE API error: ${response.status} - ${json.msg || json.message || text}`,
    );
  }

  if (json.code !== undefined && json.code !== 200) {
    throw new Error(`KIE API error: ${json.msg || json.message || json.code}`);
  }

  return json;
}

function maybeParseJson(value: unknown): any {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed || (!trimmed.startsWith("{") && !trimmed.startsWith("["))) {
    return value;
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function valuesDeep(input: unknown, seen = new Set<unknown>()): unknown[] {
  if (!input || typeof input !== "object") return [input];
  if (seen.has(input)) return [];
  seen.add(input);

  if (Array.isArray(input)) {
    return input.flatMap((item) => valuesDeep(maybeParseJson(item), seen));
  }

  return Object.values(input as Record<string, unknown>).flatMap((item) =>
    valuesDeep(maybeParseJson(item), seen),
  );
}

function firstStringAtKeys(input: unknown, keys: string[]): string | undefined {
  const parsed = maybeParseJson(input);
  if (!parsed || typeof parsed !== "object") return undefined;

  if (Array.isArray(parsed)) {
    for (const item of parsed) {
      const found = firstStringAtKeys(item, keys);
      if (found) return found;
    }
    return undefined;
  }

  const record = parsed as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      const parsedValue = maybeParseJson(value);
      if (parsedValue !== value) {
        const nested = firstStringAtKeys(parsedValue, keys);
        if (nested) return nested;
      }
      return value;
    }
  }

  for (const value of Object.values(record)) {
    const found = firstStringAtKeys(value, keys);
    if (found) return found;
  }

  return undefined;
}

function directStringAtKeys(
  input: unknown,
  keys: string[],
): string | undefined {
  const parsed = maybeParseJson(input);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
    return undefined;

  const record = parsed as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return undefined;
}

export function extractLyricsText(record: unknown): string | undefined {
  return firstStringAtKeys(record, [
    "lyrics",
    "lyric",
    "text",
    "content",
    "prompt",
    "result",
  ]);
}

function extractTitle(record: unknown): string | undefined {
  return firstStringAtKeys(record, ["title", "name"]);
}

function normalizeStatus(
  rawStatus: unknown,
  successStatuses: string[],
): SongTaskStatus {
  const status = String(rawStatus || "").toUpperCase();
  if (status === "COMPLETE") return "succeeded";
  if (successStatuses.includes(status)) return "succeeded";
  if (status.includes("FAIL") || status.includes("ERROR")) return "failed";
  return "processing";
}

function getRecordStatus(data: any): string | undefined {
  return (
    data?.status ||
    data?.state ||
    data?.taskStatus ||
    data?.callbackType ||
    data?.response?.status ||
    data?.response?.taskStatus
  );
}

export function normalizeKieLyricsRecord(
  record: KieApiResponse,
): LyricsTaskResult {
  const data = maybeParseJson(record.data);
  const status = normalizeStatus(getRecordStatus(data), [
    "SUCCESS",
    "SUCCEEDED",
  ]);
  const error =
    data?.failMsg ||
    data?.errorMessage ||
    data?.error ||
    record.msg ||
    record.message;
  const lyrics = extractLyricsText(data);

  return {
    status,
    title: extractTitle(data),
    lyrics,
    error: status === "failed" ? error : undefined,
  };
}

function collectCandidateTracks(input: unknown): any[] {
  const parsed = maybeParseJson(input);
  const candidates: any[] = [];

  function visit(value: unknown): void {
    const current = maybeParseJson(value);
    if (!current || typeof current !== "object") return;

    if (Array.isArray(current)) {
      if (
        current.some(
          (item) =>
            item &&
            typeof item === "object" &&
            directStringAtKeys(item, [
              "audioUrl",
              "audio_url",
              "sourceAudioUrl",
              "source_audio_url",
              "streamAudioUrl",
              "stream_audio_url",
              "url",
            ]),
        )
      ) {
        candidates.push(...current);
        return;
      }
      current.forEach(visit);
      return;
    }

    const record = current as Record<string, unknown>;
    if (
      directStringAtKeys(record, [
        "audioUrl",
        "audio_url",
        "sourceAudioUrl",
        "source_audio_url",
        "streamAudioUrl",
        "stream_audio_url",
        "url",
      ])
    ) {
      candidates.push(record);
      return;
    }
    Object.values(record).forEach(visit);
  }

  visit(parsed);
  return candidates;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (
    typeof value === "string" &&
    value.trim() &&
    Number.isFinite(Number(value))
  ) {
    return Number(value);
  }
  return undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return undefined;
}

function normalizeAlignedWords(input: unknown): KieAlignedWord[] {
  const parsed = maybeParseJson(input);
  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((item) => {
      const current = maybeParseJson(item);
      if (!current || typeof current !== "object") return null;
      const record = current as Record<string, unknown>;
      const word = String(record.word ?? record.text ?? "").trim();
      const startS = asNumber(record.startS ?? record.start ?? record.startSec);
      const endS = asNumber(record.endS ?? record.end ?? record.endSec);

      if (!word || startS === undefined || endS === undefined) return null;

      return {
        word,
        startS,
        endS,
      };
    })
    .filter((word): word is KieAlignedWord => Boolean(word));
}

function findAlignedWords(input: unknown): KieAlignedWord[] {
  const parsed = maybeParseJson(input);
  if (!parsed || typeof parsed !== "object") return [];

  if (Array.isArray(parsed)) {
    for (const item of parsed) {
      const found = findAlignedWords(item);
      if (found.length) return found;
    }
    return [];
  }

  const record = parsed as Record<string, unknown>;
  const direct = normalizeAlignedWords(
    record.alignedWords ?? record.aligned_words ?? record.words,
  );
  if (direct.length) return direct;

  for (const value of Object.values(record)) {
    const found = findAlignedWords(value);
    if (found.length) return found;
  }

  return [];
}

function normalizeTrack(track: any, index: number): KieSongVersion | null {
  const audioUrl = firstStringAtKeys(track, [
    "sourceAudioUrl",
    "source_audio_url",
    "audioUrl",
    "audio_url",
    "streamAudioUrl",
    "stream_audio_url",
    "url",
    "songUrl",
    "song_url",
  ]);
  if (!audioUrl || !/^https?:\/\//i.test(audioUrl)) return null;

  const title =
    firstStringAtKeys(track, ["title", "name"]) || `Version ${index + 1}`;
  const id = firstStringAtKeys(track, ["id", "taskId"]) || `${index + 1}`;
  const audioId = firstStringAtKeys(track, [
    "audioId",
    "audio_id",
    "songId",
    "song_id",
    "itemId",
    "item_id",
  ]);
  const imageUrl = firstStringAtKeys(track, [
    "imageUrl",
    "image_url",
    "coverUrl",
    "cover_url",
    "imageLargeUrl",
    "image_url",
  ]);

  return {
    id,
    audioId,
    title,
    audioUrl,
    imageUrl,
    duration: asNumber(track?.duration),
  };
}

export function normalizeKieMusicRecord(
  record: KieApiResponse,
): MusicTaskResult {
  const data = maybeParseJson(record.data);
  const rawStatus = getRecordStatus(data);
  const status = normalizeStatus(rawStatus, ["SUCCESS", "SUCCEEDED"]);
  const error =
    data?.failMsg ||
    data?.errorMessage ||
    data?.error ||
    record.msg ||
    record.message;

  const versions = collectCandidateTracks(data)
    .map((track, index) => normalizeTrack(track, index))
    .filter((track): track is KieSongVersion => Boolean(track))
    .slice(0, 2);

  return {
    status,
    versions,
    error: status === "failed" ? error : undefined,
  };
}

export function normalizeKieTimestampedLyricsRecord(
  record: KieApiResponse,
): TimestampedLyricsResult {
  const data = maybeParseJson(record.data);
  const rawStatus = getRecordStatus(data);
  const alignedWords = findAlignedWords(data);
  const status = alignedWords.length
    ? "succeeded"
    : normalizeStatus(rawStatus, ["SUCCESS", "SUCCEEDED"]);
  const error =
    data?.failMsg ||
    data?.errorMessage ||
    data?.error ||
    record.msg ||
    record.message;
  const waveformData = Array.isArray(data?.waveformData)
    ? data.waveformData
        .map(Number)
        .filter((value: number) => Number.isFinite(value))
    : undefined;

  return {
    status,
    alignedWords,
    waveformData,
    hootCer: asNumber(data?.hootCer),
    isStreamed: asBoolean(data?.isStreamed),
    error: status === "failed" ? error : undefined,
  };
}

export async function submitLyricsTask(
  prompt: string,
  callBackUrl: string,
): Promise<string> {
  const payload = { prompt, callBackUrl };
  logKieRequest("/api/v1/lyrics", {
    ...payload,
    promptLength: prompt.length,
  });

  const response = await fetch(`${KIE_BASE_URL}/api/v1/lyrics`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await parseKieResponse(response);
  const taskId = result.data?.taskId || result.data?.id;
  if (!taskId) {
    throw new Error("KIE lyrics response did not include a taskId");
  }
  return taskId;
}

export async function getLyricsTask(taskId: string): Promise<LyricsTaskResult> {
  const response = await fetch(
    `${KIE_BASE_URL}/api/v1/lyrics/record-info?taskId=${encodeURIComponent(taskId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
      },
    },
  );

  return normalizeKieLyricsRecord(await parseKieResponse(response));
}

export async function submitMusicTask(
  input: SubmitMusicInput,
): Promise<string> {
  const mockTaskId = getMockKieSunoTaskId();
  if (mockTaskId) {
    console.log("[KIE Suno] Mock music generation enabled", {
      taskId: mockTaskId,
      title: input.title,
    });
    return mockTaskId;
  }

  const style = [
    input.genre,
    `${input.vocalGender} vocal`,
    `${input.language} lyrics`,
    "personalized emotional gift song",
  ]
    .filter(Boolean)
    .join(", ");

  const musicPrompt = buildKieSunoMusicPrompt(input.lyrics);
  const payload = {
    callBackUrl: buildKieSunoCallbackUrl(),
    customMode: true,
    instrumental: false,
    prompt: musicPrompt,
    style,
    title: input.title,
    model: process.env.KIE_SUNO_MODEL || "V5_5",
  };
  logKieRequest("/api/v1/generate", {
    ...payload,
    originalPromptLength: input.lyrics.length,
    promptLength: musicPrompt.length,
    styleLength: style.length,
    titleLength: input.title.length,
  });

  const response = await fetch(`${KIE_BASE_URL}/api/v1/generate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await parseKieResponse(response);
  const taskId = result.data?.taskId || result.data?.id;
  if (!taskId) {
    throw new Error("KIE music response did not include a taskId");
  }
  return taskId;
}

export async function submitTimestampedLyricsTask({
  taskId,
  audioId,
}: {
  taskId: string;
  audioId: string;
}): Promise<TimestampedLyricsResult> {
  const payload = { taskId, audioId };
  logKieRequest("/api/v1/generate/get-timestamped-lyrics", payload);

  const response = await fetch(
    `${KIE_BASE_URL}/api/v1/generate/get-timestamped-lyrics`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  return normalizeKieTimestampedLyricsRecord(await parseKieResponse(response));
}

export async function getMusicTask(taskId: string): Promise<MusicTaskResult> {
  const response = await fetch(
    `${KIE_BASE_URL}/api/v1/generate/record-info?taskId=${encodeURIComponent(taskId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
      },
    },
  );

  return normalizeKieMusicRecord(await parseKieResponse(response));
}
