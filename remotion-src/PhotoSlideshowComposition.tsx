import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Video,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  DEFAULT_LYRICS_STYLE,
  DEFAULT_TRANSITION_TYPE,
  findActiveCue,
  normalizeLyricsStyleConfig,
  resolveCuePhotos,
  getUploadedMediaType,
  type LyricsEntranceMode,
  type LyricsPosition,
  type LyricsStyleConfig,
  type LyricCue,
  type MusicVideoTimeline,
  type TransitionAssignment,
  type UploadedPhoto,
} from "../lib/music-video/photo-slideshow";
import { wallArtFontFiles } from "../lib/wall-art/fonts";
import { useMemo, type CSSProperties } from "react";
import { AtmosphereOverlay } from "./AtmosphereOverlay";

export type PhotoSlideshowCompositionProps = {
  timeline: MusicVideoTimeline;
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function hasMediaSrc(value: string | null | undefined) {
  return Boolean(value?.trim());
}

function getMediaUrl(media: UploadedPhoto | null | undefined) {
  const mediaUrl = media?.url ?? media?.objectUrl ?? null;
  return hasMediaSrc(mediaUrl) ? mediaUrl : null;
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function buildFontFaceCss() {
  return wallArtFontFiles
    .map(([family, src, weight]) => {
      const staticSrc = staticFile(src.replace(/^\/+/, ""));

      return `@font-face{font-family:'${family}';src:url('${staticSrc}') format('truetype');font-style:normal;font-weight:${weight};font-display:swap;}`;
    })
    .join("");
}

function normalizeLyricsStyle(
  lyricsStyle: MusicVideoTimeline["lyricsStyle"],
): LyricsStyleConfig {
  return normalizeLyricsStyleConfig(lyricsStyle);
}

function getLyricsOverlayStyle(position: LyricsPosition): CSSProperties {
  if (position === "top") {
    return {
      background: "linear-gradient(to bottom, rgba(0,0,0,.86), transparent)",
      left: 0,
      padding: "86px 64px 280px",
      position: "absolute",
      right: 0,
      top: 0,
    };
  }

  if (position === "center") {
    return {
      background:
        "linear-gradient(to bottom, transparent, rgba(0,0,0,.56) 34%, rgba(0,0,0,.56) 66%, transparent)",
      left: 0,
      padding: "0 64px",
      position: "absolute",
      right: 0,
      top: "50%",
      transform: "translateY(-50%)",
    };
  }

  return {
    background: "linear-gradient(to top, rgba(0,0,0,.9), transparent)",
    bottom: 0,
    left: 0,
    padding: "280px 64px 86px",
    position: "absolute",
    right: 0,
  };
}

function SlideshowMediaLayer({
  media,
  mediaUrl,
  opacity,
  scale,
  blur = 0,
  startFromFrame = 0,
}: {
  media: UploadedPhoto | null | undefined;
  mediaUrl: string;
  opacity: number;
  scale: number;
  blur?: number;
  startFromFrame?: number;
}) {
  const style: CSSProperties = {
    filter: blur > 0 ? `blur(${blur}px)` : "none",
    height: "100%",
    objectFit: "cover",
    opacity,
    position: "absolute",
    transform: `scale(${scale})`,
    width: "100%",
  };

  if (getUploadedMediaType(media) === "video") {
    return (
      <Video
        loop
        muted
        startFrom={Math.max(0, Math.floor(startFromFrame))}
        src={mediaUrl}
        style={style}
      />
    );
  }

  return <Img src={mediaUrl} style={style} />;
}

function getLyricTextStyle(lyricsStyle: LyricsStyleConfig): CSSProperties {
  return {
    WebkitTextStroke:
      lyricsStyle.strokeWidth > 0
        ? `${lyricsStyle.strokeWidth}px ${lyricsStyle.strokeColor}`
        : undefined,
    color: lyricsStyle.color,
    fontFamily: lyricsStyle.fontFamily,
    fontSize: lyricsStyle.fontSize,
    fontWeight: 900,
    lineHeight: 1.15,
    paintOrder: "stroke fill",
    textShadow:
      lyricsStyle.strokeWidth > 0
        ? `0 2px ${lyricsStyle.strokeColor}`
        : "0 2px 14px rgba(0,0,0,.45)",
  };
}

function getCueProgress({
  cue,
  currentFrame,
  fps,
  seconds,
}: {
  cue: LyricCue | null;
  currentFrame: number;
  fps: number;
  seconds: number;
}) {
  if (!cue) return 1;

  const cueStartFrame = cue.start * fps;
  const cueEndFrame = cue.end * fps;
  const durationFrames = Math.max(1, seconds * fps);
  const inProgress = interpolate(
    currentFrame,
    [cueStartFrame, cueStartFrame + durationFrames],
    [0, 1],
    {
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const outProgress = interpolate(
    currentFrame,
    [cueEndFrame - durationFrames, cueEndFrame],
    [0, 1],
    {
      easing: Easing.bezier(0.7, 0, 0.84, 0),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return clamp(inProgress * (1 - outProgress));
}

const MOTION_BLUR_SLIP_DISTANCE_PX = 20;
const ROLLING_FLOW_VISIBLE_LINES = 2;
const ROLLING_FLOW_LINE_HEIGHT = 1.24;
const ROLLING_FLOW_VERTICAL_PADDING_PX = 18;

function AnimatedSingleLyric({
  cue,
  currentFrame,
  currentTime,
  entrance,
  fps,
  lyricsStyle,
  songTitle,
}: {
  cue: LyricCue | null;
  currentFrame: number;
  currentTime: number;
  entrance: Exclude<LyricsEntranceMode, "rolling-flow">;
  fps: number;
  lyricsStyle: LyricsStyleConfig;
  songTitle: string;
}) {
  const text = cue?.text ?? songTitle;
  const textStyle = getLyricTextStyle(lyricsStyle);
  const slipInProgress = getCueProgress({
    cue,
    currentFrame,
    fps,
    seconds: 0.35,
  });
  const slipOutProgress =
    cue && cue.end > cue.start
      ? interpolate(
          currentFrame,
          [cue.end * fps - 0.3 * fps, cue.end * fps],
          [0, 1],
          {
            easing: Easing.bezier(0.7, 0, 0.84, 0),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        )
      : 0;
  const slipOpacity = clamp(slipInProgress * (1 - slipOutProgress));
  const slipTranslateY =
    interpolate(slipInProgress, [0, 1], [MOTION_BLUR_SLIP_DISTANCE_PX, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) +
    interpolate(slipOutProgress, [0, 1], [0, -MOTION_BLUR_SLIP_DISTANCE_PX], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  const slipBlur =
    interpolate(slipInProgress, [0, 1], [10, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) +
    interpolate(slipOutProgress, [0, 1], [0, 10], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  const staggerOutProgress =
    cue && cue.end > cue.start
      ? interpolate(
          currentFrame,
          [cue.end * fps - 0.28 * fps, cue.end * fps],
          [0, 1],
          {
            easing: Easing.bezier(0.7, 0, 0.84, 0),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        )
      : 0;
  const staggerTranslateX = interpolate(staggerOutProgress, [0, 1], [0, 20], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        filter:
          entrance === "motion-blur-slip" ? `blur(${slipBlur}px)` : undefined,
        marginTop: 10,
        opacity: entrance === "motion-blur-slip" ? slipOpacity : 1,
        transform:
          entrance === "motion-blur-slip"
            ? `translateY(${slipTranslateY}px)`
            : `translateX(${staggerTranslateX}px)`,
      }}
    >
      {entrance === "motion-blur-slip" ? (
        <div style={textStyle}>{text}</div>
      ) : (
        <div
          style={{
            ...textStyle,
            opacity: 1 - staggerOutProgress,
            whiteSpace: "pre-wrap",
          }}
        >
          {Array.from(text).map((char, index) => {
            const cueStartFrame = (cue?.start ?? currentTime) * fps;
            const charProgress = interpolate(
              currentFrame,
              [cueStartFrame + index * 2, cueStartFrame + index * 2 + 8],
              [0, 1],
              {
                easing: Easing.bezier(0.16, 1, 0.3, 1),
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            );

            return (
              <span
                key={`${char}-${index}`}
                style={{
                  opacity: charProgress,
                  textShadow: `0 0 ${interpolate(
                    charProgress,
                    [0, 1],
                    [14, 4],
                    {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    },
                  )}px rgba(255,255,255,.72)`,
                }}
              >
                {char}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RollingLyrics({
  activeCueIndex,
  currentFrame,
  fps,
  lyrics,
  lyricsStyle,
  songTitle,
}: {
  activeCueIndex: number;
  currentFrame: number;
  fps: number;
  lyrics: LyricCue[];
  lyricsStyle: LyricsStyleConfig;
  songTitle: string;
}) {
  const safeIndex = Math.max(0, activeCueIndex);
  const activeCue = lyrics[safeIndex] ?? null;
  const previousCue = safeIndex > 0 ? lyrics[safeIndex - 1] : null;
  const nextCue = lyrics[safeIndex + 1] ?? null;
  const rowHeight = Math.max(
    112,
    lyricsStyle.fontSize * ROLLING_FLOW_LINE_HEIGHT * ROLLING_FLOW_VISIBLE_LINES +
      ROLLING_FLOW_VERTICAL_PADDING_PX * 2,
  );
  const rollProgress = activeCue
    ? interpolate(
        currentFrame,
        [activeCue.start * fps, activeCue.start * fps + 0.42 * fps],
        [1, 0],
        {
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        },
      )
    : 0;
  const rows = [
    { cue: previousCue, role: "previous", y: -rowHeight },
    { cue: activeCue, role: "current", y: 0 },
    { cue: nextCue, role: "next", y: rowHeight },
  ] as const;

  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        inset: 0,
        justifyContent: "center",
        position: "absolute",
      }}
    >
      <div
        style={{
          height: rowHeight * 3,
          overflow: "hidden",
          position: "relative",
          transform: `translateY(${rollProgress * rowHeight}px)`,
          width: "82%",
        }}
      >
        {rows.map(({ cue, role, y }) => {
          const isCurrent = role === "current";

          return (
            <div
              key={role}
              data-rolling-flow-current={isCurrent ? true : undefined}
              style={{
                ...getLyricTextStyle(lyricsStyle),
                alignItems: "center",
                color: isCurrent ? lyricsStyle.color : "rgba(255,255,255,.58)",
                display: "flex",
                filter: isCurrent ? "none" : "blur(1.4px)",
                fontSize: isCurrent
                  ? lyricsStyle.fontSize
                  : Math.max(24, lyricsStyle.fontSize * 0.72),
                fontWeight: isCurrent ? 900 : 700,
                height: rowHeight,
                justifyContent: "center",
                left: 0,
                opacity: isCurrent ? 1 : 0.54,
                overflow: "visible",
                position: "absolute",
                right: 0,
                textAlign: "center",
                top: rowHeight,
                transform: `translateY(${y}px)`,
              }}
            >
              <span
                style={{
                  display: "-webkit-box",
                  lineHeight: ROLLING_FLOW_LINE_HEIGHT,
                  maxWidth: "100%",
                  overflow: "hidden",
                  padding: `${ROLLING_FLOW_VERTICAL_PADDING_PX}px 0`,
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: ROLLING_FLOW_VISIBLE_LINES,
                }}
              >
                {cue?.text ?? (isCurrent ? songTitle : "")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getCuePhoto({
  cue,
  resolved,
}: {
  cue: LyricCue | null;
  resolved: ReturnType<typeof resolveCuePhotos>;
}) {
  return cue
    ? (resolved.find((item) => item.cue.id === cue.id)?.photo ?? null)
    : null;
}

function getTransitionForBoundary({
  fromCue,
  timeline,
  toCue,
}: {
  fromCue: LyricCue | null;
  timeline: MusicVideoTimeline;
  toCue: LyricCue | null;
}): TransitionAssignment | null {
  if (!fromCue || !toCue) return null;

  return (
    timeline.transitions.find(
      (transition) =>
        transition.fromCueId === fromCue.id && transition.toCueId === toCue.id,
    ) ?? {
      fromCueId: fromCue.id,
      toCueId: toCue.id,
      type: DEFAULT_TRANSITION_TYPE,
    }
  );
}

export function PhotoSlideshowComposition({
  timeline,
}: PhotoSlideshowCompositionProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;
  const activeCue = findActiveCue(timeline.lyrics, currentTime);
  const activeCueIndex = activeCue
    ? timeline.lyrics.findIndex((cue) => cue.id === activeCue.id)
    : -1;
  const previousCue =
    activeCueIndex > 0 ? timeline.lyrics[activeCueIndex - 1] : null;
  const nextCue =
    activeCueIndex >= 0 ? (timeline.lyrics[activeCueIndex + 1] ?? null) : null;
  const resolved = resolveCuePhotos({
    assignments: timeline.assignments,
    coverPhoto: timeline.coverPhoto,
    cues: timeline.lyrics,
    photos: timeline.photos,
  });
  const activePhoto = getCuePhoto({ cue: activeCue, resolved });
  const previousPhoto = getCuePhoto({ cue: previousCue, resolved });
  const nextPhoto = getCuePhoto({ cue: nextCue, resolved });
  const audioUrl = hasMediaSrc(timeline.audioUrl) ? timeline.audioUrl : null;
  const activePhotoUrl = getMediaUrl(activePhoto);
  const previousPhotoUrl = getMediaUrl(previousPhoto);
  const nextPhotoUrl = getMediaUrl(nextPhoto);
  const loopProgress = (Math.sin((frame / (fps * 7)) * Math.PI * 2) + 1) / 2;
  const breathingScale = interpolate(loopProgress, [0, 1], [1.03, 1.1]);
  const transitionFrames = Math.max(12, Math.round(fps * 0.55));
  const incomingProgress =
    activeCue && previousCue
      ? clamp((frame - activeCue.start * fps) / transitionFrames)
      : 1;
  const outgoingProgress =
    activeCue && nextCue
      ? clamp((nextCue.start * fps - frame) / transitionFrames)
      : 1;
  const isIncomingTransition =
    Boolean(activeCue && previousCue) && incomingProgress < 1;
  const isOutgoingTransition =
    Boolean(activeCue && nextCue) && outgoingProgress < 1;
  const incomingTransition = getTransitionForBoundary({
    fromCue: previousCue,
    timeline,
    toCue: activeCue,
  });
  const outgoingTransition = getTransitionForBoundary({
    fromCue: activeCue,
    timeline,
    toCue: nextCue,
  });
  const activeBoundaryTransition = isIncomingTransition
    ? incomingTransition
    : isOutgoingTransition
      ? outgoingTransition
      : null;
  const fontFaceCss = useMemo(buildFontFaceCss, []);
  const lyricsStyle = normalizeLyricsStyle(timeline.lyricsStyle);
  const lyricsOverlayStyle = getLyricsOverlayStyle(lyricsStyle.position);
  const transitionType = activeBoundaryTransition?.type ?? DEFAULT_TRANSITION_TYPE;
  const secondaryPhotoUrl = isIncomingTransition
    ? previousPhotoUrl
    : isOutgoingTransition
      ? nextPhotoUrl
      : null;
  const activeOpacity = isIncomingTransition
    ? incomingProgress
    : isOutgoingTransition
      ? outgoingProgress
      : 1;
  const secondaryOpacity = isIncomingTransition
    ? 1 - incomingProgress
    : isOutgoingTransition
      ? 1 - outgoingProgress
      : 0;
  const motionBlur = isIncomingTransition
    ? (1 - incomingProgress) * 15
    : isOutgoingTransition
      ? (1 - outgoingProgress) * 15
      : 0;
  const activeScale =
    transitionType === "zoom-push" && isIncomingTransition
      ? interpolate(incomingProgress, [0, 1], [0.9, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : transitionType === "zoom-push" && isOutgoingTransition
        ? interpolate(outgoingProgress, [0, 1], [1.2, 1.05], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        : breathingScale;
  const secondaryScale =
    transitionType === "zoom-push" && isIncomingTransition
      ? interpolate(incomingProgress, [0, 1], [1.2, 1.05], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : transitionType === "zoom-push" && isOutgoingTransition
        ? interpolate(outgoingProgress, [0, 1], [0.9, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        : breathingScale;
  const lightLeakProgress = isIncomingTransition
    ? incomingProgress
    : isOutgoingTransition
      ? 1 - outgoingProgress
      : 0;
  const lightLeakOpacity =
    transitionType === "light-leak"
      ? Math.sin(clamp(lightLeakProgress) * Math.PI) * 0.82
      : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#120f0f", fontFamily: "sans-serif" }}>
      <style>{fontFaceCss}</style>
      {audioUrl ? <Audio src={audioUrl} /> : null}

      {activePhotoUrl ? (
        <>
          <SlideshowMediaLayer
            blur={30}
            media={activePhoto}
            mediaUrl={activePhotoUrl}
            opacity={0.55}
            scale={1.18}
            startFromFrame={Math.max(0, frame - (activeCue?.start ?? 0) * fps)}
          />
          {secondaryPhotoUrl ? (
            <SlideshowMediaLayer
              blur={transitionType === "motion-blur" ? motionBlur : 0}
              media={isIncomingTransition ? previousPhoto : nextPhoto}
              mediaUrl={secondaryPhotoUrl}
              opacity={secondaryOpacity}
              scale={secondaryScale}
              startFromFrame={
                isIncomingTransition
                  ? Math.max(0, frame - (previousCue?.start ?? 0) * fps)
                  : Math.max(0, frame - (nextCue?.start ?? 0) * fps)
              }
            />
          ) : null}
          <SlideshowMediaLayer
            blur={transitionType === "motion-blur" ? motionBlur : 0}
            media={activePhoto}
            mediaUrl={activePhotoUrl}
            opacity={activeOpacity}
            scale={activeScale}
            startFromFrame={Math.max(0, frame - (activeCue?.start ?? 0) * fps)}
          />
        </>
      ) : null}

      {lightLeakOpacity > 0 ? (
        <div
          style={{
            background:
              "radial-gradient(circle at 18% 42%, rgba(255,244,220,.95) 0 8%, rgba(251,146,60,.82) 18%, rgba(244,63,94,.4) 33%, transparent 58%)",
            inset: "-18%",
            opacity: lightLeakOpacity,
            pointerEvents: "none",
            position: "absolute",
            transform: `scale(${1 + lightLeakProgress * 0.22})`,
          }}
        />
      ) : null}

      {lyricsStyle.entrance === "rolling-flow" ? (
        <RollingLyrics
          activeCueIndex={activeCueIndex}
          currentFrame={frame}
          fps={fps}
          lyrics={timeline.lyrics}
          lyricsStyle={lyricsStyle}
          songTitle={timeline.songTitle}
        />
      ) : (
        <div
          style={{
            boxSizing: "border-box",
            color: "white",
            ...lyricsOverlayStyle,
          }}
        >
          <div
            style={{
              backdropFilter: "blur(18px)",
              background: "rgba(255,255,255,.14)",
              border: "1px solid rgba(255,255,255,.22)",
              borderRadius: 28,
              padding: 34,
            }}
          >
            <div
              style={{
                color: "rgba(255,255,255,.62)",
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: 4,
                textTransform: "uppercase",
              }}
            >
              {formatTime(currentTime)}
            </div>
            <AnimatedSingleLyric
              cue={activeCue}
              currentFrame={frame}
              currentTime={currentTime}
              entrance={lyricsStyle.entrance}
              fps={fps}
              lyricsStyle={lyricsStyle}
              songTitle={timeline.songTitle}
            />
          </div>
        </div>
      )}

      <AtmosphereOverlay overlay={timeline.atmosphereOverlay} />
    </AbsoluteFill>
  );
}
