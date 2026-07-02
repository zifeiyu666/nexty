import { Composition } from "remotion";
import {
  MusicVideoComposition,
  type MusicVideoCompositionProps,
} from "./MusicVideoComposition";
import {
  PHOTO_SLIDESHOW_COMPOSITION_ID,
  PHOTO_SLIDESHOW_FPS,
  PHOTO_SLIDESHOW_HEIGHT,
  PHOTO_SLIDESHOW_WIDTH,
} from "../lib/music-video/remotion-constants";

export function RemotionRoot() {
  return (
    <Composition
      component={MusicVideoComposition}
      defaultProps={{
        timeline: {
          assignments: [],
          audioUrl: "",
          duration: 30,
          height: PHOTO_SLIDESHOW_HEIGHT,
          lyrics: [{ id: "cue-1", start: 0, end: 30, text: "Instrumental" }],
          photos: [],
          songTitle: "Music Video",
          templateId: "photo-slideshow",
          transitions: [],
          width: PHOTO_SLIDESHOW_WIDTH,
        },
      }}
      durationInFrames={PHOTO_SLIDESHOW_FPS * 30}
      fps={PHOTO_SLIDESHOW_FPS}
      height={PHOTO_SLIDESHOW_HEIGHT}
      id={PHOTO_SLIDESHOW_COMPOSITION_ID}
      width={PHOTO_SLIDESHOW_WIDTH}
      calculateMetadata={({ props }: { props: MusicVideoCompositionProps }) => ({
        durationInFrames: Math.max(
          PHOTO_SLIDESHOW_FPS,
          Math.ceil((props.timeline.duration || 30) * PHOTO_SLIDESHOW_FPS),
        ),
        height: props.timeline.height || PHOTO_SLIDESHOW_HEIGHT,
        width: props.timeline.width || PHOTO_SLIDESHOW_WIDTH,
      })}
    />
  );
}
