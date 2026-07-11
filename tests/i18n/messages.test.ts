import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, test } from 'node:test';
import {
  englishMessageFiles,
  englishMessageNamespaces,
  englishMessages,
  getMessagesForLocale,
  japaneseMessages,
  spanishMessages,
} from '@/i18n/messages';
import { LOCALE_TO_HREFLANG, LOCALES } from '@/i18n/routing';
import japaneseCommonSource from '@/i18n/messages/ja/common.json';
import japaneseLandingSource from '@/i18n/messages/ja/Landing.json';
import japanesePricingSource from '@/i18n/messages/ja/Pricing.json';

async function collectJsonFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    if (entry.isDirectory()) {
      const files = await collectJsonFiles(resolve(directory, entry.name));
      return files.map((file) => `${entry.name}/${file}`);
    }

    return entry.isFile() && entry.name.endsWith('.json') ? [entry.name] : [];
  }));

  return nested.flat();
}

describe('English i18n manifest', () => {
  test('merges common messages at the root with every named namespace', () => {
    assert.equal(englishMessages.Home.title, 'One Custom Song');
    assert.equal(englishMessages.Landing.Hero.getStarted, 'Start a Free Preview');
    assert.equal(englishMessages.Pricing.title, 'Choose the custom song gift that fits your moment');
    assert.equal(englishMessages.CreditHistory.type_welcome_bonus, 'Welcome Bonus');
  });

  test('keeps each explicitly registered namespace nonempty', () => {
    for (const [namespace, messages] of Object.entries(englishMessageNamespaces)) {
      assert.ok(
        Object.keys(messages).length > 0,
        `Expected ${namespace} to contain English messages`,
      );
    }
  });

  test('registers every English JSON source file explicitly', async () => {
    const messageFiles = await collectJsonFiles(
      resolve(process.cwd(), 'i18n/messages/en'),
    );

    assert.deepEqual(
      Object.keys(englishMessageFiles).sort(),
      messageFiles.sort(),
    );
  });
});

function scalarPaths(value: unknown, prefix = ''): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => scalarPaths(item, `${prefix}[${index}]`));
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) =>
      scalarPaths(child, prefix ? `${prefix}.${key}` : key),
    );
  }

  return [prefix];
}

function scalarEntries(value: unknown, prefix = ''): Array<[string, unknown]> {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => scalarEntries(item, `${prefix}[${index}]`));
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) =>
      scalarEntries(child, prefix ? `${prefix}.${key}` : key),
    );
  }

  return [[prefix, value]];
}

function messageTokens(value: unknown): string[] {
  if (typeof value !== 'string') return [];

  return [
    ...(value.match(/\{[a-zA-Z][^{}]*\}/g) || []),
    ...(value.match(/<\/?[a-zA-Z][^>]*>/g) || []).map((tag) =>
      tag.replace(/\s+[^>]*(?=>)/, ''),
    ),
  ].sort();
}

describe('Localized i18n manifests', () => {
  test('registers Spanish routing and SEO language codes', () => {
    assert.deepEqual(LOCALES, ['en', 'es', 'ja']);
    assert.equal(LOCALE_TO_HREFLANG.es, 'es-ES');
  });

  test('loads Japanese with the complete English message shape', async () => {
    assert.equal(LOCALE_TO_HREFLANG.ja, 'ja-JP');
    assert.deepEqual(scalarPaths(japaneseMessages).sort(), scalarPaths(englishMessages).sort());
    assert.equal((await getMessagesForLocale('ja')).Home.title, 'One Custom Song');
  });

  test('keeps Japanese customer-facing source files complete', () => {
    const commonRequired = scalarPaths(englishMessages)
      .filter((path) => !path.startsWith('AIDemo.') && !path.startsWith('Login.AdminMenus'))
      .filter((path) => !/^(Landing|Pricing|NotFound|Glossary|Samples|Songs|MusicVideos|Settings|CreditHistory|Overview|Users|DashboardBlogs|DashboardGlossary|Orders|R2Files|Prices)\./.test(path));
    const commonActual = new Set(scalarPaths(japaneseCommonSource));
    assert.deepEqual(commonRequired.filter((path) => !commonActual.has(path)), []);
    assert.deepEqual(scalarPaths(japaneseLandingSource).sort(), scalarPaths(englishMessages.Landing).sort());
    assert.deepEqual(scalarPaths(japanesePricingSource).sort(), scalarPaths(englishMessages.Pricing).sort());
  });

  test('preserves Japanese ICU placeholders and rich-text tags', () => {
    const englishEntries = new Map(scalarEntries(englishMessages));
    for (const [path, value] of scalarEntries(japaneseMessages)) {
      assert.deepEqual(messageTokens(value), messageTokens(englishEntries.get(path)), `Expected Japanese message tokens to match at ${path}`);
    }
  });

  test('matches the complete English message shape', () => {
    assert.deepEqual(
      scalarPaths(spanishMessages).sort(),
      scalarPaths(englishMessages).sort(),
    );
  });

  test('preserves ICU placeholders and rich-text tags', () => {
    const englishEntries = new Map(scalarEntries(englishMessages));

    for (const [path, value] of scalarEntries(spanishMessages)) {
      assert.deepEqual(
        messageTokens(value),
        messageTokens(englishEntries.get(path)),
        `Expected message tokens to match at ${path}`,
      );
    }
  });

  test('loads known locales and falls back to English', async () => {
    assert.equal((await getMessagesForLocale('es')).Home.title, 'One Custom Song');
    assert.equal((await getMessagesForLocale('en')).Home.title, 'One Custom Song');
    assert.equal((await getMessagesForLocale('invalid')).Home.title, 'One Custom Song');
  });
});
