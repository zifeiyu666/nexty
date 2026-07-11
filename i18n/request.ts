import { getRequestConfig } from 'next-intl/server';
import { getMessagesForLocale } from './messages';
import { DEFAULT_LOCALE, type Locale, routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  const locale: Locale = requestedLocale && routing.locales.includes(requestedLocale as Locale)
    ? requestedLocale as Locale
    : DEFAULT_LOCALE;

  return {
    locale,
    messages: await getMessagesForLocale(locale),
  };
});
