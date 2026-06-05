#!/usr/bin/env node

/**
 * Sync .env to GitHub Actions Secrets/Variables
 *
 * Usage: node scripts/sync-env-to-github.mjs [.env file path] [repo] [options]
 *
 * Options:
 *   --concurrency=N   Number of parallel operations (default: 5)
 *
 * This script reads your .env file and creates:
 * - GitHub Variables for NEXT_PUBLIC_* variables
 * - GitHub Secrets for all other variables
 *
 * Prerequisites:
 * - GitHub CLI (gh) installed and authenticated
 * - Run: gh auth login
 */

import { exec, execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

// ANSI colors for terminal output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const log = {
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}${msg}${colors.reset}`),
  secret: (msg) => console.log(`${colors.blue}🔐 ${msg}${colors.reset}`),
  variable: (msg) => console.log(`${colors.green}📦 ${msg}${colors.reset}`),
  skip: (msg) => console.log(`${colors.yellow}⏭️  ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}   ⚠️  ${msg}${colors.reset}`),
};

// Check if gh CLI is installed
function checkGhCli() {
  try {
    execSync("gh --version", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

// Check if authenticated
function checkAuth() {
  try {
    execSync("gh auth status", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

// Get current repo
function getRepo() {
  try {
    const result = execSync(
      "gh repo view --json nameWithOwner -q .nameWithOwner",
      {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      }
    );
    return result.trim();
  } catch {
    return null;
  }
}

// Set a secret (async)
async function setSecretAsync(key, value, repo) {
  return new Promise((resolve) => {
    const child = exec(
      `gh secret set "${key}" --repo "${repo}"`,
      (error) => {
        if (error) {
          resolve({ success: false, key, type: "secret" });
        } else {
          resolve({ success: true, key, type: "secret" });
        }
      }
    );
    child.stdin.write(value);
    child.stdin.end();
  });
}

// Set a variable (async)
async function setVariableAsync(key, value, repo) {
  try {
    const escapedValue = value.replace(/"/g, '\\"');
    await execAsync(
      `gh variable set "${key}" --body "${escapedValue}" --repo "${repo}"`
    );
    return { success: true, key, type: "variable" };
  } catch {
    return { success: false, key, type: "variable" };
  }
}

// Parse .env file
function parseEnvFile(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const entries = [];

  for (const line of content.split("\n")) {
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    // Match KEY=VALUE pattern
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (match) {
      let [, key, value] = match;

      // First, trim the value and handle \r (Windows line endings)
      value = value.trim().replace(/\r$/, "");

      // Check if value starts with quote
      if (value.startsWith('"') || value.startsWith("'")) {
        const quote = value[0];
        // Find the closing quote
        const endQuoteIndex = value.indexOf(quote, 1);
        if (endQuoteIndex !== -1) {
          // Extract value between quotes
          value = value.substring(1, endQuoteIndex);
        }
      } else {
        // Remove inline comments (unquoted values only)
        // Match: value # comment
        const commentIndex = value.indexOf(" #");
        if (commentIndex !== -1) {
          value = value.substring(0, commentIndex);
        }
        value = value.trim();
      }

      entries.push({ key, value });
    }
  }

  return entries;
}

// Process items in batches with concurrency limit
async function processBatch(items, concurrency, processFn) {
  const results = [];
  const executing = new Set();

  for (const item of items) {
    const promise = processFn(item).then((result) => {
      executing.delete(promise);
      return result;
    });
    executing.add(promise);
    results.push(promise);

    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}

// Parse command line arguments
function parseArgs(args) {
  const options = {
    envFile: ".env",
    repo: null,
    concurrency: 5,
  };

  for (const arg of args) {
    if (arg.startsWith("--concurrency=")) {
      options.concurrency = parseInt(arg.split("=")[1], 10) || 5;
    } else if (arg.startsWith("--")) {
      // ignore unknown flags
    } else if (!options.envFile || options.envFile === ".env") {
      if (arg.includes("/") && !arg.includes(".env")) {
        options.repo = arg;
      } else {
        options.envFile = arg;
      }
    } else {
      options.repo = arg;
    }
  }

  return options;
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);
  const envPath = resolve(process.cwd(), options.envFile);

  // Preflight checks
  if (!checkGhCli()) {
    log.error("GitHub CLI (gh) is not installed");
    console.log("   Install it from: https://cli.github.com/");
    process.exit(1);
  }

  if (!checkAuth()) {
    log.error("Not logged in to GitHub CLI");
    console.log("   Run: gh auth login");
    process.exit(1);
  }

  if (!existsSync(envPath)) {
    log.error(`File not found: ${envPath}`);
    process.exit(1);
  }

  const repo = options.repo || getRepo();
  if (!repo) {
    log.error(
      "Could not detect repository. Please specify: node sync-env-to-github.mjs .env owner/repo"
    );
    process.exit(1);
  }

  log.info(`📂 Reading from: ${options.envFile}`);
  log.info(`🔗 Target repo: ${repo}`);
  log.info(`⚡ Concurrency: ${options.concurrency}`);
  console.log("");

  const entries = parseEnvFile(envPath);

  // Filter out empty values and prepare tasks
  const tasks = [];
  let skippedCount = 0;

  for (const { key, value } of entries) {
    if (!value) {
      log.skip(`Skipping ${key} (empty value)`);
      skippedCount++;
      continue;
    }

    if (key.startsWith("NEXT_PUBLIC_")) {
      tasks.push({ key, value, type: "variable" });
    } else {
      tasks.push({ key, value, type: "secret" });
    }
  }

  console.log("");
  log.info(`🚀 Processing ${tasks.length} items...`);
  console.log("");

  // Process all tasks concurrently
  const startTime = Date.now();
  const results = await processBatch(
    tasks,
    options.concurrency,
    async (task) => {
      if (task.type === "variable") {
        log.variable(`Setting variable: ${task.key}`);
        return setVariableAsync(task.key, task.value, repo);
      } else {
        log.secret(`Setting secret: ${task.key}`);
        return setSecretAsync(task.key, task.value, repo);
      }
    }
  );

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  // Count results
  let varsCount = 0;
  let secretsCount = 0;
  let failedCount = 0;

  for (const result of results) {
    if (result.success) {
      if (result.type === "variable") varsCount++;
      else secretsCount++;
    } else {
      log.warn(`Failed to set ${result.type} ${result.key}`);
      failedCount++;
    }
  }

  console.log("");
  log.success(`Done in ${elapsed}s!`);
  console.log(`   📦 Variables created: ${varsCount}`);
  console.log(`   🔐 Secrets created: ${secretsCount}`);
  console.log(`   ⏭️  Skipped: ${skippedCount}`);
  if (failedCount > 0) {
    console.log(`   ❌ Failed: ${failedCount}`);
  }
}

main().catch((err) => {
  log.error(err.message);
  process.exit(1);
});
