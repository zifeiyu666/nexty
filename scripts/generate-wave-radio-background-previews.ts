import "dotenv/config";

import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { spawn } from "node:child_process";

import { listR2Objects, serverUploadFile } from "../lib/cloudflare/r2";
import { WAVE_RADIO_BACKGROUND_OPTIONS } from "../lib/music-video/photo-slideshow";

const PREVIEW_THRESHOLD_BYTES = 3 * 1024 * 1024;
const WORK_DIR = "/tmp/music-video-previews";
const RAW_DIR = join(WORK_DIR, "raw");
const PREVIEW_DIR = join(WORK_DIR, "preview");
const POSTER_DIR = join(WORK_DIR, "poster");
const MANIFEST_PATH = join(WORK_DIR, "manifest.json");

type ManifestEntry = {
  compressed: boolean;
  id: string;
  label: string;
  originalBytes: number;
  originalUrl: string;
  posterBytes: number;
  posterKey: string;
  posterUrl: string;
  previewBytes: number;
  previewKey: string | null;
  previewUrl: string | null;
  sourceKey: string;
};

type SourceVideo = {
  id: string;
  label: string;
  size?: number;
  sourceKey: string;
  src: string;
};

function assertOverlayUrl(url: string) {
  const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/+$/, "");
  if (!publicUrl || !url.startsWith(`${publicUrl}/overlay/`)) {
    throw new Error(`Unsupported overlay URL: ${url}`);
  }
}

function getSourceKey(url: string) {
  assertOverlayUrl(url);
  const publicUrl = process.env.R2_PUBLIC_URL!.replace(/\/+$/, "");
  return decodeURIComponent(url.slice(publicUrl.length + 1));
}

