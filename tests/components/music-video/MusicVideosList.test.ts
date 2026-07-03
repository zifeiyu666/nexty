import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

import {
  filterMusicVideosByTitle,
  type MusicVideoListItem,
} from "@/app/[locale]/(basic-layout)/musicvideos/MusicVideosList";

const videos: MusicVideoListItem[] = [
  {
    createdAt: "2026-06-01T10:00:00.000Z",
    id: "mv-1",
    imageUrl: null,
    songId: "song-1",
    songTitle: "Birthday Ballad",
    status: "completed",
    temporaryVideoUrl: null,
    title: "Golden Birthday MV",
    videoUrl: "https://cdn.example.com/golden.mp4",
  },
  {
    createdAt: "2026-06-02T10:00:00.000Z",
    id: "mv-2",
    imageUrl: null,
    songId: "song-2",
    songTitle: "Golden Song Title",
    status: "completed",
    temporaryVideoUrl: "https://remotion.example.com/midnight.mp4",
    title: "Midnight Reel",
    videoUrl: null,
  },
];

describe("MusicVideosList", () => {
  test("filters music videos by title on the client", () => {
    assert.deepEqual(
      filterMusicVideosByTitle(videos, "golden").map((video) => video.id),
      ["mv-1"],
    );
  });

  test("keeps empty searches showing every music video", () => {
    assert.deepEqual(
      filterMusicVideosByTitle(videos, "   ").map((video) => video.id),
      ["mv-1", "mv-2"],
    );
  });

  test("musicvideos page delegates the gallery to a client list", () => {
    const source = readFileSync(
      join(process.cwd(), "app/[locale]/(basic-layout)/musicvideos/page.tsx"),
      "utf8",
    );

    assert.match(source, /<MusicVideosList/);
    assert.match(source, /items=\{videos\.map/);
  });
});
