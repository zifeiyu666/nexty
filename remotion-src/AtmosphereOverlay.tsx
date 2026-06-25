import {
  AbsoluteFill,
  Loop,
  OffthreadVideo,
  staticFile,
} from "remotion";
import {
  ATMOSPHERE_OVERLAY_OPTIONS,
  normalizeAtmosphereOverlayConfig,
  type AtmosphereOverlayConfig,
} from "../lib/music-video/photo-slideshow";

export function AtmosphereOverlay({
  overlay,
}: {
  overlay?: AtmosphereOverlayConfig;
}) {
  const config = normalizeAtmosphereOverlayConfig(overlay);
  const option = ATMOSPHERE_OVERLAY_OPTIONS.find(
    (item) => item.id === config.overlayId,
  );

  if (!option) return null;

  return (
    <AbsoluteFill
      style={{
        mixBlendMode: "screen",
        opacity: config.opacity,
        pointerEvents: "none",
      }}
    >
      <Loop durationInFrames={option.durationInFrames}>
        <OffthreadVideo
          muted
          name={`Atmosphere: ${option.label}`}
          pauseWhenBuffering
          src={staticFile(option.src.replace(/^\/+/, ""))}
          style={{
            height: "100%",
            objectFit: "cover",
            width: "100%",
          }}
        />
      </Loop>
    </AbsoluteFill>
  );
}
