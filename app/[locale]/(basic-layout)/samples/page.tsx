import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Locale } from "@/i18n/routing";
import { songSampleStore } from "@/lib/ai/song-sample-store";
import { getSession } from "@/lib/auth/server";
import { constructMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";
import {
    ArrowRight,
    Calendar,
    Clock3,
    Gift,
    LockKeyhole,
    Search,
    Trash2,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

type Params = Promise<{ locale: string }>;
type SearchParams = Promise<{ email?: string; q?: string; occasion?: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale } = await params;

  return constructMetadata({
    title: "Your Song Samples",
    description:
      "Browse your generated song samples and unlock them within 3 days.",
    locale: locale as Locale,
    path: "/samples",
  });
}

function labelize(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function artworkName(names: string[]): string {
  return names.length ? `for ${names.join(" and ")}` : "for you";
}

export default async function SamplesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getSession();
  const { email = "", q = "", occasion = "all" } = await searchParams;
  const samples = await songSampleStore.list({
    userId: session?.user?.id,
    email: session?.user?.email || email,
  });
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
    ["all", "All"],
    ["birthday", "Birthday"],
    ["anniversary", "Anniversary"],
    ["mothers-day", "Mother's Day"],
    ["just-because", "Just because"],
    ["thank-you", "Thank you"],
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6">
        <div className="max-w-4xl">
          <h1 className="font-serif text-5xl font-black leading-[0.94] tracking-normal text-primary md:text-7xl">
            Your samples, ready to unlock
          </h1>
          <p className="mt-5 max-w-3xl text-xl leading-8 text-muted-foreground md:text-2xl md:leading-10">
            Previews of the songs you&apos;ve created. Unlock within{" "}
            <strong className="text-foreground">72 hours</strong> to download,
            share, and turn them into a video gift.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-primary/5 p-5">
          <div className="flex gap-3">
            <Clock3 className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <h2 className="text-base font-black text-foreground">
                3-Day Access Window
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                You have 3 days to unlock each sample after creation. After
                that, samples become subscriber-only.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-9 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {occasions.map(([value, label]) => (
              <Link
                key={value}
                className={cn(
                  "rounded-full px-5 py-3 text-sm font-black transition",
                  occasion === value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
                href={`/samples?occasion=${value}${email ? `&email=${encodeURIComponent(email)}` : ""}`}
              >
                {label}
              </Link>
            ))}
          </div>

          <form className="relative w-full max-w-md" action="/samples">
            {email && <input name="email" type="hidden" value={email} />}
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-12 rounded-full border-border bg-background pl-11 text-base shadow-sm"
              defaultValue={q}
              name="q"
              placeholder="Search by name or occasion"
            />
          </form>
        </div>

        {!session?.user && !email && (
          <form className="mt-8 max-w-xl rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm font-bold text-foreground">
              Find guest samples by email
            </p>
            <div className="mt-3 flex gap-2">
              <Input
                className="h-11 rounded-full"
                name="email"
                placeholder="you@example.com"
                type="email"
              />
              <Button className="h-11 rounded-full px-5" type="submit">
                Search
              </Button>
            </div>
          </form>
        )}

        <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredSamples.map((sample) => (
            <article
              key={sample.songId}
              className={cn(
                "overflow-hidden rounded-2xl border border-border bg-card shadow-sm",
                sample.isExpired && "opacity-55"
              )}
            >
              <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary/80 to-accent">
                <div className="absolute -right-20 -top-16 size-56 rounded-full bg-primary-foreground/20" />
                <div className="absolute -bottom-16 -left-16 size-44 rounded-full bg-foreground/15" />
                <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-primary/75 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-primary-foreground">
                  <LockKeyhole className="size-3.5" />
                  Sample
                </span>
                <p className="relative max-w-[70%] rotate-[-4deg] text-center font-[cursive] text-3xl text-primary-foreground">
                  {artworkName(sample.recipientNames)}
                </p>
                <span className="absolute bottom-4 right-4 rounded-full bg-primary/75 px-3 py-1.5 text-xs font-black text-primary-foreground">
                  1:00 preview
                </span>
              </div>

              <div className="p-5">
                <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-primary">
                  <Gift className="size-4" />
                  {labelize(sample.occasion)}
                </p>
                <h2 className="mt-3 line-clamp-2 text-2xl font-black leading-tight text-foreground">
                  {sample.title}
                </h2>
                <p className="mt-3 text-base text-muted-foreground">
                  Written for{" "}
                  <strong className="text-foreground">
                    {sample.recipientNames.join(" and ") || "someone special"}
                  </strong>
                </p>
                <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="size-4" />
                  Created {new Date(sample.createdAt).toLocaleDateString()}
                </p>
                {sample.isExpired && (
                  <p className="mt-3 rounded-xl bg-muted px-3 py-2 text-sm font-semibold text-muted-foreground">
                    Expired. Recreate from form data to generate again.
                  </p>
                )}
              </div>

              {/* version choose buttons removed from list view; keep selection on detail page */}

              <div className="flex items-center gap-3 border-t border-border p-4">
                <Button
                  asChild
                  className="h-11 flex-1 rounded-full bg-primary text-sm font-black text-primary-foreground hover:bg-primary/90"
                >
                  <Link href={`/samples/${sample.songId}`}>
                    View details
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  className="size-11 rounded-full text-muted-foreground"
                  type="button"
                  variant="ghost"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </article>
          ))}
        </div>

        {!filteredSamples.length && (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <h2 className="text-xl font-black text-foreground">
              No samples yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Create a song sample first, then it will appear here for your
              3-day access window.
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
