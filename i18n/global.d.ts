import type { EnglishMessages } from './messages';

declare module 'next-intl' {
  interface AppConfig {
    Messages: EnglishMessages;
  }
}
