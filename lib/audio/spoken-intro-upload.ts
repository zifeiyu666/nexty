const SUPPORTED_SPOKEN_INTRO_CONTENT_TYPES = new Set([
  "audio/webm",
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/ogg",
]);

export function normalizeSpokenIntroContentType(
  contentType: string,
): string | null {
  const baseContentType = contentType.split(";", 1)[0]?.trim().toLowerCase();

  return baseContentType &&
    SUPPORTED_SPOKEN_INTRO_CONTENT_TYPES.has(baseContentType)
    ? baseContentType
    : null;
}
