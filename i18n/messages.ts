import dashboardBlogs from './messages/en/Dashboard/Admin/Blogs.json';
import dashboardGlossary from './messages/en/Dashboard/Admin/Glossary.json';
import orders from './messages/en/Dashboard/Admin/Orders.json';
import overview from './messages/en/Dashboard/Admin/Overview.json';
import prices from './messages/en/Dashboard/Admin/Prices.json';
import r2Files from './messages/en/Dashboard/Admin/R2Files.json';
import users from './messages/en/Dashboard/Admin/Users.json';
import creditHistory from './messages/en/Dashboard/User/CreditHistory.json';
import settings from './messages/en/Dashboard/User/Settings.json';
import common from './messages/en/common.json';
import glossary from './messages/en/Glossary.json';
import landing from './messages/en/Landing.json';
import musicVideos from './messages/en/MusicVideos.json';
import notFound from './messages/en/NotFound.json';
import pricing from './messages/en/Pricing.json';
import samples from './messages/en/Samples.json';
import songs from './messages/en/Songs.json';
import spanishCommon from './messages/es/common.json';
import spanishLanding from './messages/es/Landing.json';
import spanishMusicVideos from './messages/es/MusicVideos.json';
import spanishNotFound from './messages/es/NotFound.json';
import spanishPricing from './messages/es/Pricing.json';
import spanishSamples from './messages/es/Samples.json';
import spanishSongs from './messages/es/Songs.json';
import spanishCreditHistory from './messages/es/Dashboard/User/CreditHistory.json';
import spanishSettings from './messages/es/Dashboard/User/Settings.json';
import spanishGlossary from './messages/es/Glossary.json';
import japaneseCommon from './messages/ja/common.json';
import japaneseLanding from './messages/ja/Landing.json';
import japanesePricing from './messages/ja/Pricing.json';
import japaneseSongs from './messages/ja/Songs.json';
import japaneseSamples from './messages/ja/Samples.json';
import japaneseMusicVideos from './messages/ja/MusicVideos.json';
import japaneseNotFound from './messages/ja/NotFound.json';
import japaneseSettings from './messages/ja/Dashboard/User/Settings.json';
import japaneseCreditHistory from './messages/ja/Dashboard/User/CreditHistory.json';
import japaneseGlossary from './messages/ja/Glossary.json';

/**
 * Every English JSON file must be registered here. The i18n checker compares
 * this explicit inventory with i18n/messages/en to prevent silent omissions.
 */
export const englishMessageFiles = {
  'Dashboard/Admin/Blogs.json': dashboardBlogs,
  'Dashboard/Admin/Glossary.json': dashboardGlossary,
  'Dashboard/Admin/Orders.json': orders,
  'Dashboard/Admin/Overview.json': overview,
  'Dashboard/Admin/Prices.json': prices,
  'Dashboard/Admin/R2Files.json': r2Files,
  'Dashboard/Admin/Users.json': users,
  'Dashboard/User/CreditHistory.json': creditHistory,
  'Dashboard/User/Settings.json': settings,
  'Glossary.json': glossary,
  'Landing.json': landing,
  'MusicVideos.json': musicVideos,
  'NotFound.json': notFound,
  'Pricing.json': pricing,
  'Samples.json': samples,
  'Songs.json': songs,
  'common.json': common,
} as const;

/**
 * The sole runtime message manifest. Keep namespace names stable: existing
 * components already refer to them through next-intl.
 */
export const englishMessageNamespaces = {
  Landing: landing,
  MusicVideos: musicVideos,
  Pricing: pricing,
  NotFound: notFound,
  Glossary: glossary,
  Samples: samples,
  Songs: songs,
  Settings: settings,
  CreditHistory: creditHistory,
  Overview: overview,
  Users: users,
  DashboardBlogs: dashboardBlogs,
  DashboardGlossary: dashboardGlossary,
  Orders: orders,
  R2Files: r2Files,
  Prices: prices,
} as const;

/**
 * English is the complete, type-safe source locale. Shared messages in
 * common.json intentionally remain at the root for existing message keys.
 */
export const englishMessages = {
  ...common,
  ...englishMessageNamespaces,
} as const;

function mergeMessages<T>(base: T, localized: unknown): T {
  if (Array.isArray(base)) {
    return (Array.isArray(localized) ? localized : base) as T;
  }

  if (base && typeof base === 'object') {
    const source = localized && typeof localized === 'object'
      ? localized as Record<string, unknown>
      : {};

    return Object.fromEntries(
      Object.entries(base as Record<string, unknown>).map(([key, value]) => [
        key,
        mergeMessages(value, source[key]),
      ]),
    ) as T;
  }

  return (localized === undefined ? base : localized) as T;
}

export const spanishMessages = mergeMessages(englishMessages, {
  ...spanishCommon,
  Landing: spanishLanding,
  MusicVideos: spanishMusicVideos,
  Pricing: spanishPricing,
  NotFound: spanishNotFound,
  Samples: spanishSamples,
  Songs: spanishSongs,
  Settings: spanishSettings,
  CreditHistory: spanishCreditHistory,
  Glossary: spanishGlossary,
});

export const japaneseMessages = mergeMessages(englishMessages, {
  ...japaneseCommon,
  Landing: japaneseLanding,
  Pricing: japanesePricing,
  Songs: japaneseSongs,
  Samples: japaneseSamples,
  MusicVideos: japaneseMusicVideos,
  NotFound: japaneseNotFound,
  Settings: japaneseSettings,
  CreditHistory: japaneseCreditHistory,
  Glossary: japaneseGlossary,
});

export async function getMessagesForLocale(locale: string) {
  if (locale === 'es') return spanishMessages;
  if (locale === 'ja') return japaneseMessages;
  return englishMessages;
}

export type EnglishMessages = typeof englishMessages;
