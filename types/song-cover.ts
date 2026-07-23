export const SONG_COVER_STYLES = [
  "heirloom-storybook",
  "hand-painted-gouache",
  "cinematic-keepsake",
  "editorial-collage",
  "pressed-botanical",
  "paper-cut-craft",
  "dreamy-watercolor",
  "vintage-photo-album",
] as const;

export type SongCoverStyle = (typeof SONG_COVER_STYLES)[number];

export type SongCoverArtDirection = {
  style: SongCoverStyle;
  styleDescription: string;
  subject: string;
  mood: string;
  palette: string;
  lighting: string;
  composition: string;
  giftFeeling: string;
};
