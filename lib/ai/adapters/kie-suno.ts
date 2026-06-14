const KIE_BASE_URL = "https://api.kie.ai";

export type SongTaskStatus = "processing" | "succeeded" | "failed";

export type KieSongVersion = {
  id: string;
  title: string;
  audioUrl: string;
  imageUrl?: string;
  duration?: number;
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
      "WEBHOOK_BASE_URL is not configured. KIE Suno music generation requires a public callback URL."
    );
  }

  return `${baseUrl}/api/webhooks/kie/suno`;
}

function logKieRequest(endpoint: string, payload: Record<string, unknown>): void {
  if (process.env.KIE_DEBUG_LOGS === "false") return;

  console.log("[KIE Suno] Request", {
    endpoint,
    payload,
  });
}

async function parseKieResponse(response: Response): Promise<KieApiResponse> {
  const text = await response.text();
  let json: KieApiResponse;

  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`KIE API returned non-JSON response: ${text.slice(0, 240)}`);
  }

  if (!response.ok) {
    throw new Error(`KIE API error: ${response.status} - ${json.msg || json.message || text}`);
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
    valuesDeep(maybeParseJson(item), seen)
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

function directStringAtKeys(input: unknown, keys: string[]): string | undefined {
  const parsed = maybeParseJson(input);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return undefined;

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

function normalizeStatus(rawStatus: unknown, successStatuses: string[]): SongTaskStatus {
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

export function normalizeKieLyricsRecord(record: KieApiResponse): LyricsTaskResult {
  const data = maybeParseJson(record.data);
  const status = normalizeStatus(getRecordStatus(data), ["SUCCESS", "SUCCEEDED"]);
  const error = data?.failMsg || data?.errorMessage || data?.error || record.msg || record.message;
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
            ])
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
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return undefined;
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

  const title = firstStringAtKeys(track, ["title", "name"]) || `Version ${index + 1}`;
  const id = firstStringAtKeys(track, ["id", "taskId"]) || `${index + 1}`;
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
    title,
    audioUrl,
    imageUrl,
    duration: asNumber(track?.duration),
  };
}

export function normalizeKieMusicRecord(record: KieApiResponse): MusicTaskResult {
  const data = maybeParseJson(record.data);
  const rawStatus = getRecordStatus(data);
  const status = normalizeStatus(rawStatus, ["SUCCESS", "SUCCEEDED"]);
  const error = data?.failMsg || data?.errorMessage || data?.error || record.msg || record.message;

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

export async function submitLyricsTask(
  prompt: string,
  callBackUrl: string
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
    }
  );

  return normalizeKieLyricsRecord(await parseKieResponse(response));
}

export async function submitMusicTask(input: SubmitMusicInput): Promise<string> {
  const style = [
    input.genre,
    `${input.vocalGender} vocal`,
    `${input.language} lyrics`,
    "personalized emotional gift song",
  ]
    .filter(Boolean)
    .join(", ");

  const payload = {
    callBackUrl: buildKieSunoCallbackUrl(),
    customMode: true,
    instrumental: false,
    prompt: input.lyrics,
    style,
    title: input.title,
    model: process.env.KIE_SUNO_MODEL || "V5_5",
  };
  logKieRequest("/api/v1/generate", {
    ...payload,
    promptLength: input.lyrics.length,
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

export async function getMusicTask(taskId: string): Promise<MusicTaskResult> {
  const response = await fetch(
    `${KIE_BASE_URL}/api/v1/generate/record-info?taskId=${encodeURIComponent(taskId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
      },
    }
  );

  return normalizeKieMusicRecord(await parseKieResponse(response));
}
