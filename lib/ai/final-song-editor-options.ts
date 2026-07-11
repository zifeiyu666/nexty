import type { FinalSongPlayerData } from "@/components/song/FinalSongPlayer";
import type { MusicVideoSongOption } from "@/components/song/MusicVideoEditorDrawer";
import type { WallArtSongOption } from "@/components/song/WallArtEditorDrawer";
import {
  buildSongShareUrl,
  type FinalSong,
} from "@/lib/ai/final-song";

export function getTimestampedLyricsFromSongMetadata(
  metadata: unknown,
): FinalSongPlayerData["timestampedLyrics"] {
  if (!metadata || typeof metadata !== "object") return null;
  const timestampedLyrics = (metadata as Record<string, unknown>)
    .timestampedLyrics;
  if (!timestampedLyrics || typeof timestampedLyrics !== "object") return null;
  const alignedWords = (timestampedLyrics as Record<string, unknown>)
    .alignedWords;
  if (!Array.isArray(alignedWords)) return null;

  return {
    alignedWords: alignedWords
      .map((word) => {
        if (!word || typeof word !== "object") return null;
        const record = word as Record<string, unknown>;
        const text = String(record.word ?? "").trim();
        const startS = Number(record.startS);
        const endS = Number(record.endS);
        if (!text || !Number.isFinite(startS) || !Number.isFinite(endS)) {
          return null;
        }
        return { word: text, startS, endS };
      })
      .filter((word): word is { word: string; startS: number; endS: number } =>
        Boolean(word),
      ),
  };
}

export function toMusicVideoSongOption(song: FinalSong): MusicVideoSongOption {
  return {
    id: song.id,
    title: song.title,
    lyrics: song.lyrics,
    timestampedLyrics: getTimestampedLyricsFromSongMetadata(
      song.metadataJsonb,
    ),
    audioUrl: song.audioUrl,
    imageUrl: song.imageUrl,
    duration: song.duration,
    shareUrl: buildSongShareUrl(song),
  };
}

export function toFinalSongPlayerData(song: FinalSong): FinalSongPlayerData {
  return {
    ...toMusicVideoSongOption(song),
    genre: song.genre,
    occasion: song.occasion,
    language: song.language,
    vocalGender: song.vocalGender,
    recipientNames: Array.isArray(song.recipientNamesJsonb)
      ? song.recipientNamesJsonb.filter(
          (value): value is string => typeof value === "string",
        )
      : [],
    story: song.story,
  };
}

export function toWallArtSongOption(song: FinalSong): WallArtSongOption {
  return {
    id: song.id,
    title: song.title,
    lyrics: song.lyrics,
    imageUrl: song.imageUrl,
    shareUrl: buildSongShareUrl(song),
  };
}

export function toMusicVideoSongOptions(
  songs: FinalSong[],
): MusicVideoSongOption[] {
  return songs.map(toMusicVideoSongOption);
}

export function toWallArtSongOptions(songs: FinalSong[]): WallArtSongOption[] {
  return songs.map(toWallArtSongOption);
}
