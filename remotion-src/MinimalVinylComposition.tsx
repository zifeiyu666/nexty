import { useVideoConfig } from "remotion";
import {
  DEFAULT_MINIMAL_VINYL_BACKGROUND_BLUR,
  normalizeMinimalVinylBackgroundOverlayConfig,
  normalizeLyricsStyleConfig,
  type MusicVideoTimeline,
} from "../lib/music-video/photo-slideshow";
import { RadialVisualizer } from "./RadialMusicVisualizer";

export type MinimalVinylCompositionProps = {
  timeline: MusicVideoTimeline;
};

function hasMediaSrc(value: string | null | undefined) {
  return Boolean(value?.trim());
}

export function MinimalVinylComposition({
  timeline,
}: MinimalVinylCompositionProps) {
  const { height, width } = useVideoConfig();
  const audioSrc = hasMediaSrc(timeline.audioUrl) ? timeline.audioUrl : "";
  const coverImageSrc =
    timeline.coverPhoto?.objectUrl ?? timeline.coverPhoto?.url ?? null;
  const backgroundImageSrc =
    timeline.templateId === "minimal-vinyl"
      ? (timeline.backgroundPhoto?.url ??
        timeline.backgroundPhoto?.objectUrl ??
        coverImageSrc)
      : coverImageSrc;
  const shortSide = Math.min(width, height);
  const lyricsStyle = normalizeLyricsStyleConfig(timeline.lyricsStyle);
  const backgroundOverlay =
    timeline.templateId === "minimal-vinyl"
      ? normalizeMinimalVinylBackgroundOverlayConfig(timeline.backgroundOverlay)
      : undefined;

  return (
    <RadialVisualizer
      audioSrc={audioSrc}
      backgroundBlur={
        timeline.templateId === "minimal-vinyl"
          ? (timeline.backgroundBlur ?? DEFAULT_MINIMAL_VINYL_BACKGROUND_BLUR)
          : DEFAULT_MINIMAL_VINYL_BACKGROUND_BLUR
      }
      backgroundOverlay={backgroundOverlay}
      backgroundImageSrc={
        hasMediaSrc(backgroundImageSrc) ? backgroundImageSrc : null
      }
      baseRadius={shortSide * 0.22}
      coverImageSrc={hasMediaSrc(coverImageSrc) ? coverImageSrc : null}
      density={128}
      glowColor="#5ee7ff"
      lyricCues={timeline.lyrics}
      lyricsStyle={lyricsStyle}
      maxBarHeight={shortSide * 0.16}
      title={timeline.songTitle}
    />
  );
}
