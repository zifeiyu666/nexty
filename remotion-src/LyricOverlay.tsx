/**
 * Selected caption themes adapted from vshukla7/remotion-captions-themes.
 * Upstream project: MIT License, https://github.com/vshukla7/remotion-captions-themes
 * This local implementation uses Remotion frame-driven animation only.
 */
import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type {
  CaptionLine,
  CaptionThemeId,
  LyricsCaptionData,
  LyricsPosition,
  LyricsStyleConfig,
} from "../lib/music-video/photo-slideshow";

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function getActiveLine(lines: CaptionLine[], time: number) {
  let active = lines[0] ?? null;
  for (const line of lines) {
    const first = line.words[0];
    const last = line.words.at(-1);
    if (!first || !last) continue;
    if (time >= first.start && time < last.end) return line;
    if (time >= last.end) active = line;
  }
  return active;
}

function positionStyle(position: LyricsPosition) {
  if (position === "top") return { top: "11%" };
  if (position === "bottom") return { bottom: "9%" };
  return { top: "50%", transform: "translateY(-50%)" };
}

const themeFont: Record<Exclude<CaptionThemeId, "classic">, string> = {
  pop: 'Montserrat, ui-sans-serif, system-ui',
  karaoke: 'Montserrat, ui-sans-serif, system-ui',
  hustle: 'Impact, fantasy',
  beast: 'Impact, fantasy',
  "soft-ai": 'Georgia, serif',
  podcast: '"DM Serif Text", Georgia, serif',
};

export function LyricOverlay({
  captions,
  captionTheme,
  lyricsStyle,
}: {
  captions: LyricsCaptionData;
  captionTheme: Exclude<CaptionThemeId, "classic">;
  lyricsStyle: LyricsStyleConfig;
}) {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const time = frame / fps;
  const line = getActiveLine(captions.lines, time);
  if (!line?.words.length) return null;

  const scale = clamp(width / 1080, 0.55, 1.5);
  const fontSize = Math.round(clamp(lyricsStyle.fontSize * scale, 28, 112));
  const isKaraoke = captionTheme === "karaoke";
  const isSoft = captionTheme === "soft-ai";
  const isPodcast = captionTheme === "podcast";
  const isBeast = captionTheme === "beast";
  const isHustle = captionTheme === "hustle";

  return (
    <div
      data-caption-theme={captionTheme}
      style={{
        alignItems: "center",
        boxSizing: "border-box",
        display: "flex",
        justifyContent: "center",
        left: 0,
        padding: "0 7%",
        position: "absolute",
        right: 0,
        textAlign: "center",
        ...positionStyle(lyricsStyle.position),
      }}
    >
      <div
        style={{
          alignItems: "center",
          background: isSoft ? "rgba(10, 18, 32, .38)" : undefined,
          border: isSoft ? "1px solid rgba(255,255,255,.25)" : undefined,
          borderRadius: isSoft ? 30 : undefined,
          boxShadow: isSoft ? "0 18px 50px rgba(0,0,0,.25)" : undefined,
          color: lyricsStyle.color,
          display: "flex",
          flexWrap: "wrap",
          fontFamily: themeFont[captionTheme],
          fontSize,
          fontWeight: isPodcast ? 700 : 900,
          gap: `${Math.max(7, fontSize * 0.16)}px ${Math.max(10, fontSize * 0.28)}px`,
          justifyContent: "center",
          letterSpacing: isHustle ? "0.035em" : 0,
          lineHeight: 1.12,
          maxWidth: "100%",
          padding: isSoft ? `${Math.max(14, fontSize * .22)}px ${Math.max(20, fontSize * .38)}px` : 0,
          textShadow: isBeast
            ? `0 ${Math.max(3, fontSize * .08)}px 0 #111, 0 ${Math.max(6, fontSize * .14)}px ${Math.max(14, fontSize * .3)}px rgba(0,0,0,.6)`
            : "0 5px 18px rgba(0,0,0,.58)",
          textTransform: isHustle || isBeast ? "uppercase" : undefined,
        }}
      >
        {line.words.map((word, index) => {
          const isActive = time >= word.start && time < word.end;
          const isPast = time >= word.end;
          const relativeFrame = frame - Math.round(word.start * fps);
          const pop = spring({
            frame: Math.max(0, relativeFrame),
            fps,
            config: { damping: 11, mass: 0.38, stiffness: isHustle ? 220 : 150 },
          });
          const reveal = interpolate(relativeFrame, [0, 7], [0, 1], {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const karaokeProgress = isPast
            ? 100
            : isActive
              ? clamp((time - word.start) / (word.end - word.start)) * 100
              : 0;
          const color = isActive || isPast ? lyricsStyle.strokeColor : lyricsStyle.color;

          return (
            <span
              key={`${word.start}-${index}`}
              style={{
                color: isKaraoke ? lyricsStyle.color : color,
                display: "inline-block",
                filter: isSoft ? `blur(${interpolate(reveal, [0, 1], [8, 0])}px)` : undefined,
                opacity: isPodcast ? (isActive ? 1 : 0.62) : reveal,
                position: "relative",
                transform: isPodcast
                  ? `scale(${isActive ? 1.07 : 1})`
                  : `translateY(${interpolate(reveal, [0, 1], [isHustle ? 32 : 15, 0])}px) scale(${isActive ? 1 + pop * (isHustle ? .2 : .13) : 1})`,
              }}
            >
              {word.text}
              {isKaraoke ? (
                <span
                  aria-hidden
                  style={{
                    clipPath: `inset(0 ${100 - karaokeProgress}% 0 0)`,
                    color: lyricsStyle.strokeColor,
                    inset: 0,
                    overflow: "hidden",
                    position: "absolute",
                    whiteSpace: "nowrap",
                  }}
                >
                  {word.text}
                </span>
              ) : null}
            </span>
          );
        })}
      </div>
    </div>
  );
}
