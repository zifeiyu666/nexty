import "dotenv/config";

import { spawn } from "node:child_process";
import { mkdir, open, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";

import { listR2Objects, serverUploadFile } from "../lib/cloudflare/r2";

const VIDEO_EXTENSIONS = new Set([".mp4", ".mov", ".m4v", ".webm"]);
const DEFAULT_SOURCE_DIR = "/Users/gymd/myResource/customsong/lyricVideoBackground";
const DEFAULT_WORK_DIR = "/private/tmp/music-video-background-import";
const VIDEO_PREFIX = "overlay/bg-video";
const POSTER_PREFIX = "overlay/bg-video-poster";
const LONG_EDGE_720P = 1280;
const POSTER_LONG_EDGE = 720;

type Arguments = {
  directory?: string;
  dryRun: boolean;
  file?: string;
  outputDir: string;
  overwrite: boolean;
  resume: boolean;
  scale720p: boolean;
  upload: boolean;
};

type VideoMetadata = {
  durationSeconds: number;
  height: number;
  size: number;
  width: number;
};

type ManifestEntry = {
  durationInFrames: number;
  durationSeconds: number;
  id: string;
  inputPath: string;
  label: string;
  outputHeight?: number;
  outputWidth?: number;
  originalBytes: number;
  posterBytes?: number;
  posterKey: string;
  posterUrl?: string;
  savedBytes?: number;
  savedPercent?: number;
  videoBytes?: number;
  videoKey: string;
  videoUrl?: string;
};

function usage() {
  return [
    "Usage:",
    "  pnpm exec tsx scripts/import-wave-radio-backgrounds.ts --file <video> [--720p] [--upload] [--overwrite] [--resume] [--dry-run]",
    "  pnpm exec tsx scripts/import-wave-radio-backgrounds.ts --dir <folder> [--720p] [--upload] [--overwrite] [--resume] [--dry-run]",
    "",
    "Defaults: --dir " + DEFAULT_SOURCE_DIR + " and --output-dir " + DEFAULT_WORK_DIR,
  ].join("\n");
}

function parseArgs(args: string[]): Arguments {
  const parsed: Arguments = {
    dryRun: false,
    outputDir: DEFAULT_WORK_DIR,
    overwrite: false,
    resume: false,
    scale720p: false,
    upload: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (value === "--file") parsed.file = args[++index];
    else if (value === "--dir") parsed.directory = args[++index];
    else if (value === "--output-dir") parsed.outputDir = args[++index];
    else if (value === "--720p") parsed.scale720p = true;
    else if (value === "--upload") parsed.upload = true;
    else if (value === "--overwrite") parsed.overwrite = true;
    else if (value === "--resume") parsed.resume = true;
    else if (value === "--dry-run") parsed.dryRun = true;
    else if (value === "--help" || value === "-h") {
      console.info(usage());
      process.exit(0);
    } else {
      throw new Error(`Unknown option: ${value}\n\n${usage()}`);
    }
  }

  if (parsed.file && parsed.directory) {
    throw new Error("Use either --file or --dir, not both.");
  }
  if (!parsed.file && !parsed.directory) parsed.directory = DEFAULT_SOURCE_DIR;
  if (parsed.upload && parsed.dryRun) {
    throw new Error("--upload cannot be used with --dry-run.");
  }
  return parsed;
}

function normalizeAssetId(path: string) {
  const stem = basename(path, extname(path))
    .replace(/(?:[_-](?:medium|hd|uhd)(?:[_-]\d{3,5}){2}(?:[_-]\d+fps)?|[_-]\d{3,5}[_-]\d{3,5}[_-]\d+fps|[_-]medium)$/i, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!stem) throw new Error(`Could not derive a stable asset id from ${path}`);
  return stem;
}

async function listVideoFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return listVideoFiles(path);
      return entry.isFile() && VIDEO_EXTENSIONS.has(extname(entry.name).toLowerCase())
        ? [path]
        : [];
    }),
  );
  return nested.flat().sort((left, right) => left.localeCompare(right));
}

