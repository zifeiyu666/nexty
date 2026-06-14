export type EditableLyricLineKind = "title" | "section" | "blank" | "lyric";

export type EditableLyricLine = {
  id: string;
  kind: EditableLyricLineKind;
  text: string;
};

export type LyricsLineRewriteSuggestion = {
  lineId: string;
  originalText: string;
  rewrittenText: string;
};

type LyricsLineRewritePromptInput = {
  fullLyrics: string;
  selectedLines: string[];
  instruction?: string;
  language: string;
  genre: string;
  occasion: string;
  recipientNames: string[];
};

export const SONG_LYRICS_SAFETY_AND_FORMATTING_GUIDELINES = `# Core Safety & Compliance Guidelines (Highest-Priority Red Lines)
When generating or editing any lyrics, strictly follow these legal, compliance, and safety red lines. If any rule would be violated, refuse the request with only this standard compliance message:
"抱歉，您输入的内容包含敏感信息或可能引发版权争议，请调整提示词后重试。"

1. Politics and ideology: Refuse to generate any content involving politically sensitive topics, historical distortion, separatism, political bias, or hateful ideological expression.
2. Violence and sexual content: Do not include words, implications, or imagery that promote violence, drugs, gambling, pornography, vulgar sexual content, or self-harm.
3. Copyright protection and anti-plagiarism:
   - Do not directly copy, splice, paraphrase, or rewrite any existing famous song lyrics.
   - Never include recognizable classic lyric phrases from existing songs.
   - If the user explicitly asks to plagiarize, copy, rewrite, or imitate the lyrics of a specific song, refuse that request with the standard compliance message. You may instead create fully original lyrics inspired only by broad, non-infringing artistic traits such as romanticism, plainspoken imagery, narrative intimacy, or cinematic metaphor.
4. Reputation rights: If the user input mentions a real public figure or recognizable public figure and asks for attacking, insulting, defamatory, humiliating, or otherwise negative content about that person, refuse immediately with the standard compliance message.

# Business & Formatting Rules
1. Structured output: Use standard English bracketed section tags for lyric sections, such as [Verse 1], [Chorus], [Bridge], and [Outro].
2. Language and genre: Strictly follow the user-specified language and the musical genre's stylistic traits.
3. Rhyme and singability: The lyrics must use a deliberate Rhyme pattern, aligned line lengths, strong rhythm, and high Singability.`;

function occasionLabel(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function lyricLineKind(text: string): EditableLyricLineKind {
  const trimmed = text.trim();
  if (!trimmed) return "blank";
  if (/^title\s*:/i.test(trimmed)) return "title";
  if (/^\[[^\]]+\]$/.test(trimmed)) return "section";
  return "lyric";
}

export function parseLyricsText(lyrics: string): EditableLyricLine[] {
  return lyrics.split("\n").map((text, index) => ({
    id: `line-${index}`,
    kind: lyricLineKind(text),
    text,
  }));
}

export function composeLyricsText(lines: EditableLyricLine[]): string {
  return lines.map((line) => line.text).join("\n");
}

export function normalizeRewrittenLyricLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^```/.test(line))
    .filter((line) => !/^title\s*:/i.test(line))
    .filter((line) => !/^\[[^\]]+\]$/.test(line));
}

export function applyLyricsLineRewrite(
  lines: EditableLyricLine[],
  selectedLineIds: string[],
  rewrittenLines: string[]
): EditableLyricLine[] {
  const selectedIds = new Set(selectedLineIds);
  let rewriteIndex = 0;

  return lines.map((line) => {
    if (!selectedIds.has(line.id)) return line;

    const replacement = rewrittenLines[rewriteIndex];
    rewriteIndex += 1;

    return replacement === undefined ? line : { ...line, text: replacement };
  });
}

export function createLyricsLineRewriteSuggestions(
  lines: EditableLyricLine[],
  selectedLineIds: string[],
  rewrittenLines: string[]
): LyricsLineRewriteSuggestion[] {
  const selectedIds = new Set(selectedLineIds);
  let rewriteIndex = 0;

  return lines.flatMap((line) => {
    if (!selectedIds.has(line.id)) return [];

    const rewrittenText = rewrittenLines[rewriteIndex];
    rewriteIndex += 1;

    if (rewrittenText === undefined) return [];

    return [
      {
        lineId: line.id,
        originalText: line.text,
        rewrittenText,
      },
    ];
  });
}

export function buildLyricsLineRewritePrompt(
  input: LyricsLineRewritePromptInput
): string {
  const recipients = input.recipientNames.length
    ? input.recipientNames.join(", ")
    : "someone special";
  const instruction = input.instruction?.trim()
    ? input.instruction.trim()
    : "Improve emotional specificity, imagery, rhyme, rhythm, and singability while keeping the original meaning.";

  return `You are an elite lyric editor for personalized AI songs.

${SONG_LYRICS_SAFETY_AND_FORMATTING_GUIDELINES}

Task: rewrite only the selected lyric lines below.

First, read the entire song first and think about global continuity: title, section placement, story arc, repeated images, rhyme, rhythm, emotional progression, and what the surrounding lines already say.

Context:
- Language: ${input.language}
- Genre: ${input.genre}
- Occasion: ${occasionLabel(input.occasion)}
- Recipient: ${recipients}
- User direction: ${instruction}

Rules:
- Keep exactly ${input.selectedLines.length} non-empty line${input.selectedLines.length === 1 ? "" : "s"}.
- Return only the rewritten lines, one per line.
- Do not include title lines, section tags, numbering, markdown, explanations, or quotes.
- Repetition can be valid songwriting when it is intentional and separated by structure or musical purpose.
- Do not return two adjacent lyric lines that are identical or near-identical.
- Avoid making the replacement identical or near-identical to the lyric line immediately before or after it in the full song.
- Preserve the song's point of view and emotional intent.
- Make the lines natural to sing in ${input.language}.

Selected lines:
${input.selectedLines.join("\n")}

Full lyrics for context:
${input.fullLyrics.trim()}`;
}
