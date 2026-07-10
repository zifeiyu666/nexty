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
  "/occasion-generated/avif/01-just-because.avif",
  "/occasion-generated/avif/02-anniversary.avif",
  "/occasion-generated/avif/03-wedding.avif",
  "/occasion-generated/avif/04-birthday.avif",
  "/occasion-generated/avif/05-mothers-day-mom.avif",
  "/occasion-generated/avif/06-fathers-day.avif",
  "/occasion-generated/avif/07-christmas-holidays.avif",
  "/occasion-generated/avif/08-proposal.avif",
  "/occasion-generated/avif/09-mitzvah-coming-of-age.avif",
  "/occasion-generated/avif/10-graduation.avif",
  "/occasion-generated/avif/11-coworker-appreciation.avif",
  "/occasion-generated/avif/12-moving-goodbye.avif",
  "/occasion-generated/avif/13-reconciliation-healing.avif",
  "/occasion-generated/avif/14-sweetest-day.avif",
  "/occasion-generated/avif/15-adoption-baby-on-the-way.avif",
  "/occasion-generated/avif/17-mothers-day-wife-mom.avif",
  "/occasion-generated/avif/18-deployment-long-distance.avif",
  "/occasion-generated/avif/19-memorial.avif",
  "/occasion-generated/avif/20-valentines-day.avif",
  "/occasion-generated/avif/21-vow-renewal.avif",
  "/occasion-generated/avif/23-apology.avif",
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
