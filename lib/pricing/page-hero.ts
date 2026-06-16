type PricingSearchParams = Record<string, string | string[] | undefined>;

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function shouldHidePricingHero(searchParams: PricingSearchParams) {
  return (
    getSingleParam(searchParams.type) === "unlock_song" &&
    Boolean(getSingleParam(searchParams.songId))
  );
}