function run(command: string, args: string[], inherit = false) {
  return new Promise<string>((resolvePromise, reject) => {
    const child = spawn(command, args, {
      stdio: inherit ? "inherit" : ["ignore", "pipe", "pipe"],
    });
    let output = "";
    let error = "";
    child.stdout?.on("data", (chunk) => { output += String(chunk); });
    child.stderr?.on("data", (chunk) => { error += String(chunk); });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) return resolvePromise(output);
      reject(new Error(`${command} exited with ${code}: ${error || output}`));
    });
  });
}

async function probe(path: string): Promise<VideoMetadata> {
  const output = await run("ffprobe", [
    "-v", "error", "-select_streams", "v:0", "-show_entries",
    "format=duration,size:stream=width,height", "-of", "json", path,
  ]);
  const parsed = JSON.parse(output) as {
    format?: { duration?: string; size?: string };
    streams?: Array<{ height?: number; width?: number }>;
  };
  const stream = parsed.streams?.[0];
  const durationSeconds = Number(parsed.format?.duration);
  const size = Number(parsed.format?.size);
  if (!stream?.width || !stream.height || !Number.isFinite(durationSeconds) || durationSeconds <= 0 || !Number.isFinite(size)) {
    throw new Error(`Could not read valid video metadata from ${path}`);
  }
  return { durationSeconds, height: stream.height, size, width: stream.width };
}

function scaleFilter(maxLongEdge: number) {
  return `scale='if(gte(iw,ih),min(${maxLongEdge},iw),-2)':'if(gte(iw,ih),-2,min(${maxLongEdge},ih))'`;
}

function bytes(value: number | undefined) {
  if (!value) return "-";
  return `${(value / 1024 / 1024).toFixed(2)} MiB`;
}

function videoKey(id: string) { return `${VIDEO_PREFIX}/${id}.mp4`; }
function posterKey(id: string) { return `${POSTER_PREFIX}/${id}.jpg`; }

async function listExistingKeys() {
  const keys = new Set<string>();
  let continuationToken: string | undefined;
  do {
    const result = await listR2Objects({
      continuationToken,
      pageSize: 1000,
      prefix: "overlay/bg-video",
    });
    if (result.error) throw new Error(result.error);
    result.objects.forEach((object) => keys.add(object.key));
    continuationToken = result.nextContinuationToken;
  } while (continuationToken);
  return keys;
}

async function upload(path: string, key: string, contentType: string) {
  const data = await readFile(path);
  return serverUploadFile({
    contentLength: data.byteLength,
    contentType,
    data,
    key,
  });
}

async function assertPublicUrl(url: string, contentType: string) {
  const response = await fetch(url, { method: "HEAD" });
  if (!response.ok) throw new Error(`Upload verification failed (${response.status}): ${url}`);
  if (!(response.headers.get("content-type") ?? "").includes(contentType)) {
    throw new Error(`Unexpected content type for ${url}: ${response.headers.get("content-type")}`);
  }
}

