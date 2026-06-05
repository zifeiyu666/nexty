#!/usr/bin/env node

/**
 * Clear .env variables from GitHub Actions Secrets/Variables
 *
 * Usage: node scripts/clear-env-from-github.mjs [.env file path] [repo] [options]
 *
 * Options:
 *   --yes, -y         Skip confirmation prompt
 *   --concurrency=N   Number of parallel operations (default: 5)
 *
 * This script reads your .env file and deletes:
 * - GitHub Variables for NEXT_PUBLIC_* variables
 * - GitHub Secrets for all other variables
 *
 * Prerequisites:
 * - GitHub CLI (gh) installed and authenticated
 * - Run: gh auth login
 */

import { exec, execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { createInterface } from "readline";
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
  bold: "\x1b[1m",
};

const log = {
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}${msg}${colors.reset}`),
  secret: (msg) => console.log(`${colors.blue}🔐 ${msg}${colors.reset}`),
  variable: (msg) => console.log(`${colors.green}📦 ${msg}${colors.reset}`),
  skip: (msg) => console.log(`${colors.yellow}⏭️  ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}   ⚠️  ${msg}${colors.reset}`),
  danger: (msg) =>
    console.log(`${colors.bold}${colors.red}⚠️  ${msg}${colors.reset}`),
};

// Prompt user for confirmation
function confirm(question) {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
    });
  });
}

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

// Delete a secret (async)
async function deleteSecretAsync(key, repo) {
  try {
    await execAsync(`gh secret delete "${key}" --repo "${repo}"`);
    return { success: true, key, type: "secret" };
  } catch {
    return { success: false, key, type: "secret" };
  }
}

// Delete a variable (async)
async function deleteVariableAsync(key, repo) {
  try {
    await execAsync(`gh variable delete "${key}" --repo "${repo}"`);
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
      const [, key] = match;
      entries.push({ key });
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
    skipConfirm: false,
    concurrency: 5,
  };

  for (const arg of args) {
    if (arg === "--yes" || arg === "-y") {
      options.skipConfirm = true;
    } else if (arg.startsWith("--concurrency=")) {
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
      "Could not detect repository. Please specify: node clear-env-from-github.mjs .env owner/repo"
    );
    process.exit(1);
  }

  const entries = parseEnvFile(envPath);

  // Prepare tasks
  const variables = entries.filter((e) => e.key.startsWith("NEXT_PUBLIC_"));
  const secrets = entries.filter((e) => !e.key.startsWith("NEXT_PUBLIC_"));

  log.info(`📂 Reading from: ${options.envFile}`);
  log.info(`🔗 Target repo: ${repo}`);
  console.log("");

  // Show what will be deleted
  log.danger("This will DELETE the following from GitHub Actions:");
  console.log("");
  console.log(`   📦 ${variables.length} Variables:`);
  variables.slice(0, 5).forEach((v) => console.log(`      - ${v.key}`));
  if (variables.length > 5)
    console.log(`      ... and ${variables.length - 5} more`);
  console.log("");
  console.log(`   🔐 ${secrets.length} Secrets:`);
  secrets.slice(0, 5).forEach((s) => console.log(`      - ${s.key}`));
  if (secrets.length > 5)
    console.log(`      ... and ${secrets.length - 5} more`);
  console.log("");

  // Confirm deletion
  if (!options.skipConfirm) {
    const confirmed = await confirm(
      `${colors.yellow}Are you sure you want to delete these? (y/N): ${colors.reset}`
    );
    if (!confirmed) {
      log.info("❌ Cancelled");
      process.exit(0);
    }
    console.log("");
  }

  log.info(`⚡ Concurrency: ${options.concurrency}`);
  log.info(`🗑️  Deleting...`);
  console.log("");

  // Prepare all tasks
  const tasks = [
    ...variables.map((v) => ({ key: v.key, type: "variable" })),
    ...secrets.map((s) => ({ key: s.key, type: "secret" })),
  ];

  // Process all tasks concurrently
  const startTime = Date.now();
  const results = await processBatch(
    tasks,
    options.concurrency,
    async (task) => {
      if (task.type === "variable") {
        log.variable(`Deleting variable: ${task.key}`);
        return deleteVariableAsync(task.key, repo);
      } else {
        log.secret(`Deleting secret: ${task.key}`);
        return deleteSecretAsync(task.key, repo);
      }
    }
  );

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  // Count results
  let varsCount = 0;
  let secretsCount = 0;
  let notFoundCount = 0;

  for (const result of results) {
    if (result.success) {
      if (result.type === "variable") varsCount++;
      else secretsCount++;
    } else {
      log.warn(`${result.key} not found or failed to delete`);
      notFoundCount++;
    }
  }

  console.log("");
  log.success(`Done in ${elapsed}s!`);
  console.log(`   📦 Variables deleted: ${varsCount}`);
  console.log(`   🔐 Secrets deleted: ${secretsCount}`);
  console.log(`   ⏭️  Not found/failed: ${notFoundCount}`);
}

main().catch((err) => {
  log.error(err.message);
  process.exit(1);
});
