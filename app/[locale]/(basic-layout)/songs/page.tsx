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
import {
  ArrowRight,
  Calendar,
  Disc3,
  Gift,
  Library,
  Music2,
  Play,
  Plus,
  Search,
  Share2,
  Sparkles,
} from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
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
  });
}

function labelize(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDuration(seconds: number | null, readyLabel: string): string {
  if (!seconds || seconds <= 0) return readyLabel;

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
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
    (value): value is string => typeof value === "string" && value.trim().length > 0
  );
}

function getSongArtworkLabel(song: FinalSong): string {
  const recipients = getRecipients(song);
  if (recipients.length) return recipients.join(" + ");
  return labelize(song.occasion);
}

function filterSongs(
  songs: FinalSong[],
  {
    occasion,
    query,
  }: {
    occasion: string;
    query: string;
  }
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

function SongArtwork({ song }: { song: FinalSong }) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#111827]">
      {song.imageUrl ? (
        <Image
          alt={song.title}
          className="size-full object-cover"
          fill
          sizes="(min-width: 1280px) 156px, (min-width: 640px) 156px, 100vw"
          src={song.imageUrl}
          unoptimized
        />
      ) : (
        <div className="flex size-full items-center justify-center bg-[radial-gradient(circle_at_50%_38%,#fb7185_0_12%,#f97316_13%_22%,#111827_23%_100%)]">
          <Disc3 className="size-24 text-white/80" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
      <div className="absolute left-3 top-3 flex size-10 items-center justify-center rounded-full bg-white/90 text-stone-950 shadow-sm">
        <Play className="ml-0.5 size-4 fill-current" />
      </div>
      <div className="absolute inset-x-3 bottom-3">
        <p className="line-clamp-2 text-lg font-black leading-tight text-white">
          {getSongArtworkLabel(song)}
        </p>
      </div>
    </div>
  );
}

type SongCardLabels = {
  audio: string;
  fallback: string;
  open: string;
  ready: string;
  created: (date: string) => string;
  writtenFor: (names: string) => string;
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
    <article className="group grid gap-4 rounded-2xl border border-border bg-card p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:grid-cols-[156px_1fr]">
      <SongArtwork song={song} />

      <div className="flex min-w-0 flex-col p-1 sm:py-2 sm:pr-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
            <Gift className="size-3.5" />
            {labelize(song.occasion)}
          </span>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
            {formatDuration(song.duration, labels.ready)}
          </span>
        </div>

        <h2 className="mt-4 line-clamp-2 text-2xl font-black leading-tight text-foreground">
          {song.title}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {recipients.length
            ? labels.writtenFor(recipients.join(" and "))
            : labels.fallback}
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-muted-foreground">
          <span className="rounded-full bg-muted px-3 py-1">{song.genre}</span>
          <span className="rounded-full bg-muted px-3 py-1">
            {song.language}
          </span>
          <span className="rounded-full bg-muted px-3 py-1">
            {song.vocalGender}
          </span>
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="size-4" />
            {labels.created(formatCreatedAt(song.createdAt, locale))}
          </p>
          <div className="flex gap-2">
            <Button
              asChild
              className="h-10 rounded-full px-4"
              size="sm"
              variant="outline"
            >
              <a href={song.audioUrl} rel="noreferrer" target="_blank">
                <Music2 className="size-4" />
                {labels.audio}
              </a>
            </Button>
            <Button asChild className="h-10 rounded-full px-4" size="sm">
              <Link href={`/songs/${song.id}`}>
                {labels.open}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
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
    audio: t("card.audio"),
    fallback: t("card.fallback"),
    open: t("card.open"),
    ready: t("duration.ready"),
    created: (date) => t("card.created", { date }),
    writtenFor: (names) => t("card.writtenFor", { names }),
  };
  const formAction = locale === "en" ? "/songs" : `/${locale}/songs`;

  return (
    <main className="min-h-screen w-full bg-[#fbfaf7] text-foreground">
      <section className="w-full border-b border-black/5 bg-[#f3eadf]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-end">
            <div>
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

            <div className="rounded-2xl border border-black/10 bg-white/70 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-stone-500">
                    {t("stats.label")}
                  </p>
                  <p className="mt-1 text-5xl font-black text-stone-950">
                    {songs.length}
                  </p>
                </div>
                <div className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Sparkles className="size-6" />
                </div>
              </div>
              <Button asChild className="mt-5 w-full rounded-full">
                <Link href="/create-song">
                  <Plus className="size-4" />
                  {t("stats.create")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
            {occasions.map((value) => (
              <Link
                key={value}
                className={cn(
                  "whitespace-nowrap rounded-full px-4 py-2 text-sm font-black transition",
                  occasion === value
                    ? "bg-stone-950 text-white"
                    : "bg-white text-muted-foreground shadow-sm hover:text-foreground"
                )}
                href={`/songs?occasion=${value}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              >
                {value === "all" ? t("filters.all") : labelize(value)}
              </Link>
            ))}
          </div>

          <form action={formAction} className="relative w-full max-w-md">
            {occasion !== "all" && (
              <input name="occasion" type="hidden" value={occasion} />
            )}
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="h-12 w-full rounded-full border border-border bg-white pl-11 pr-4 text-base outline-none shadow-sm transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
              defaultValue={q}
              name="q"
              placeholder={t("filters.searchPlaceholder")}
            />
          </form>
        </div>

        {filteredSongs.length ? (
          <div className="mt-8 grid gap-5 xl:grid-cols-2">
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