async function verifyOutput(path: string) {
  const output = await run("ffprobe", [
    "-v", "error", "-show_entries",
    "format=duration:stream=codec_name,codec_type,width,height,pix_fmt,avg_frame_rate", "-of", "json", path,
  ]);
  const parsed = JSON.parse(output) as {
    streams?: Array<{ avg_frame_rate?: string; codec_name?: string; codec_type?: string; pix_fmt?: string }>;
  };
  const video = parsed.streams?.find((stream) => stream.codec_type === "video");
  const audio = parsed.streams?.find((stream) => stream.codec_type === "audio");
  // FFmpeg may report a full-range 4:2:0 source as yuvj420p after encoding
  // with -pix_fmt yuv420p. It remains browser/Remotion-compatible H.264 4:2:0.
  const compatiblePixelFormat =
    video?.pix_fmt === "yuv420p" || video?.pix_fmt === "yuvj420p";
  if (!video || audio || video.codec_name !== "h264" || !compatiblePixelFormat || video.avg_frame_rate !== "30/1") {
    throw new Error(`Output verification failed for ${path}`);
  }

  const keyframesOutput = await run("ffprobe", [
    "-v", "error", "-select_streams", "v:0", "-skip_frame", "nokey", "-show_entries",
    "frame=best_effort_timestamp_time", "-of", "json", path,
  ]);
  const keyframes = (JSON.parse(keyframesOutput) as {
    frames?: Array<{ best_effort_timestamp_time?: string }>;
  }).frames
    ?.map((frame) => Number(frame.best_effort_timestamp_time))
    .filter((timestamp) => Number.isFinite(timestamp)) ?? [];
  if (keyframes.length < 1 || keyframes.some((timestamp, index) => index > 0 && timestamp - keyframes[index - 1] > 1.01)) {
    throw new Error(`Keyframe interval verification failed for ${path}`);
  }

  // With +faststart, the MP4 index (moov) must be placed before media data (mdat).
  // Reading the opening atoms is enough; a non-faststart file puts moov at EOF.
  const handle = await open(path, "r");
  try {
    const buffer = Buffer.alloc(4 * 1024 * 1024);
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
    const openingAtoms = buffer.subarray(0, bytesRead);
    const moovIndex = openingAtoms.indexOf(Buffer.from("moov"));
    const mdatIndex = openingAtoms.indexOf(Buffer.from("mdat"));
    if (moovIndex < 0 || (mdatIndex >= 0 && moovIndex > mdatIndex)) {
      throw new Error(`Faststart verification failed for ${path}`);
    }
  } finally {
    await handle.close();
  }
}

async function outputExists(videoPath: string, posterPath: string) {
  try {
    await Promise.all([stat(videoPath), stat(posterPath)]);
    await verifyOutput(videoPath);
    return true;
  } catch {
    return false;
  }
}

function asCsv(entries: ManifestEntry[]) {
  const headers = ["id", "inputPath", "originalBytes", "videoBytes", "posterBytes", "savedBytes", "savedPercent", "durationSeconds", "durationInFrames", "outputWidth", "outputHeight", "videoKey", "posterKey", "videoUrl", "posterUrl"];
  const quote = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  return `${headers.join(",")}\n${entries.map((entry) => headers.map((key) => quote(entry[key as keyof ManifestEntry])).join(",")).join("\n")}\n`;
}

