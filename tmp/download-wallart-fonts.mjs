// One-off script: download Google Fonts TTF files from the official google/fonts
// GitHub repo into public/fonts/wallart/ for wall art / music video font embedding.
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

const bases = [
  "https://cdn.jsdelivr.net/gh/google/fonts@main",
  "https://fastly.jsdelivr.net/gh/google/fonts@main",
  "https://raw.githubusercontent.com/google/fonts/main",
];

const fonts = [
  ["ofl/cevicheone/CevicheOne-Regular.ttf", "ceviche-one-400.ttf"],
  ["ofl/oleoscript/OleoScript-Regular.ttf", "oleo-script-400.ttf"],
  ["ofl/fugazone/FugazOne-Regular.ttf", "fugaz-one-400.ttf"],
  ["ofl/agbalumo/Agbalumo-Regular.ttf", "agbalumo-400.ttf"],
  ["apache/slackey/Slackey-Regular.ttf", "slackey-400.ttf"],
  ["ofl/racingsansone/RacingSansOne-Regular.ttf", "racing-sans-one-400.ttf"],
  ["ofl/bangers/Bangers-Regular.ttf", "bangers-400.ttf"],
];

const outDir = join(process.cwd(), "public", "fonts", "wallart");

for (const [repoPath, fileName] of fonts) {
  let lastError;
  for (const base of bases) {
    const url = `${base}/${repoPath}`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      await writeFile(join(outDir, fileName), buffer);
      console.log(`Downloaded ${fileName} (${buffer.length} bytes) from ${base}`);
      lastError = null;
      break;
    } catch (error) {
      lastError = error;
      console.warn(`Failed ${url}: ${error.message}`);
    }
  }
  if (lastError) {
    throw new Error(`Failed to download ${repoPath}: ${lastError.message}`);
  }
}
