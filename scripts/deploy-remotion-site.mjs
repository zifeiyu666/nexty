#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "fs";
import { relative, resolve } from "path";
import { spawnSync } from "child_process";

const DEFAULT_REGION = "us-east-1";
const DEFAULT_STATE_FILE = ".remotion-deploy-state.json";
const REMOTION_ENTRY = "remotion-src/index.ts";
const WATCH_INTERVAL_MS = 4000;
const TRACKED_PATHS = [
  "remotion-src",
  "lib/music-video",
  "lib/wall-art/fonts.ts",
  "public/fonts",
  "package.json",
  "pnpm-lock.yaml",
];

function parseArgs(argv) {
  const options = {
    envFile: null,
    force: false,
    region: null,
    siteName: null,
    syncGithub: false,
    watch: false,
  };

  for (const arg of argv) {
    if (arg === "--force") {
      options.force = true;
      continue;
    }
    if (arg === "--sync-github") {
      options.syncGithub = true;
      continue;
    }
    if (arg === "--watch") {
      options.watch = true;
      continue;
    }
    if (arg.startsWith("--env-file=")) {
      options.envFile = arg.slice("--env-file=".length);
      continue;
    }
    if (arg.startsWith("--region=")) {
      options.region = arg.slice("--region=".length);
      continue;
    }
    if (arg.startsWith("--site-name=")) {
      options.siteName = arg.slice("--site-name=".length);
    }
  }

  return options;
}

function pickEnvFile(cwd, preferred) {
  if (preferred) return resolve(cwd, preferred);

  const candidates = [".env.local", ".env"];
  for (const candidate of candidates) {
    const fullPath = resolve(cwd, candidate);
    if (existsSync(fullPath)) return fullPath;
  }

  return resolve(cwd, ".env.local");
}

function pickEnvFiles(cwd, preferred) {
  if (preferred) return [resolve(cwd, preferred)];

  return [resolve(cwd, ".env"), resolve(cwd, ".env.local")];
}

function readEnvFile(filePath) {
  if (!existsSync(filePath)) return "";
  return readFileSync(filePath, "utf8");
}

