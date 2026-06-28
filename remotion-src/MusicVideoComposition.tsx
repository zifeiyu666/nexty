import {
  PhotoSlideshowComposition,
  type PhotoSlideshowCompositionProps,
} from "./PhotoSlideshowComposition";
import { MinimalVinylComposition } from "./MinimalVinylComposition";
import { WaveRadioComposition } from "./WaveRadioComposition";

export type MusicVideoCompositionProps = PhotoSlideshowCompositionProps;

export function MusicVideoComposition({ timeline }: MusicVideoCompositionProps) {
  if (timeline.templateId === "minimal-vinyl") {
    return <MinimalVinylComposition timeline={timeline} />;
  }

  if (timeline.templateId === "wave-radio") {
    return <WaveRadioComposition timeline={timeline} />;
  }

  return <PhotoSlideshowComposition timeline={timeline} />;
}
