import {
  PhotoSlideshowComposition,
  type PhotoSlideshowCompositionProps,
} from "./PhotoSlideshowComposition";
import { MinimalVinylComposition } from "./MinimalVinylComposition";

export type MusicVideoCompositionProps = PhotoSlideshowCompositionProps;

export function MusicVideoComposition({ timeline }: MusicVideoCompositionProps) {
  if (timeline.templateId === "minimal-vinyl") {
    return <MinimalVinylComposition timeline={timeline} />;
  }

  return <PhotoSlideshowComposition timeline={timeline} />;
}
