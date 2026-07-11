import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  englishMessageFiles,
  englishMessageNamespaces,
  englishMessages,
} from '../i18n/messages';
import copyBaseline from './i18n-copy-baseline.json';

const PROJECT_ROOT = process.cwd();

/**
 * This check deliberately covers customer-facing and signed-in user surfaces,
 * rather than admin/CMS tooling or reusable UI primitives. It flags only
 * obvious copy regressions: JSX text, literal toast messages, and literal
 * aria-label/placeholder values.
 *
 * URLs and class names are not inspected because they are not user copy.
 * Stable values (IDs, enum values, provider names, and CSS tokens) are
 * ignored by the text filter. Existing copy debt is represented by exact
 * violation signatures in i18n-copy-baseline.json. Adding, changing, or
 * moving a literal changes a file's signature and fails this check.
 */
const SCAN_DIRECTORIES = [
  'app/[locale]/(basic-layout)',
  'app/[locale]/(protected)/dashboard/(user)',
  'components/auth',
  'components/footer',
  'components/header',
  'components/home',
  'components/occasions',
  'components/playlists',
  'components/pricing',
  'components/song',
] as const;

const SCAN_FILES = [
  'components/LanguageDetectionAlert.tsx',
  'components/LocaleSwitcher.tsx',
  'components/music/GlobalMusicController.tsx',
] as const;

const COPY_BASELINE: Readonly<Record<string, string>> = copyBaseline;

type ViolationKind = 'JSX text' | 'toast literal' | 'user-facing attribute';

interface Violation {
  column: number;
  file: string;
  kind: ViolationKind;
  line: number;
  value: string;
}

function isNonEmptyObject(value: object): boolean {
  return Object.keys(value).length > 0;
}

async function validateManifest(): Promise<string[]> {
  const errors: string[] = [];

  if (!isNonEmptyObject(englishMessages)) {
    errors.push('English message manifest is empty.');
  }

  for (const [namespace, messages] of Object.entries(englishMessageNamespaces)) {
    if (!isNonEmptyObject(messages)) {
      errors.push(`English message namespace "${namespace}" is empty.`);
    }
  }

  const registeredFiles = Object.keys(englishMessageFiles).sort();
  const messageFiles = await collectFiles('i18n/messages/en', '.json');
  const missingFromManifest = messageFiles.filter(
    (file) => !registeredFiles.includes(file),
  );
  const missingFromDirectory = registeredFiles.filter(
    (file) => !messageFiles.includes(file),
  );

  for (const file of missingFromManifest) {
    errors.push(`English message file "${file}" is not registered in the manifest.`);
  }

  for (const file of missingFromDirectory) {
    errors.push(`Manifest registers missing English message file "${file}".`);
  }

  return errors;
}

async function collectFiles(directory: string, extension: string): Promise<string[]> {
  const entries = await readdir(resolve(PROJECT_ROOT, directory), {
    withFileTypes: true,
  });
  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = `${directory}/${entry.name}`;

    if (entry.isDirectory()) {
      const nestedFiles = await collectFiles(entryPath, extension);
      return nestedFiles.map((file) => `${entry.name}/${file}`);
    }

    return entry.isFile() && entry.name.endsWith(extension) ? [entry.name] : [];
  }));

  return files.flat();
}

async function collectProjectFiles(directory: string, extension: string): Promise<string[]> {
  const files = await collectFiles(directory, extension);
  return files.map((file) => `${directory}/${file}`);
}

function locationFor(source: string, index: number): Pick<Violation, 'column' | 'line'> {
  const prefix = source.slice(0, index);
  const line = prefix.split('\n').length;
  const lastNewline = prefix.lastIndexOf('\n');

  return {
    line,
    column: index - lastNewline,
  };
}

