import { createReadStream } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";

import { serverUploadFile } from "@/lib/cloudflare/r2";

type UploadedDemoSong = {
  file: string;
  key: string;
  url: string;
};

const DEFAULT_SOURCE_DIR = "/Users/gymd/Downloads/demosongs";
const UPLOAD_PATH = "audio/occasion-demos";
const SELECTED_DEMO_FILES = [
  "Carter Family Christmas.mp3",
  "anniversary-Ten Years, Ava.mp3",
  "apology-James I\u2019m Sorry.mp3",
  "father\u2019s day-Seatbelt and Wrenches.mp3",
  "get well soon-Sky Photos for Lily.mp3",
  "mother\u2019s day-Linda My Mom.mp3",
  "proposal-Final Page Forever.mp3",
  "sweetest day-Cart and Umbrella.mp3",
  "thankyou-Ms Country.mp3",
] as const;

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['\u2019]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uploadDemoSong(file: string): Promise<UploadedDemoSong> {
  const sourceDir = process.argv[2] || DEFAULT_SOURCE_DIR;
  const fullPath = path.join(sourceDir, file);
  const fileStats = await stat(fullPath);
  const baseName = path.basename(file, path.extname(file));
  const key = `${slugify(baseName)}.mp3`;
  const result = await serverUploadFile({
    data: createReadStream(fullPath),
    contentType: "audio/mpeg",
    contentLength: fileStats.size,
    path: UPLOAD_PATH,
    key,
  });

  return {
    file,
    key: result.key,
    url: result.url,
  };
}

async function main(): Promise<void> {
  const sourceDir = process.argv[2] || DEFAULT_SOURCE_DIR;
  const availableFiles = new Set(await readdir(sourceDir));
  const missingFiles = SELECTED_DEMO_FILES.filter(
    (file) => !availableFiles.has(file),
  );

  if (missingFiles.length > 0) {
    throw new Error(`Missing selected demo songs: ${missingFiles.join(", ")}`);
  }

  const files = [...SELECTED_DEMO_FILES];

  const uploaded: UploadedDemoSong[] = [];

  for (const file of files) {
    const result = await uploadDemoSong(file);
    uploaded.push(result);
    console.log(`uploaded ${file} -> ${result.key}`);
  }

  console.log(JSON.stringify(uploaded, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
