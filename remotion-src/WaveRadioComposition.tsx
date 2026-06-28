import {
  AbsoluteFill,
  Audio,
  Easing,
  Video,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  DEFAULT_WAVE_RADIO_BACKGROUND,
  WAVE_RADIO_BACKGROUND_OPTIONS,
  findActiveCue,
  normalizeLyricsStyleConfig,
  normalizeWaveRadioBackgroundId,
  type LyricsStyleConfig,
  type LyricCue,
  type MusicVideoTimeline,
} from "../lib/music-video/photo-slideshow";

export type WaveRadioCompositionProps = {
  timeline: MusicVideoTimeline;
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function hasMediaSrc(value: string | null | undefined) {
  return Boolean(value?.trim());
}

function getBackgroundOption(backgroundId?: string) {
  const safeId = normalizeWaveRadioBackgroundId(backgroundId);

  return (
    WAVE_RADIO_BACKGROUND_OPTIONS.find((option) => option.id === safeId) ??
    DEFAULT_WAVE_RADIO_BACKGROUND
  );
}

function getCueTransitionProgress({
  cue,
  frame,
  fps,
}: {
  cue: LyricCue | null;
  frame: number;
  fps: number;
}) {
  if (!cue) return { inProgress: 1, outProgress: 0 };

  const cueStart = cue.start * fps;
  const cueEnd = cue.end * fps;
  const inProgress = interpolate(frame, [cueStart, cueStart + fps * 0.34], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const outProgress = interpolate(frame, [cueEnd - fps * 0.28, cueEnd], [0, 1], {
    easing: Easing.bezier(0.7, 0, 0.84, 0),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return { inProgress, outProgress };
}

function SingleLineLyric({
  cue,
  frame,
  fps,
  lyricsStyle,
  songTitle,
}: {
  cue: LyricCue | null;
  frame: number;
  fps: number;
  lyricsStyle: LyricsStyleConfig;
  songTitle: string;
}) {
  const { inProgress, outProgress } = getCueTransitionProgress({
    cue,
    frame,
    fps,
  });
  const opacity = clamp(inProgress * (1 - outProgress));
  const y =
    interpolate(inProgress, [0, 1], [34, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) +
    interpolate(outProgress, [0, 1], [0, -28], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  const blur =
    interpolate(inProgress, [0, 1], [14, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) +
    interpolate(outProgress, [0, 1], [0, 10], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <div
      style={{
        WebkitTextStroke:
          lyricsStyle.strokeWidth > 0
            ? `${lyricsStyle.strokeWidth}px ${lyricsStyle.strokeColor}`
            : undefined,
        color: lyricsStyle.color,
        filter: `blur(${blur}px)`,
        fontFamily: lyricsStyle.fontFamily,
        fontSize: `clamp(38px, ${lyricsStyle.fontSize}px, 96px)`,
        fontWeight: 950,
        letterSpacing: 0,
        lineHeight: 1.05,
        maxWidth: "86%",
        opacity,
        overflow: "hidden",
        paintOrder: "stroke fill",
        textAlign: "center",
        textOverflow: "ellipsis",
        textShadow:
          lyricsStyle.strokeWidth > 0
            ? `0 2px ${lyricsStyle.strokeColor}`
            : "0 8px 32px rgba(0,0,0,.68)",
        transform: `translateY(${y}px) scale(${0.96 + inProgress * 0.04})`,
        whiteSpace: "nowrap",
      }}
    >
      {cue?.text ?? songTitle}
    </div>
  );
}

export function WaveRadioComposition({ timeline }: WaveRadioCompositionProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;
  const activeCue = findActiveCue(timeline.lyrics, currentTime);
  const audioSrc = hasMediaSrc(timeline.audioUrl) ? timeline.audioUrl : "";
  const lyricsStyle = {
    ...normalizeLyricsStyleConfig(timeline.lyricsStyle),
    position: "center" as const,
  };
  const background = getBackgroundOption(
    timeline.templateId === "wave-radio"
      ? timeline.waveRadioBackgroundId
      : undefined,
  );
  const pulse = (Math.sin((frame / fps) * Math.PI * 2 * 0.4) + 1) / 2;

  return (
    <AbsoluteFill style={{ backgroundColor: "#05070a", overflow: "hidden" }}>
      {audioSrc ? <Audio src={audioSrc} /> : null}
      <Video
        loop
        muted
        name={`Wave Radio Background: ${background.label}`}
        src={staticFile(background.src.replace(/^\/+/, ""))}
        style={{
          filter: "saturate(1.2) contrast(1.08)",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${1.04 + pulse * 0.025})`,
          width: "100%",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(3,7,18,.52), rgba(3,7,18,.08) 42%, rgba(3,7,18,.72)), radial-gradient(circle at 50% 50%, rgba(34,211,238,.2), transparent 42%)",
        }}
      />
      <AbsoluteFill
        style={{
          alignItems: "center",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <SingleLineLyric
          cue={activeCue}
          frame={frame}
          fps={fps}
          lyricsStyle={lyricsStyle}
          songTitle={timeline.songTitle}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
