const DEFAULT_SITE_URL = "https://onecustomsong.com";

const OWN_SITE_HOSTS = ["onecustomsong.com"];
const COMPETITOR_DOMAINS = [
  "songfinch.com",
  "songlorious.com",
  "bringmysongtolife.com",
];

const ABSOLUTE_PROTOCOL_RE = /^[a-z][a-z\d+.-]*:/i;

export const INTERNAL_MARKDOWN_LINK_CLASS =
  "text-primary underline cursor-pointer hover:text-primary/80";

export const EXTERNAL_MARKDOWN_LINK_CLASS =
  "text-current underline cursor-pointer underline-offset-4 decoration-current hover:opacity-80";

function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, "");
}

function isSubdomainOrHost(hostname: string, domain: string): boolean {
  const normalizedHostname = normalizeHostname(hostname);
  const normalizedDomain = normalizeHostname(domain);

  return (
    normalizedHostname === normalizedDomain ||
    normalizedHostname.endsWith(`.${normalizedDomain}`)
  );
}

function parseHttpUrl(href: string, siteUrl = DEFAULT_SITE_URL): URL | null {
  try {
    const url = new URL(href, siteUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

function getOwnSiteHosts(siteUrl?: string): Set<string> {
  const hosts = new Set(OWN_SITE_HOSTS.map(normalizeHostname));
  const configuredUrl = siteUrl || process.env.NEXT_PUBLIC_SITE_URL;

  if (configuredUrl) {
    const parsedUrl = parseHttpUrl(
      configuredUrl.startsWith("http")
        ? configuredUrl
        : `https://${configuredUrl}`,
    );

    if (parsedUrl) {
      hosts.add(normalizeHostname(parsedUrl.hostname));
    }
  }

  return hosts;
}

function isUnsafeProtocolHref(href: string): boolean {
  if (!ABSOLUTE_PROTOCOL_RE.test(href)) {
    return false;
  }

  try {
    const url = new URL(href);
    return url.protocol !== "http:" && url.protocol !== "https:";
  } catch {
    return true;
  }
}

function isInternalHref(href: string, siteUrl?: string): boolean {
  if (href.startsWith("/") && !href.startsWith("//")) {
    return true;
  }

  if (!href.startsWith("//") && !ABSOLUTE_PROTOCOL_RE.test(href)) {
    return true;
  }

  const url = parseHttpUrl(href, siteUrl || DEFAULT_SITE_URL);
  if (!url) {
    return false;
  }

  return getOwnSiteHosts(siteUrl).has(normalizeHostname(url.hostname));
}

export function isCompetitorHref(href: string): boolean {
  const url = parseHttpUrl(href);
  if (!url) {
    return false;
  }

  return COMPETITOR_DOMAINS.some((domain) =>
    isSubdomainOrHost(url.hostname, domain),
  );
}

function relTokens(rel: unknown): string[] {
  if (Array.isArray(rel)) {
    return rel.flatMap(relTokens);
  }

  if (typeof rel !== "string") {
    return [];
  }

  return rel
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function mergeRel(existingRel: unknown, requiredTokens: string[]): string {
  return Array.from(new Set([...relTokens(existingRel), ...requiredTokens])).join(
    " ",
  );
}

export function getMarkdownLinkAttributes(
  href: string,
  existingRel?: unknown,
  siteUrl?: string,
) {
  const normalizedHref = href.trim();

  if (!normalizedHref || normalizedHref.startsWith("#")) {
    return {};
  }

  if (isUnsafeProtocolHref(normalizedHref)) {
    return { href: "#" };
  }

  if (isInternalHref(normalizedHref, siteUrl)) {
    return {
      className: INTERNAL_MARKDOWN_LINK_CLASS,
    };
  }

  const rel = mergeRel(existingRel, [
    "noopener",
    "noreferrer",
    ...(isCompetitorHref(normalizedHref) ? ["nofollow"] : []),
  ]);

  return {
    target: "_blank",
    rel,
    className: EXTERNAL_MARKDOWN_LINK_CLASS,
  };
}
