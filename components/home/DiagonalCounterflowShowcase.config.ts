export type DiagonalTrackDirection = "forward" | "reverse";

export type DiagonalCounterflowTrack = {
  id: string;
  direction: DiagonalTrackDirection;
  images: string[];
};

export const occasionImageSources = [
  "/occasion/imgi_10_1668110169.avif",
  "/occasion/imgi_15_1683057771.avif",
  "/occasion/imgi_20_1683057969.avif",
  "/occasion/imgi_24_1683057708.avif",
  "/occasion/imgi_28_1699547010.avif",
  "/occasion/imgi_33_1683057071.avif",
  "/occasion/imgi_38_1683057448.avif",
  "/occasion/imgi_43_1683057420.avif",
  "/occasion/imgi_50_1668109216.avif",
  "/occasion/imgi_54_1668110326.avif",
  "/occasion/imgi_58_1683056937.avif",
  "/occasion/imgi_66_1668110312.avif",
  "/occasion/imgi_7_1683057809.avif",
  "/occasion/imgi_17_1668109235.avif",
  "/occasion/imgi_30_1699546975.avif",
  "/occasion/imgi_52_1683056806.avif",
  "/occasion/imgi_56_1683056976.avif",
  "/occasion/imgi_69_1691174300.avif",
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
