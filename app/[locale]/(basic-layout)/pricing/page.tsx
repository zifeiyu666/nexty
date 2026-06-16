import { PricingAll } from "@/components/pricing";
import { Locale } from "@/i18n/routing";
import { constructMetadata } from "@/lib/metadata";
import { shouldHidePricingHero } from "@/lib/pricing/page-hero";
import { ChevronRight } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

type Params = Promise<{ locale: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale } = await params;

  return constructMetadata({
    title: "Simple pricing for everyone",
    description:
      "Pay once for a single song, or choose a subscription for monthly songs, MP3 downloads, video gifts, and wall art.",
    locale: locale as Locale,
    path: "/pricing",
  });
}

export default async function PricingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const hideHero = shouldHidePricingHero(resolvedSearchParams);

  return (
    <main className="min-h-screen bg-background text-foreground w-full">
      {!hideHero && (
        <section className="w-full bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8  pb-16 pt-16 ">
            <nav
              aria-label="Breadcrumb"
              className="mb-8 flex items-center gap-2 text-sm font-medium text-muted-foreground"
            >
              <Link className="transition hover:text-foreground" href="/">
                Home
              </Link>
              <ChevronRight className="size-4" />
              <span>Pricing</span>
            </nav>

            <div className="max-w-3xl">
              <h1 className="text-5xl font-black leading-tight tracking-normal text-foreground md:text-6xl">
                Simple pricing for everyone
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                Pay once for a single song, or go Pro or Platinum for monthly
                songs, MP3 downloads, and video styles at a better rate.
              </p>
            </div>
          </div>
        </section>
      )}

      <PricingAll />
    </main>
  );
}
