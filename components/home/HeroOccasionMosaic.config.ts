export type HeroOccasionDirection = "up" | "down";

export type HeroOccasionTile = {
  src: string;
  heightClass: string;
};

export type HeroOccasionColumn = {
  id: string;
  direction: HeroOccasionDirection;
  tiles: HeroOccasionTile[];
};

export const heroOccasionSources = [
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

const tileHeightClasses = [
  "h-24 sm:h-32 lg:h-40 2xl:h-44",
  "h-32 sm:h-40 lg:h-52 2xl:h-56",
  "h-40 sm:h-52 lg:h-64 2xl:h-72",
  "h-28 sm:h-36 lg:h-48 2xl:h-52",
] as const;

const makeColumn = (
  id: string,
  direction: HeroOccasionDirection,
  startIndex: number,
): HeroOccasionColumn => ({
  id,
  direction,
  tiles: Array.from({ length: 10 }, (_, index) => ({
    src: heroOccasionSources[(startIndex + index) % heroOccasionSources.length],
    heightClass: tileHeightClasses[(startIndex + index) % tileHeightClasses.length],
  })),
});

export const heroOccasionColumns = [
  makeColumn("hero-column-1", "up", 0),
  makeColumn("hero-column-2", "down", 3),
  makeColumn("hero-column-3", "up", 6),
  makeColumn("hero-column-4", "down", 9),
  makeColumn("hero-column-5", "up", 12),
  makeColumn("hero-column-6", "down", 15),
  makeColumn("hero-column-7", "up", 2),
  makeColumn("hero-column-8", "down", 5),
] satisfies HeroOccasionColumn[];