function isIgnoredText(value: string): boolean {
  return !/[A-Za-z]/.test(value)
    || /^(?:https?:|\/|#)/.test(value)
    || /^[A-Z0-9_-]+$/.test(value)
    || /^[a-z][a-z0-9_-]*(?:\.[a-z0-9_-]+)*$/.test(value);
}

function collectMatches(
  source: string,
  file: string,
  pattern: RegExp,
  kind: ViolationKind,
  valueIndex: number,
): Violation[] {
  const violations: Violation[] = [];

  for (const match of source.matchAll(pattern)) {
    const value = match[valueIndex]?.trim();
    const index = match.index;

    if (!value || index === undefined || isIgnoredText(value)) {
      continue;
    }

    const location = locationFor(source, index);
    violations.push({
      ...location,
      file,
      kind,
      value,
    });
  }

  return violations;
}

interface CopyCheckResult {
  baselineMismatches: Array<{ actual: string; expected?: string; file: string }>;
  staleBaselineFiles: string[];
  violations: Violation[];
}

function copySignature(violations: Violation[]): string {
  const values = violations
    .map((violation) => [
      violation.column,
      violation.kind,
      violation.line,
      violation.value,
    ].join('\u0000'))
    .sort()
    .join('\n');

  return createHash('sha256').update(values).digest('hex');
}

async function findCopyViolations(): Promise<CopyCheckResult> {
  const directoryFiles = await Promise.all(
    SCAN_DIRECTORIES.map((directory) => collectProjectFiles(directory, '.tsx')),
  );
  const files = [...new Set([...directoryFiles.flat(), ...SCAN_FILES])]
    .flat()
    .sort();
  const violations: Violation[] = [];
  const baselineMismatches: CopyCheckResult['baselineMismatches'] = [];
  const activeBaselineFiles = new Set<string>();

  for (const file of files) {
    const source = await readFile(resolve(PROJECT_ROOT, file), 'utf8');
    const fileViolations = [
      ...collectMatches(
        source,
        file,
        /<([A-Za-z][\w.:-]*)\b[^>]*>([^<>{]+)<\/\1>/g,
        'JSX text',
        2,
      ),
      ...collectMatches(
        source,
        file,
        /\btoast(?:\.(?:success|error|info|warning|message))?\(\s*(['"])([^'"\n]+)\1/g,
        'toast literal',
        2,
      ),
      ...collectMatches(
        source,
        file,
        /\b(?:aria-label|placeholder)\s*=\s*(['"])([^'"\n]+)\1/g,
        'user-facing attribute',
        2,
      ),
    ];

    if (fileViolations.length === 0) {
      continue;
    }

    const actual = copySignature(fileViolations);
    const expected = COPY_BASELINE[file];
    activeBaselineFiles.add(file);

    if (actual !== expected) {
      violations.push(...fileViolations);
      baselineMismatches.push({ actual, expected, file });
    }
  }

  return {
    baselineMismatches,
    staleBaselineFiles: Object.keys(COPY_BASELINE)
      .filter((file) => !activeBaselineFiles.has(file))
      .sort(),
    violations,
  };
}

async function main(): Promise<void> {
  const [errors, copyCheck] = await Promise.all([
    validateManifest(),
    findCopyViolations(),
  ]);

  if (
    errors.length === 0
    && copyCheck.violations.length === 0
    && copyCheck.staleBaselineFiles.length === 0
  ) {
    console.log('i18n check passed: English manifest is valid and no new copy literals were found.');
    return;
  }

  for (const error of errors) {
    console.error(`i18n check: ${error}`);
  }

  for (const mismatch of copyCheck.baselineMismatches) {
    console.error(
      `i18n copy baseline mismatch: ${mismatch.file} expected ${mismatch.expected ?? 'none'}, received ${mismatch.actual}`,
    );
  }

  for (const file of copyCheck.staleBaselineFiles) {
    console.error(`i18n copy baseline is stale: ${file}`);
  }

  for (const violation of copyCheck.violations) {
    console.error(
      `${violation.file}:${violation.line}:${violation.column} ${violation.kind}: ${JSON.stringify(violation.value)}`,
    );
  }

  process.exitCode = 1;
}

void main();
