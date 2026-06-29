import { staticFile } from "remotion";

const ABSOLUTE_URL_PATTERN = /^[a-z][a-z\d+\-.]*:/i;

export function resolveRemotionMediaSrc(src: string) {
  const trimmedSrc = src.trim();

  if (ABSOLUTE_URL_PATTERN.test(trimmedSrc)) {
    return trimmedSrc;
  }

  return staticFile(trimmedSrc.replace(/^\/+/, ""));
}
