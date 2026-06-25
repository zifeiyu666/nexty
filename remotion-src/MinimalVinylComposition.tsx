import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useWindowedAudioData, visualizeAudio } from "@remotion/media-utils";
import {
  findActiveCue,
  type LyricCue,
  type MusicVideoTimeline,
} from "../lib/music-video/photo-slideshow";

export type MinimalVinylCompositionProps = {
  timeline: MusicVideoTimeline;
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function hasMediaSrc(value: string | null | undefined) {
  return Boolean(value?.trim());
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function useAudioEnergy(audioUrl: string) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const windowedAudio = useWindowedAudioData({
    fps,
    frame,
    src: audioUrl,
    windowInSeconds: 1.2,
  });

  if (!windowedAudio.audioData) {
    return 0.28 + Math.sin(frame / 18) * 0.08;
  }

  const samples = visualizeAudio({
    audioData: windowedAudio.audioData,
    dataOffsetInSeconds: windowedAudio.dataOffsetInSeconds,
    fps,
    frame,
    numberOfSamples: 24,
    optimizeFor: "speed",
    smoothing: true,
  });
  const lowMidEnergy = average(samples.slice(1, 10));

  return clamp(lowMidEnergy * 2.35, 0.12, 1);
}

function getVisibleLyrics({
  activeCue,
  cues,
}: {
  activeCue: LyricCue | null;
  cues: LyricCue[];
}) {
  const activeIndex = activeCue
    ? Math.max(
        0,
        cues.findIndex((cue) => cue.id === activeCue.id),
      )
    : 0;
  const start = Math.max(0, activeIndex - 2);

  return {
    activeIndex,
    start,
    lines: cues.slice(start, start + 5).map((cue, index) => ({
      cue,
      index: start + index,
    })),
  };
}

export function MinimalVinylComposition({
  timeline,
}: MinimalVinylCompositionProps) {
  const audioUrl = hasMediaSrc(timeline.audioUrl) ? timeline.audioUrl : null;

  if (audioUrl) {
    return <MinimalVinylAudioScene audioUrl={audioUrl} timeline={timeline} />;
  }

  return <MinimalVinylStaticScene timeline={timeline} />;
}

function MinimalVinylAudioScene({
  audioUrl,
  timeline,
}: {
  audioUrl: string;
  timeline: MusicVideoTimeline;
}) {
  const energy = useAudioEnergy(audioUrl);

  return (
    <MinimalVinylScene audioUrl={audioUrl} energy={energy} timeline={timeline} />
  );
}

function MinimalVinylStaticScene({
  timeline,
}: {
  timeline: MusicVideoTimeline;
}) {
  const frame = useCurrentFrame();
  const energy = 0.28 + Math.sin(frame / 18) * 0.08;

  return <MinimalVinylScene audioUrl={null} energy={energy} timeline={timeline} />;
}

function MinimalVinylScene({
  audioUrl,
  energy,
  timeline,
}: {
  audioUrl: string | null;
  energy: number;
  timeline: MusicVideoTimeline;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;
  const activeCue = findActiveCue(timeline.lyrics, currentTime);
  const { activeIndex, lines, start } = getVisibleLyrics({
    activeCue,
    cues: timeline.lyrics,
  });
  const coverUrl = timeline.coverPhoto?.url ?? timeline.coverPhoto?.objectUrl;
  const coverImageUrl = hasMediaSrc(coverUrl) ? coverUrl : null;
  const rotation = frame * 1.08;
  const recordScale = interpolate(energy, [0, 1], [1, 1.04]);
  const leakScale = interpolate(energy, [0, 1], [1, 1.18]);
  const glowOpacity = interpolate(energy, [0, 1], [0.22, 0.72]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#1a0704",
        color: "#fff7ed",
        fontFamily: "Arial, sans-serif",
        overflow: "hidden",
      }}
    >
      {audioUrl ? <Audio src={audioUrl} /> : null}

      <div
        style={{
          background:
            "radial-gradient(circle at 28% 18%, rgba(255,244,194,.92) 0 7%, rgba(255,177,66,.78) 15%, transparent 38%), radial-gradient(circle at 76% 36%, rgba(255,88,42,.7) 0 9%, rgba(220,38,38,.48) 22%, transparent 46%), linear-gradient(150deg, #3b0704 0%, #8b1e0b 35%, #e54817 61%, #f6ad31 100%)",
          inset: "-10%",
          opacity: interpolate(energy, [0, 1], [0.76, 1]),
          position: "absolute",
          transform: `scale(${leakScale}) rotate(${Math.sin(frame / 70) * 3}deg)`,
        }}
      />
      <div
        style={{
          background:
            "linear-gradient(90deg, transparent 0 10%, rgba(255,255,255,.16) 13%, transparent 22% 48%, rgba(255,214,102,.18) 52%, transparent 60% 100%)",
          filter: "blur(18px)",
          inset: "-12%",
          mixBlendMode: "screen",
          opacity: glowOpacity,
          position: "absolute",
          transform: `translateX(${Math.sin(frame / 42) * 42}px)`,
        }}
      />
      <div
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,.18) 0.8px, transparent 0.8px)",
          backgroundSize: "9px 9px",
          inset: 0,
          mixBlendMode: "overlay",
          opacity: 0.16,
          position: "absolute",
        }}
      />
      <div
        style={{
          background:
            "linear-gradient(to bottom, rgba(33,9,3,.05) 0%, rgba(33,9,3,.16) 42%, rgba(9,3,2,.82) 100%)",
          inset: 0,
          position: "absolute",
        }}
      />

      <div
        style={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          inset: "128px 0 430px",
          justifyContent: "center",
          position: "absolute",
        }}
      >
        <div
          style={{
            borderRadius: "50%",
            boxShadow: `0 0 ${70 + energy * 90}px rgba(255,221,116,${glowOpacity})`,
            height: 720,
            position: "relative",
            transform: `scale(${recordScale}) rotate(${rotation}deg)`,
            width: 720,
          }}
        >
          <div
            style={{
              background:
                "radial-gradient(circle, #2a2521 0 8%, #090806 9% 36%, #19130f 37% 39%, #060504 40% 100%)",
              border: "12px solid rgba(255,230,168,.22)",
              borderRadius: "50%",
              boxShadow:
                "inset 0 0 48px rgba(255,255,255,.08), inset 0 0 150px rgba(0,0,0,.88), 0 30px 90px rgba(0,0,0,.44)",
              inset: 0,
              position: "absolute",
            }}
          />
          {Array.from({ length: 13 }).map((_, index) => (
            <div
              key={index}
              style={{
                border: "1px solid rgba(255,244,214,.1)",
                borderRadius: "50%",
                inset: 58 + index * 22,
                position: "absolute",
              }}
            />
          ))}
          <div
            style={{
              background:
                "linear-gradient(108deg, transparent 0 36%, rgba(255,255,255,.2) 42%, transparent 51% 100%)",
              borderRadius: "50%",
              inset: 24,
              mixBlendMode: "screen",
              opacity: 0.48,
              position: "absolute",
            }}
          />
          <div
            style={{
              alignItems: "center",
              background:
                "radial-gradient(circle at 34% 26%, #fff1c0 0 9%, #ffb13d 10% 48%, #9f1d0d 49% 100%)",
              border: "8px solid rgba(255,250,230,.44)",
              borderRadius: "50%",
              boxShadow: "0 0 36px rgba(255,231,173,.32)",
              display: "flex",
              inset: 244,
              justifyContent: "center",
              overflow: "hidden",
              position: "absolute",
              transform: `rotate(${-rotation}deg)`,
            }}
          >
            {coverImageUrl ? (
              <Img
                src={coverImageUrl}
                style={{
                  height: "100%",
                  objectFit: "cover",
                  width: "100%",
                }}
              />
            ) : (
              <div
                style={{
                  color: "#2a0904",
                  fontSize: 30,
                  fontWeight: 900,
                  lineHeight: 1.05,
                  padding: 22,
                  textAlign: "center",
                  textTransform: "uppercase",
                }}
              >
                {timeline.songTitle}
              </div>
            )}
          </div>
          <div
            style={{
              background: "#130d0a",
              border: "4px solid rgba(255,241,214,.58)",
              borderRadius: "50%",
              height: 36,
              left: "50%",
              position: "absolute",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: 36,
            }}
          />
        </div>
      </div>

      <div
        style={{
          bottom: 78,
          left: 70,
          overflow: "hidden",
          position: "absolute",
          right: 70,
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(180deg, rgba(36,9,3,.18), rgba(17,5,3,.78))",
            border: "1px solid rgba(255,237,213,.26)",
            borderRadius: 34,
            boxShadow: "0 22px 70px rgba(0,0,0,.28)",
            padding: "34px 42px",
          }}
        >
          <div
            style={{
              color: "rgba(255,237,213,.62)",
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: 0,
              marginBottom: 18,
              textTransform: "uppercase",
            }}
          >
            {timeline.songTitle}
          </div>
          <div style={{ height: 250, overflow: "hidden", position: "relative" }}>
            <div
              style={{
                transform: `translateY(${(2 - (activeIndex - start)) * 58}px)`,
                transition: "transform 120ms linear",
              }}
            >
              {lines.map(({ cue, index }) => {
                const distance = Math.abs(index - activeIndex);
                const isActive = index === activeIndex;

                return (
                  <div
                    key={cue.id}
                    style={{
                      color: isActive
                        ? "#fff7ed"
                        : `rgba(255,237,213,${distance > 1 ? 0.34 : 0.56})`,
                      fontSize: isActive ? 43 : 32,
                      fontWeight: isActive ? 900 : 800,
                      height: 58,
                      lineHeight: "58px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      textShadow: isActive
                        ? "0 0 32px rgba(255,224,138,.46)"
                        : "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {cue.text}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}