function asRegistryEntries(entries: ManifestEntry[]) {
  return entries.map((entry) => ({
    durationInFrames: entry.durationInFrames,
    id: entry.id,
    label: entry.label,
    posterSrc: `/overlay/bg-video-poster/${entry.id}.jpg`,
    src: `/overlay/bg-video/${entry.id}.mp4`,
  }));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const inputPaths = args.file ? [resolve(args.file)] : await listVideoFiles(resolve(args.directory!));
  if (!inputPaths.length) throw new Error("No supported video files found.");

  const ids = new Map<string, string>();
  for (const inputPath of inputPaths) {
    const id = normalizeAssetId(inputPath);
    const previous = ids.get(id);
    if (previous) throw new Error(`Naming collision: ${previous} and ${inputPath} both normalize to ${id}`);
    ids.set(id, inputPath);
  }

  const preliminary = await Promise.all(inputPaths.map(async (inputPath) => {
    const id = normalizeAssetId(inputPath);
    const metadata = await probe(inputPath);
    return {
      durationInFrames: Math.ceil(metadata.durationSeconds * 30),
      durationSeconds: metadata.durationSeconds,
      id,
      inputPath,
      label: `Background ${id}`,
      originalBytes: metadata.size,
      posterKey: posterKey(id),
      videoKey: videoKey(id),
    } satisfies ManifestEntry;
  }));

  console.table(preliminary.map((entry) => ({
    id: entry.id,
    original: bytes(entry.originalBytes),
    posterKey: entry.posterKey,
    videoKey: entry.videoKey,
  })));
  if (args.dryRun) return;

  const existing = args.upload ? await listExistingKeys() : new Set<string>();
  if (!args.overwrite) {
    const conflicts = preliminary.flatMap((entry) => [entry.videoKey, entry.posterKey].filter((key) => existing.has(key)));
    if (conflicts.length) throw new Error(`R2 keys already exist. Re-run with --overwrite to replace:\n${conflicts.join("\n")}`);
  }

  const outputDir = resolve(args.outputDir);
  const videoDir = join(outputDir, "video");
  const posterDir = join(outputDir, "poster");
  await Promise.all([mkdir(videoDir, { recursive: true }), mkdir(posterDir, { recursive: true })]);
  const manifest: ManifestEntry[] = [];

  for (const entry of preliminary) {
    const outputVideoPath = join(videoDir, `${entry.id}.mp4`);
    const outputPosterPath = join(posterDir, `${entry.id}.jpg`);
    const isResuming = args.resume && await outputExists(outputVideoPath, outputPosterPath);
    if (isResuming) {
      console.info(`[${entry.id}] reuse existing output`);
    } else {
      const videoArgs = [
        "-y", "-i", entry.inputPath, "-map", "0:v:0", "-an", "-sn", "-dn", "-map_metadata", "-1",
        "-c:v", "libx264", "-crf", "22", "-preset", "slow", "-r", "30", "-fps_mode", "cfr",
        "-g", "30", "-keyint_min", "30", "-sc_threshold", "0", "-pix_fmt", "yuv420p",
        "-profile:v", "high", "-level", "4.0",
      ];
      videoArgs.push(
        "-vf",
        args.scale720p
          ? `${scaleFilter(LONG_EDGE_720P)},format=yuv420p`
          : "format=yuv420p",
      );
      videoArgs.push("-movflags", "+faststart", outputVideoPath);

      console.info(`[${entry.id}] encode ${bytes(entry.originalBytes)} → ${outputVideoPath}`);
      await run("ffmpeg", videoArgs);
      await run("ffmpeg", [
        "-y", "-ss", entry.durationSeconds >= 1 ? "1" : "0", "-i", entry.inputPath, "-frames:v", "1", "-vf", scaleFilter(POSTER_LONG_EDGE), "-q:v", "3", "-update", "1", outputPosterPath,
      ]);
    }
    await verifyOutput(outputVideoPath);

    const [videoStat, posterStat, outputMetadata] = await Promise.all([
      stat(outputVideoPath), stat(outputPosterPath), probe(outputVideoPath),
    ]);
    const result: ManifestEntry = {
      ...entry,
      outputHeight: outputMetadata.height,
      outputWidth: outputMetadata.width,
      posterBytes: posterStat.size,
      savedBytes: entry.originalBytes - videoStat.size,
      savedPercent: Number((((entry.originalBytes - videoStat.size) / entry.originalBytes) * 100).toFixed(2)),
      videoBytes: videoStat.size,
    };

    if (args.upload) {
      const [videoUpload, posterUpload] = await Promise.all([
        upload(outputVideoPath, entry.videoKey, "video/mp4"),
        upload(outputPosterPath, entry.posterKey, "image/jpeg"),
      ]);
      await Promise.all([
        assertPublicUrl(videoUpload.url, "video/mp4"),
        assertPublicUrl(posterUpload.url, "image/jpeg"),
      ]);
      result.videoUrl = videoUpload.url;
      result.posterUrl = posterUpload.url;
    }

    manifest.push(result);
    console.info(`[${entry.id}] ${bytes(entry.originalBytes)} → ${bytes(result.videoBytes)} (${result.savedPercent}% saved)`);
  }

  await Promise.all([
    writeFile(join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`),
    writeFile(join(outputDir, "manifest.csv"), asCsv(manifest)),
    writeFile(join(outputDir, "wave-radio-options.json"), `${JSON.stringify(asRegistryEntries(manifest), null, 2)}\n`),
  ]);
  console.info(`Wrote reports to ${outputDir}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
