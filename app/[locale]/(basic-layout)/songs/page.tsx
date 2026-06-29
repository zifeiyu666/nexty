import { MusicLibraryCard } from "@/components/song/MusicLibraryCard";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Link, Locale } from "@/i18n/routing";
import { getFinalSongsForOwner, type FinalSong } from "@/lib/ai/final-song";
import { getSession } from "@/lib/auth/server";
import { constructMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";
import { Library, Search, Share2 } from "lucide-react";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

type Params = Promise<{ locale: string }>;
type SearchParams = Promise<{ q?: string; occasion?: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Songs" });

  return constructMetadata({
    title: t("meta.title"),
    description: t("meta.description"),
    locale: locale as Locale,
    path: "/songs",
    noIndex: true,
  });
}

function labelize(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatCreatedAt(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getRecipients(song: FinalSong): string[] {
  if (!Array.isArray(song.recipientNamesJsonb)) return [];

  return song.recipientNamesJsonb.filter(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0,
  );
}

function filterSongs(
  songs: FinalSong[],
  {
    occasion,
    query,
  }: {
    occasion: string;
    query: string;
  },
): FinalSong[] {
  const normalizedQuery = query.trim().toLowerCase();

  return songs.filter((song) => {
    const recipients = getRecipients(song).join(" ").toLowerCase();
    const matchesOccasion =
      occasion === "all" || song.occasion.toLowerCase() === occasion;
    const matchesQuery =
      !normalizedQuery ||
      song.title.toLowerCase().includes(normalizedQuery) ||
      song.genre.toLowerCase().includes(normalizedQuery) ||
      song.occasion.toLowerCase().includes(normalizedQuery) ||
      recipients.includes(normalizedQuery);

    return matchesOccasion && matchesQuery;
  });
}

type SongCardLabels = {
  created: (date: string) => string;
  createdFor: (names: string) => string;
};

function SongCard({
  labels,
  locale,
  song,
}: {
  labels: SongCardLabels;
  locale: string;
  song: FinalSong;
}) {
  const recipients = getRecipients(song);

  return (
    <Link
      className="block h-full rounded-lg outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
      href={`/songs/${song.id}`}
    >
      <MusicLibraryCard
        createdFor={
          recipients.length ? labels.createdFor(recipients.join(" and ")) : null
        }
        createdText={labels.created(formatCreatedAt(song.createdAt, locale))}
        imageAlt={song.title}
        imageUrl={song.imageUrl}
        title={song.title}
      />
    </Link>
  );
}

export default async function SongsPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Songs" });
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }

  const { q = "", occasion = "all" } = await searchParams;
  const songs = await getFinalSongsForOwner(session.user.id);
  const filteredSongs = filterSongs(songs, { occasion, query: q });
  const occasions = [
    "all",
    ...Array.from(new Set(songs.map((song) => song.occasion.toLowerCase()))),
  ];
  const cardLabels: SongCardLabels = {
    created: (date) => t("card.created", { date }),
    createdFor: (names) => t("card.createdFor", { names }),
  };
  const formAction = locale === "en" ? "/songs" : `/${locale}/songs`;

  return (
    <main className="min-h-screen w-full bg-[#fbfaf7] text-foreground">
      <section className="w-full bg-[#f3eadf]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="max-w-4xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-black uppercase text-primary shadow-sm">
              <Library className="size-4" />
              {t("hero.badge")}
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.96] tracking-normal text-stone-950 md:text-7xl">
              {t("hero.title")}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-700">
              {t("hero.description")}
            </p>
          </div>
        </div>
      </section>

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
                href={`/songs?occasion=${value}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              >
                {value === "all" ? t("filters.all") : labelize(value)}
              </Link>
            ))}
          </div>

          <form
            action={formAction}
            className="relative w-full max-w-xs sm:w-80"
          >
            {occasion !== "all" && (
              <input name="occasion" type="hidden" value={occasion} />
            )}
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              className="h-10 w-full rounded-full bg-white pl-9 pr-4 text-sm font-medium outline-none shadow-[0_10px_30px_rgba(28,25,23,0.10)] transition placeholder:text-muted-foreground focus:ring-4 focus:ring-primary/10"
              defaultValue={q}
              name="q"
              placeholder={t("filters.searchPlaceholder")}
            />
          </form>
        </div>

        {filteredSongs.length ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredSongs.map((song) => (
              <SongCard
                key={song.id}
                labels={cardLabels}
                locale={locale}
                song={song}
              />
            ))}
          </div>
        ) : (
          <Empty className="mt-8 min-h-[360px] border border-dashed border-border bg-white">
            <EmptyHeader>
              <EmptyMedia
                className="size-14 rounded-full bg-primary/10 text-primary"
                variant="icon"
              >
                <Share2 className="size-6" />
              </EmptyMedia>
              <EmptyTitle>
                {songs.length
                  ? t("empty.noMatches.title")
                  : t("empty.noSongs.title")}
              </EmptyTitle>
              <EmptyDescription>
                {songs.length
                  ? t("empty.noMatches.description")
                  : t("empty.noSongs.description")}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild className="rounded-full">
                  <Link href="/create-song">{t("empty.create")}</Link>
                </Button>
                <Button asChild className="rounded-full" variant="outline">
                  <Link href="/samples">{t("empty.samples")}</Link>
                </Button>
              </div>
            </EmptyContent>
          </Empty>
        )}
      </section>
    </main>
  );
}
