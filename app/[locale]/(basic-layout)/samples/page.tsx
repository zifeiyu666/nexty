import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHero } from "@/components/shared/PageHero";
import { SamplesGrid } from "@/components/song/SamplesGrid";
import { Link, Locale } from "@/i18n/routing";
import { getUserBenefits } from "@/actions/usage/benefits";
import { songSampleStore } from "@/lib/ai/song-sample-store";
import { getSession } from "@/lib/auth/server";
import { constructMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";
import { Library, Search } from "lucide-react";
import { Metadata } from "next";

type Params = Promise<{ locale: string }>;
type SearchParams = Promise<{ q?: string; occasion?: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale } = await params;

  return constructMetadata({
    title: "Your Song Samples",
    description:
      "Browse your generated song samples and choose your favorite version.",
    locale: locale as Locale,
    path: "/samples",
    noIndex: true,
  });
}

function labelize(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function SamplesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getSession();
  const { q = "", occasion = "all" } = await searchParams;
  const benefits = session?.user?.id
    ? await getUserBenefits(session.user.id)
    : null;
  const hasActiveSubscription =
    benefits?.subscriptionStatus === "active" ||
    benefits?.subscriptionStatus === "trialing";
  const samples = await songSampleStore.list({
    userId: session?.user?.id,
    hasActiveSubscription,
  });
  const sampleOccasions = Array.from(
    new Set(samples.map((sample) => sample.occasion.toLowerCase())),
  );
  const filteredSamples = samples.filter((sample) => {
    const matchesOccasion =
      occasion === "all" || sample.occasion.toLowerCase() === occasion;
    const query = q.trim().toLowerCase();
    const matchesQuery =
      !query ||
      sample.title.toLowerCase().includes(query) ||
      sample.occasion.toLowerCase().includes(query) ||
      sample.recipientNames.join(" ").toLowerCase().includes(query);
    return matchesOccasion && matchesQuery;
  });
  const occasions = [
    "all",
    ...(sampleOccasions.length
      ? sampleOccasions
      : [
          "birthday",
          "anniversary",
          "mothers-day",
          "just-because",
          "thank-you",
        ]),
  ];

  return (
    <main className="min-h-screen w-full bg-[#fbfaf7] text-foreground">
      <PageHero
        badge={{
          icon: <Library className="size-4" />,
          label: "Sample library",
        }}
        description={
          <>
            Every generated song lands here first. Subscribers keep samples
            permanently; guests and non-subscribers can unlock within{" "}
            <strong className="text-stone-950">72 hours</strong>.
          </>
        }
        titleLines={["Your samples, ready to choose"]}
      />

      <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
            {occasions.map((value) => (
              <Link
                key={value}
                className={cn(
                  "inline-flex h-8 items-center whitespace-nowrap rounded-full px-3.5 text-sm font-normal transition",
                  occasion === value
                    ? "bg-stone-950 text-white"
                    : "bg-white text-muted-foreground shadow-sm hover:text-foreground",
                )}
                href={`/samples?occasion=${value}`}
              >
                {value === "all" ? "All samples" : labelize(value)}
              </Link>
            ))}
          </div>

          <form action="/samples" className="relative w-full max-w-xs sm:w-80">
            {occasion !== "all" && (
              <input name="occasion" type="hidden" value={occasion} />
            )}
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-10 rounded-full border-0 bg-white pl-9 pr-4 text-sm font-medium outline-none shadow-[0_10px_30px_rgba(28,25,23,0.10)] transition placeholder:text-muted-foreground focus-visible:ring-4 focus-visible:ring-primary/10"
              defaultValue={q}
              name="q"
              placeholder="Search title, occasion, recipient"
            />
          </form>
        </div>

        <SamplesGrid samples={filteredSamples} />

        {!filteredSamples.length && (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <h2 className="text-xl font-black text-foreground">
              No samples yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Create a song sample first, then it will appear here for your
              sample library.
            </p>
            <Button asChild className="mt-5 rounded-full">
              <Link href="/create-song">Create a sample</Link>
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}
