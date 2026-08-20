// The Remotion Lambda bundle evaluates this module in an environment without the
// app's env vars. Without a fallback, r2PublicUrl() would return relative paths
// that Remotion resolves against the Lambda site bucket (staticFile), breaking
// renders. Mirror the DEFAULT_SITE_URL pattern from config/site.ts.
const DEFAULT_PUBLIC_URL = "https://cdn.sendthesong.io";

const configuredPublicUrl =
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
  process.env.R2_PUBLIC_URL ||
  DEFAULT_PUBLIC_URL;

export const R2_PUBLIC_URL = configuredPublicUrl.replace(/\/+$/, "");

export function r2PublicUrl(path: string) {
  const normalizedPath = path.replace(/^\/+/, "");
  return R2_PUBLIC_URL ? `${R2_PUBLIC_URL}/${normalizedPath}` : `/${normalizedPath}`;
}

export function resolveR2AssetPaths<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => resolveR2AssetPaths(item)) as T;
  }

  if (value && typeof value === "object") {
    const resolved = Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        key === "src" && typeof item === "string" && item.startsWith("/")
          ? r2PublicUrl(item)
          : resolveR2AssetPaths(item),
      ])
    );
    return resolved as T;
  }

  return value;
}
