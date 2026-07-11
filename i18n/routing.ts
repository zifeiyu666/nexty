import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

export type Locale = 'en' | 'es' | 'ja';

export const LOCALES: readonly Locale[] = ['en', 'es', 'ja']
export const DEFAULT_LOCALE = 'en'
export const LOCALE_NAMES: Record<string, string> = {
  'en': "English",
  'es': "Español",
  'ja': "日本語",
};
export const SHORT_LOCALE_NAMES: Record<string, string> = {
  'en': 'EN',
  'es': 'ES',
  'ja': 'JA',
};
export const LOCALE_TO_HREFLANG: Record<string, string> = {
  'en': 'en-US',
  'es': 'es-ES',
  'ja': 'ja-JP',
};

export const routing = defineRouting({
  locales: LOCALES as readonly string[],
  defaultLocale: DEFAULT_LOCALE,
  localeDetection: process.env.NEXT_PUBLIC_LOCALE_DETECTION && process.env.NEXT_PUBLIC_LOCALE_DETECTION === 'true' || false,

  localePrefix: 'as-needed',
});

export const {
  Link,
  redirect,
  usePathname,
  useRouter,
  getPathname,
} = createNavigation(routing);
