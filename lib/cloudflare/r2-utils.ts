export const generateR2Key = ({
  fileName,
  path = "",
  prefix,
}: {
  fileName: string;
  path?: string;
  prefix?: string;
}): string => {
  const originalFileExtension = fileName.split(".").pop();
  const randomPart = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 8)}${originalFileExtension ? `.${originalFileExtension}` : ""}`;

  const finalFileName = prefix
    ? `${prefix}-${randomPart}`
    : randomPart;
  const cleanedPath = path.replace(/^\/+|\/+$/g, "");
  return cleanedPath ? `${cleanedPath}/${finalFileName}` : finalFileName;
};

export const getFileType = (key: string): "image" | "video" | "other" => {
  const lowerKey = key.toLowerCase();

  const parts = lowerKey.split(".");
  if (parts.length < 2) {
    return "other";
  }

  const extension = parts.pop();
  if (!extension) {
    return "other";
  }

  if (
    extension?.includes("png") ||
    extension?.includes("jpg") ||
    extension?.includes("jpeg") ||
    extension?.includes("webp") ||
    extension?.includes("gif") ||
    extension?.includes("icon") ||
    extension?.includes("svg")
  ) {
    return "image";
  }
  if (
    extension?.includes("mp4") ||
    extension?.includes("webm") ||
    extension?.includes("mov")
  ) {
    return "video";
  }
  return "other";
};