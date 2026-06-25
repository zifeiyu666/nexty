export type DiagonalTrackDirection = "forward" | "reverse";

export type DiagonalCounterflowTrack = {
  id: string;
  direction: DiagonalTrackDirection;
  images: string[];
};

export const occasionImageSources = [
  "/occasion/imgi_10_1668110169.jpg",
  "/occasion/imgi_15_1683057771.jpg",
  "/occasion/imgi_20_1683057969.jpg",
  "/occasion/imgi_24_1683057708.jpg",
  "/occasion/imgi_28_1699547010.jpg",
  "/occasion/imgi_33_1683057071.jpg",
  "/occasion/imgi_38_1683057448.jpg",
  "/occasion/imgi_43_1683057420.jpg",
  "/occasion/imgi_50_1668109216.jpg",
  "/occasion/imgi_54_1668110326.jpg",
  "/occasion/imgi_58_1683056937.jpg",
  "/occasion/imgi_66_1668110312.jpg",
  "/occasion/imgi_7_1683057809.jpg",
  "/occasion/imgi_17_1668109235.jpg",
  "/occasion/imgi_30_1699546975.jpg",
  "/occasion/imgi_52_1683056806.jpg",
  "/occasion/imgi_56_1683056976.jpg",
  "/occasion/imgi_69_1691174300.jpg",
] as const;

const makeTrack = (
  id: string,
  direction: DiagonalTrackDirection,
  startIndex: number,
): DiagonalCounterflowTrack => ({
  id,
  direction,
  images: Array.from({ length: 12 }, (_, index) => {
    return occasionImageSources[(startIndex + index) % occasionImageSources.length];
  }),
});

export const diagonalCounterflowTracks = [
  makeTrack("upper", "forward", 0),
  makeTrack("middle", "reverse", 5),
  makeTrack("lower", "forward", 10),
] satisfies DiagonalCounterflowTrack[];
