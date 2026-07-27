import { DEFAULT_LOCALE } from "@/i18n/routing";

export function getLocaleFallbackChain(locale: string): string[] {
  return locale === DEFAULT_LOCALE
    ? [DEFAULT_LOCALE]
    : [locale, DEFAULT_LOCALE];
}