function getPreviewKey(sourceKey: string) {
  return sourceKey.replace(/^overlay\/bg-video\//, "overlay/bg-video-preview/");
}

function getPosterKey(sourceKey: string) {
  return sourceKey
    .replace(/^overlay\/bg-video\//, "overlay/bg-video-poster/")
    .replace(/\.[^.]+$/, ".jpg");
}

function getCompressionSettings(originalBytes: number) {
  if (originalBytes > 15 * 1024 * 1024) {
    return { crf: 34, maxrate: "380k", bufsize: "760k" };
  }

  if (originalBytes > 8 * 1024 * 1024) {
    return { crf: 32, maxrate: "500k", bufsize: "1000k" };
  }

  return { crf: 30, maxrate: "650k", bufsize: "1300k" };
}

function getIdFromSourceKey(sourceKey: string) {
  return sourceKey
    .replace(/^overlay\/bg-video\//, "")
    .replace(/\.[^.]+$/, "")
    .replace(/\//g, "-");
}

async function listAllR2Objects(prefix: string) {
  const objects = [];
  let continuationToken: string | undefined;

  do {
    const page = await listR2Objects({
      continuationToken,
      pageSize: 1000,
      prefix,
    });

    if (page.error) throw new Error(page.error);
    objects.push(...page.objects);
    continuationToken = page.nextContinuationToken;
  } while (continuationToken);

  return objects;
}

async function getSourceVideos(): Promise<SourceVideo[]> {
  if (process.argv.includes("--configured-only")) {
    return WAVE_RADIO_BACKGROUND_OPTIONS.map((background) => ({
      id: background.id,
      label: background.label,
      sourceKey: getSourceKey(background.src),
      src: background.src,
    }));
  }

  const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/+$/, "");
  if (!publicUrl) throw new Error("R2_PUBLIC_URL is required.");

  const objects = await listAllR2Objects("overlay/bg-video/");

  return objects
    .filter((object) => /\.mp4$/i.test(object.key))
    .sort((left, right) => left.key.localeCompare(right.key))
    .map((object) => ({
      id: getIdFromSourceKey(object.key),
      label: object.key.replace(/^overlay\/bg-video\//, ""),
      size: object.size,
      sourceKey: object.key,
      src: `${publicUrl}/${object.key}`,
    }));
}

function runCommand(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

async function fetchWithRetry(
  url: string,
  init?: RequestInit,
  attempts = 3,
) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fetch(url, init);
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
      await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
    }
  }

  throw lastError;
}

async function getContentLength(url: string) {
  const response = await fetchWithRetry(url, { method: "HEAD" });
  if (!response.ok) {
    throw new Error(`HEAD ${url} failed with ${response.status}`);
  }

  const contentLength = response.headers.get("content-length");
  const size = contentLength ? Number.parseInt(contentLength, 10) : NaN;
  if (!Number.isFinite(size) || size <= 0) {
    throw new Error(`Missing content-length for ${url}`);
  }

  return size;
}

async function downloadFile(url: string, destination: string) {
  await mkdir(dirname(destination), { recursive: true });
  const response = await fetchWithRetry(url);
  if (!response.ok) {
    throw new Error(`GET ${url} failed with ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(destination, buffer);
}

async function uploadLocalFile({
  contentType,
  key,
  path,
}: {
  contentType: string;
  key: string;
  path: string;
}) {
  const data = await readFile(path);
  return serverUploadFile({
    contentLength: data.byteLength,
    contentType,
    data,
    key,
  });
}

async function assertUploadedUrl(url: string, expectedContentType: string) {
  const response = await fetchWithRetry(url, { method: "HEAD" });
  if (!response.ok) {
    throw new Error(`Uploaded URL check failed ${response.status}: ${url}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes(expectedContentType)) {
    throw new Error(`Unexpected content-type ${contentType} for ${url}`);
  }
}

async function main() {
  await mkdir(RAW_DIR, { recursive: true });
  await mkdir(PREVIEW_DIR, { recursive: true });
  await mkdir(POSTER_DIR, { recursive: true });

  const sourceVideos = await getSourceVideos();
  let manifest: ManifestEntry[] = [];
  try {
    manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
  } catch {
    manifest = [];
  }
  const completedSourceKeys = new Set(
    manifest.map((entry) => entry.sourceKey),
  );
  console.info(`Found ${sourceVideos.length} source videos.`);

  for (const background of sourceVideos) {
    const sourceKey = background.sourceKey;
    if (completedSourceKeys.has(sourceKey)) {
      console.info(`[${background.id}] skip existing manifest entry`);
      continue;
    }

    const originalBytes =
      background.size && background.size > 0
        ? background.size
        : await getContentLength(background.src);
    const compressed = originalBytes > PREVIEW_THRESHOLD_BYTES;
    const rawPath = join(RAW_DIR, sourceKey.replace(/^overlay\/bg-video\//, ""));
    const posterKey = getPosterKey(sourceKey);
    const posterPath = join(
      POSTER_DIR,
      posterKey.replace(/^overlay\/bg-video-poster\//, ""),
    );

    console.info(
      `[${background.id}] ${compressed ? "compress" : "poster only"} ${(
        originalBytes /
        1024 /
        1024
      ).toFixed(2)}MB`,
    );

    await downloadFile(background.src, rawPath);

    await mkdir(dirname(posterPath), { recursive: true });
    await runCommand("ffmpeg", [
      "-y",
      "-ss",
      "1",
      "-i",
      rawPath,
      "-frames:v",
      "1",
      "-update",
      "1",
      "-vf",
      "scale='if(gt(iw,ih),min(720,iw),-2)':'if(gt(ih,iw),min(720,ih),-2)'",
      "-q:v",
      "4",
      posterPath,
    ]);

    const posterUpload = await uploadLocalFile({
      contentType: "image/jpeg",
      key: posterKey,
      path: posterPath,
    });
    await assertUploadedUrl(posterUpload.url, "image/jpeg");

    let previewKey: string | null = null;
    let previewUrl: string | null = null;
    let previewBytes = originalBytes;

    if (compressed) {
      previewKey = getPreviewKey(sourceKey);
      const previewPath = join(
        PREVIEW_DIR,
        previewKey.replace(/^overlay\/bg-video-preview\//, ""),
      );
      const settings = getCompressionSettings(originalBytes);

      await mkdir(dirname(previewPath), { recursive: true });
      await runCommand("ffmpeg", [
        "-y",
        "-i",
        rawPath,
        "-an",
        "-c:v",
        "libx264",
        "-preset",
        "slow",
        "-crf",
        String(settings.crf),
        "-maxrate",
        settings.maxrate,
        "-bufsize",
        settings.bufsize,
        "-vf",
        "scale='if(gt(iw,ih),-2,min(480,iw))':'if(gt(iw,ih),min(480,ih),-2)'",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        previewPath,
      ]);

      const previewStat = await stat(previewPath);
      previewBytes = previewStat.size;
      const previewUpload = await uploadLocalFile({
        contentType: "video/mp4",
        key: previewKey,
        path: previewPath,
      });
      previewUrl = previewUpload.url;
      await assertUploadedUrl(previewUrl, "video/mp4");
    }

    const posterStat = await stat(posterPath);
    manifest.push({
      compressed,
      id: background.id,
      label: background.label,
      originalBytes,
      originalUrl: background.src,
      posterBytes: posterStat.size,
      posterKey: posterUpload.key,
      posterUrl: posterUpload.url,
      previewBytes,
      previewKey,
      previewUrl,
      sourceKey,
    });

    await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  }

  console.info(`Wrote manifest to ${MANIFEST_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
