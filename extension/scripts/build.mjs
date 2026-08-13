import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);
const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await exec("npx", ["tsc", "-p", "tsconfig.json"], { cwd: root });
await cp(resolve(root, "popup.html"), resolve(dist, "popup.html"));
await cp(resolve(root, "popup.css"), resolve(dist, "popup.css"));
await cp(resolve(root, "manifest.json"), resolve(dist, "manifest.json"));
await cp(resolve(root, "assets"), resolve(dist, "assets"), { recursive: true });
