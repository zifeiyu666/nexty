#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from "fs";
import { relative, resolve } from "path";
import { spawnSync } from "child_process";

const DEFAULT_REGION = "us-east-1";
const DEFAULT_MEMORY_MB = 4096;
const DEFAULT_DISK_MB = 2048;
const DEFAULT_TIMEOUT_SECONDS = 240;

function parseArgs(argv) {
  const options = {
    disk: DEFAULT_DISK_MB,
    envFile: null,
    memory: DEFAULT_MEMORY_MB,
    region: DEFAULT_REGION,
    syncGithub: false,
    timeout: DEFAULT_TIMEOUT_SECONDS,
  };

  for (const arg of argv) {
    if (arg === "--sync-github") {
      options.syncGithub = true;
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
    if (arg.startsWith("--memory=")) {
      options.memory = Number.parseInt(arg.slice("--memory=".length), 10);
      continue;
    }
    if (arg.startsWith("--disk=")) {
      options.disk = Number.parseInt(arg.slice("--disk=".length), 10);
      continue;
    }
    if (arg.startsWith("--timeout=")) {
      options.timeout = Number.parseInt(arg.slice("--timeout=".length), 10);
    }
  }

  return options;
}

function pickEnvFiles(cwd, preferred) {
  if (preferred) return [resolve(cwd, preferred)];
  return [resolve(cwd, ".env"), resolve(cwd, ".env.local")];
}

function readEnvFile(filePath) {
  if (!existsSync(filePath)) return "";
  return readFileSync(filePath, "utf8");
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

function parseFunctionName(output) {
  const match = output.match(/remotion-render-[\w-]+-mem\d+mb-disk\d+mb-\d+sec/g);
  if (!match?.length) return null;
  return match[match.length - 1];
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const cwd = process.cwd();
  const envFiles = pickEnvFiles(cwd, options.envFile);

  const args = [
    "exec",
    "remotion",
    "lambda",
    "functions",
    "deploy",
    `--region=${options.region}`,
    `--memory=${options.memory}`,
    `--disk=${options.disk}`,
    `--timeout=${options.timeout}`,
    "--quiet",
  ];

  console.log(
    `[remotion] Deploying Lambda function in ${options.region} with ${options.memory}MB memory, ${options.disk}MB disk, ${options.timeout}s timeout...`,
  );

  const result = runCommand("pnpm", args, cwd);
  if (result.code !== 0) {
    process.stderr.write(result.output);
    throw new Error("Remotion function deployment failed.");
  }

  process.stdout.write(result.output);

  const functionName = parseFunctionName(result.output) ?? result.output.trim();
  if (!functionName) {
    throw new Error("Deployment succeeded but no function name could be parsed from the output.");
  }

  for (const envFile of envFiles) {
    const envContent = readEnvFile(envFile);
    const nextEnvContent = updateEnvValue(
      envContent,
      "REMOTION_FUNCTION_NAME",
      functionName,
    );
    writeFileSync(envFile, nextEnvContent, "utf8");
  }

  console.log(
    `[remotion] Updated REMOTION_FUNCTION_NAME in ${envFiles
      .map((envFile) => relative(cwd, envFile))
      .join(", ")}.`,
  );

  if (options.syncGithub) {
    console.log("[remotion] Syncing env file to GitHub Actions secrets/variables...");
    const syncResult = runCommand(
      "node",
      ["scripts/sync-env-to-github.mjs", relative(cwd, envFiles[0])],
      cwd,
    );
    process.stdout.write(syncResult.output);
    if (syncResult.code !== 0) {
      throw new Error("Function deploy succeeded, but GitHub env sync failed.");
    }
  }
}

main();
