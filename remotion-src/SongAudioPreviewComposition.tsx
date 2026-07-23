import { Audio } from "remotion";

import type { SongAudioPreviewProps } from "../lib/music-video/song-audio-preview";

export function SongAudioPreviewComposition({
  audioUrl,
}: SongAudioPreviewProps) {
  return <Audio src={audioUrl} />;
}
