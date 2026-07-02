import type { KieSongVersion } from "@/lib/ai/adapters/kie-suno";
import {
  fetchExternalUrlToR2 as defaultFetchExternalUrlToR2,
} from "@/lib/cloudflare/r2-fetch-upload";
import type { UploadResult } from "@/lib/cloudflare/r2";

type UploadExternalUrlToR2 = (
  externalUrl: string,
  key: string
) => Promise<UploadResult>;

function extensionFromUrl(url: string, fallback: string): string {
  try {
    const pathname = new URL(url).pathname;
    const extension = pathname.match(/\.([a-z0-9]{2,5})$/i)?.[1];
    return extension ? extension.toLowerCase() : fallback;
  } catch {
    return fallback;
  }
}

function safeKeySegment(value: string): string {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "unknown";
}

export function getKieSongVersionMediaR2Key({
  externalId,
  kind,
  songId,
  url,
  versionId,
}: {
  externalId: string;
  kind: "audio" | "cover";
  songId: string;
  url: string;
  versionId: string;
}): string {
  const fallbackExtension = kind === "audio" ? "mp3" : "jpg";
  const extension = extensionFromUrl(url, fallbackExtension);

  return [
    "songs",
    "generated",
    safeKeySegment(songId),
    safeKeySegment(externalId),
    safeKeySegment(versionId),
    `${kind}.${extension}`,
  ].join("/");
}

export async function persistKieSongVersionMediaToR2({
  externalId,
  songId,
  uploadExternalUrlToR2 = defaultFetchExternalUrlToR2,
  versions,
}: {
  externalId: string;
  songId: string;
  uploadExternalUrlToR2?: UploadExternalUrlToR2;
  versions: KieSongVersion[];
}): Promise<KieSongVersion[]> {
  return Promise.all(versions.map(async (version) => {
    const audioUpload = await uploadExternalUrlToR2(
      version.audioUrl,
      getKieSongVersionMediaR2Key({
        externalId,
        kind: "audio",
        songId,
        url: version.audioUrl,
        versionId: version.id,
      })
    );

    if (!version.imageUrl) {
      return {
        ...version,
        audioUrl: audioUpload.url,
      };
    }

    const coverUpload = await uploadExternalUrlToR2(
      version.imageUrl,
      getKieSongVersionMediaR2Key({
        externalId,
        kind: "cover",
        songId,
        url: version.imageUrl,
        versionId: version.id,
      })
    );

    return {
      ...version,
      audioUrl: audioUpload.url,
      imageUrl: coverUpload.url,
    };
  }));
}
