import { siteConfig } from "@/config/site";
import { DEFAULT_LOCALE } from "@/i18n/routing";
import type { PostType } from "@/lib/db/schema";
import { getLogger } from "@/lib/logger";

const logger = getLogger("indexnow");

const DEFAULT_INDEXNOW_ENDPOINT = "https://www.bing.com/indexnow";

type SubmitIndexNowUrlsResult =
  | { submitted: false; reason: string }
  | { submitted: true; status: number; responseText: string };

export function getIndexNowKey() {
  return process.env.INDEXNOW_KEY?.trim() || "";
}

export function isIndexNowConfigured() {
  return getIndexNowKey().length > 0;
}

export function getIndexNowKeyLocation() {
  return `${siteConfig.url.replace(/\/$/, "")}/indexnow-key.txt`;
}

export function buildPublicPostUrl({
  locale,
  postType,
  slug,
}: {
  locale: string;
  postType: PostType;
  slug: string;
}) {
  const normalizedSlug = slug.replace(/^\//, "");
  const localePrefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;

  return `${siteConfig.url.replace(/\/$/, "")}${localePrefix}/${postType}/${normalizedSlug}`;
}

function normalizeSubmitUrls(urls: string[]) {
  const siteUrl = new URL(siteConfig.url);
  const seen = new Set<string>();

  return urls
    .map((url) => url.trim())
    .filter(Boolean)
    .map((url) => new URL(url, siteUrl).toString())
    .filter((url) => {
      const parsedUrl = new URL(url);
      return parsedUrl.hostname === siteUrl.hostname;
    })
    .filter((url) => {
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    });
}

export async function submitIndexNowUrls(
  urls: string[]
): Promise<SubmitIndexNowUrlsResult> {
  const key = getIndexNowKey();
  if (!key) {
    return { submitted: false, reason: "INDEXNOW_KEY is not configured." };
  }

  const siteUrl = new URL(siteConfig.url);
  if (siteUrl.hostname === "localhost" || siteUrl.hostname === "127.0.0.1") {
    return { submitted: false, reason: "IndexNow is disabled for local site URLs." };
  }

  const urlList = normalizeSubmitUrls(urls).slice(0, 10000);
  if (urlList.length === 0) {
    return { submitted: false, reason: "No same-host URLs to submit." };
  }

  const endpoint =
    process.env.INDEXNOW_ENDPOINT?.trim() || DEFAULT_INDEXNOW_ENDPOINT;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      host: siteUrl.host,
      key,
      keyLocation: getIndexNowKeyLocation(),
      urlList,
    }),
  });

  const responseText = await response.text();

  if (!response.ok) {
    logger.warn(
      { status: response.status, responseText, urlCount: urlList.length },
      "IndexNow submission failed"
    );
  } else {
    logger.info(
      { status: response.status, urlCount: urlList.length },
      "IndexNow submission accepted"
    );
  }

  return {
    submitted: true,
    status: response.status,
    responseText,
  };
}

export async function submitPostToIndexNow({
  locale,
  postType,
  slug,
}: {
  locale: string;
  postType: PostType;
  slug: string;
}) {
  return submitIndexNowUrls([
    buildPublicPostUrl({
      locale,
      postType,
      slug,
    }),
  ]);
}