function parseEnvValue(content, key) {
  const line = content
    .split(/\r?\n/)
    .find((entry) => entry.trim().startsWith(`${key}=`));

  if (!line) return null;

  const rawValue = line.slice(line.indexOf("=") + 1).trim();
  if (!rawValue) return "";
  if (
    (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
    (rawValue.startsWith("'") && rawValue.endsWith("'"))
  ) {
    return rawValue.slice(1, -1).trim();
  }
  return rawValue.trim();
}

function updateEnvValue(content, key, value) {
  const normalizedLine = `${key}="${value}"`;
  const pattern = new RegExp(`^${key}=.*$`, "m");

  if (pattern.test(content)) {
    return content.replace(pattern, normalizedLine);
  }

  const suffix = content.length > 0 && !content.endsWith("\n") ? "\n" : "";
  return `${content}${suffix}${normalizedLine}\n`;
}

function collectFiles(targetPath) {
  if (!existsSync(targetPath)) return [];

  const stats = statSync(targetPath);
  if (stats.isFile()) return [targetPath];

  const files = [];
  for (const entry of readdirSync(targetPath, { withFileTypes: true })) {
    if (entry.name === ".DS_Store") continue;
    const fullPath = resolve(targetPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function computeInputHash(cwd) {
  const hash = createHash("sha256");
  const files = TRACKED_PATHS.flatMap((entry) => collectFiles(resolve(cwd, entry)))
    .sort((left, right) => left.localeCompare(right));

  for (const file of files) {
    hash.update(relative(cwd, file));
    hash.update("\n");
    hash.update(readFileSync(file));
    hash.update("\n");
  }

  return {
    fileCount: files.length,
    hash: hash.digest("hex"),
  };
}

function readStateFile(filePath) {
  if (!existsSync(filePath)) return null;

  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function writeStateFile(filePath, state) {
  writeFileSync(filePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function parseSiteNameFromUrl(serveUrl) {
  if (!serveUrl) return null;
  const match = serveUrl.match(/\/sites\/([^/]+)\/index\.html$/);
  return match?.[1] ?? null;
}

function parseServeUrl(output) {
  const matches = output.match(/https:\/\/[^\s"'`]+\/index\.html/g);
  if (!matches?.length) return null;
  return matches[matches.length - 1];
}

function runCommand(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: "pipe",
  });

  return {
    code: result.status ?? 1,
    output: `${result.stdout ?? ""}${result.stderr ?? ""}`,
  };
}

function deployOnce({ cwd, envFiles, force, region, siteName, syncGithub }) {
  const primaryEnvFile = envFiles[0];
  const primaryEnvContent = readEnvFile(primaryEnvFile);
  const currentServeUrl =
    parseEnvValue(primaryEnvContent, "REMOTION_SERVE_URL") ||
    envFiles
      .map((filePath) => parseEnvValue(readEnvFile(filePath), "REMOTION_SERVE_URL"))
      .find(Boolean) ||
    null;
  const inferredSiteName = siteName || parseSiteNameFromUrl(currentServeUrl);
  const stateFile = resolve(cwd, DEFAULT_STATE_FILE);
  const currentState = readStateFile(stateFile);
  const hashState = computeInputHash(cwd);

  if (!force && currentState?.hash === hashState.hash) {
    console.log(
      `[remotion] No relevant changes detected across ${hashState.fileCount} tracked files. Skipping deploy.`,
    );
    return { changed: false, deployed: false, serveUrl: currentServeUrl };
  }

  const args = [
    "remotion",
    "lambda",
    "sites",
    "create",
    REMOTION_ENTRY,
    `--region=${region}`,
  ];

  if (inferredSiteName) {
    args.push(`--site-name=${inferredSiteName}`);
  }

  console.log(
    `[remotion] Deploying site from ${REMOTION_ENTRY} in ${region}${inferredSiteName ? ` using site name ${inferredSiteName}` : ""}...`,
  );

  const result = runCommand("pnpm", ["exec", ...args], cwd);
  if (result.code !== 0 && /could not determine executable to run/i.test(result.output)) {
    throw new Error(
      "Remotion CLI is not installed as a direct dependency. Run `pnpm install` after adding `@remotion/cli`.",
    );
  }
  if (result.code !== 0) {
    process.stderr.write(result.output);
    throw new Error("Remotion site deployment failed.");
  }

  process.stdout.write(result.output);

  const nextServeUrl = parseServeUrl(result.output) || currentServeUrl;
  if (!nextServeUrl) {
    throw new Error("Deployment succeeded but no serve URL could be parsed from the output.");
  }

  for (const envFile of envFiles) {
    const envContent = readEnvFile(envFile);
    const nextEnvContent = updateEnvValue(
      envContent,
      "REMOTION_SERVE_URL",
      nextServeUrl,
    );
    writeFileSync(envFile, nextEnvContent, "utf8");
  }

  writeStateFile(stateFile, {
    deployedAt: new Date().toISOString(),
    envFiles: envFiles.map((envFile) => relative(cwd, envFile)),
    fileCount: hashState.fileCount,
    hash: hashState.hash,
    region,
    serveUrl: nextServeUrl,
    siteName: parseSiteNameFromUrl(nextServeUrl),
  });

  console.log(
    `[remotion] Updated REMOTION_SERVE_URL in ${envFiles
      .map((envFile) => relative(cwd, envFile))
      .join(", ")}.`,
  );

  if (syncGithub) {
    console.log("[remotion] Syncing env file to GitHub Actions secrets/variables...");
    const syncResult = runCommand(
      "node",
      ["scripts/sync-env-to-github.mjs", relative(cwd, primaryEnvFile)],
      cwd,
    );
    process.stdout.write(syncResult.output);
    if (syncResult.code !== 0) {
      throw new Error("Remotion deploy succeeded, but GitHub env sync failed.");
    }
  }

  return {
    changed: currentState?.hash !== hashState.hash,
    deployed: true,
    serveUrl: nextServeUrl,
  };
}

async function watchAndDeploy(options) {
  const cwd = process.cwd();
  const envFiles = pickEnvFiles(cwd, options.envFile);
  const region = options.region || DEFAULT_REGION;
  let lastHash = null;
  let deploying = false;

  console.log(
    `[remotion] Watching tracked paths for changes every ${WATCH_INTERVAL_MS / 1000}s...`,
  );

  const tick = () => {
    if (deploying) return;

    const { hash } = computeInputHash(cwd);
    if (lastHash === null) {
      lastHash = hash;
    }
    if (hash === lastHash) return;

    lastHash = hash;
    deploying = true;

    try {
      deployOnce({
        cwd,
        envFiles,
        force: true,
        region,
        siteName: options.siteName,
        syncGithub: options.syncGithub,
      });
    } catch (error) {
      console.error(
        `[remotion] Auto-deploy failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      deploying = false;
    }
  };

  try {
    deployOnce({
      cwd,
      envFiles,
      force: options.force,
      region,
      siteName: options.siteName,
      syncGithub: options.syncGithub,
    });
    lastHash = computeInputHash(cwd).hash;
  } catch (error) {
    console.error(
      `[remotion] Initial deploy failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  setInterval(tick, WATCH_INTERVAL_MS);
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const cwd = process.cwd();
  const envFiles = pickEnvFiles(cwd, options.envFile);
  const region = options.region || DEFAULT_REGION;

  if (options.watch) {
    watchAndDeploy(options);
    return;
  }

  deployOnce({
    cwd,
    envFiles,
    force: options.force,
    region,
    siteName: options.siteName,
    syncGithub: options.syncGithub,
  });
}

main();
