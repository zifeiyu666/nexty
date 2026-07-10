import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/routing";
import {
  getFeaturedPlaylists,
  getPlaylistsByDimension,
  playlistDimensions,
} from "@/lib/playlists/catalog";
import { Gift, ListMusic, Search, Sparkles } from "lucide-react";

import { PlaylistCard } from "./PlaylistCard";

export function PlaylistsHubPage() {
  const featured = getFeaturedPlaylists();
  const occasions = getPlaylistsByDimension("occasion");
  const recipients = getPlaylistsByDimension("recipient");
  const styles = getPlaylistsByDimension("style");

  return (
    <main className="min-h-screen w-full bg-[#fbfaf7] text-stone-950">
      <section className="relative overflow-hidden bg-[#efe3d4]">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end lg:py-18">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-primary shadow-sm">
              <ListMusic className="size-4" />
              Playlist gift ideas
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.96] tracking-normal md:text-7xl">
              Gift Playlist Ideas for Every Person, Occasion, and Style
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700">
              Browse birthday playlists, anniversary songs, songs for mom, songs
              for dad, romantic ideas for your wife, and style-led playlist
              gifts with a custom song at the center.
            </p>

            <div className="mt-7 flex max-w-xl items-center gap-2 rounded-full bg-white p-2 shadow-[0_18px_50px_rgba(41,37,36,0.12)]">
              <Search className="ml-3 size-4 shrink-0 text-stone-500" />
              <Input
                aria-label="Search playlist ideas"
                className="h-10 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
                placeholder="Search mom, anniversary, country, birthday..."
                readOnly
              />
              <Button asChild className="rounded-full bg-stone-950 hover:bg-stone-800">
                <Link href="#featured-playlists">Explore</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-lg bg-stone-950 p-5 text-white shadow-[0_24px_80px_rgba(41,37,36,0.28)]">
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-amber-200">
              <Sparkles className="size-4" />
              Make it personal
            </p>
            <p className="mt-4 text-3xl font-black leading-tight">
              Add one song no playlist platform can already have.
            </p>
            <p className="mt-4 text-sm leading-6 text-stone-300">
              Each guide includes familiar song ideas plus a place for a custom
              One Custom Song track built from names, memories, and the moment
              you want to mark.
            </p>
            <Button asChild className="mt-5 rounded-full bg-white text-stone-950 hover:bg-amber-100">
              <Link href="/create-song">Create a custom song</Link>
            </Button>
          </div>
        </div>
      </section>

      <section
        className="mx-auto max-w-6xl px-4 py-12 sm:px-6"
        id="featured-playlists"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-primary">
              <Gift className="size-4" />
              Featured playlists
            </p>
            <h2 className="mt-2 text-4xl font-black tracking-normal">
              Start with the gift moment.
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(playlistDimensions).map(([key, dimension]) => (
              <Button
                asChild
                className="rounded-full"
                key={key}
                variant="outline"
              >
                <Link href={dimension.path}>{dimension.title.replace("Playlist Ideas by ", "")}</Link>
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((playlist) => (
            <PlaylistCard key={playlist.slug} playlist={playlist} />
          ))}
        </div>
      </section>

      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-7 px-4 py-12 sm:px-6 lg:grid-cols-3">
          <PlaylistMiniColumn
            description={playlistDimensions.occasion.description}
            href={playlistDimensions.occasion.path}
            playlists={occasions}
            title="By occasion"
          />
          <PlaylistMiniColumn
            description={playlistDimensions.recipient.description}
            href={playlistDimensions.recipient.path}
            playlists={recipients}
            title="By recipient"
          />
          <PlaylistMiniColumn
            description={playlistDimensions.style.description}
            href={playlistDimensions.style.path}
            playlists={styles}
            title="By style"
          />
        </div>
      </section>
    </main>
  );
}

function PlaylistMiniColumn({
  description,
  href,
  playlists,
  title,
}: {
  description: string;
  href: string;
  playlists: ReturnType<typeof getFeaturedPlaylists>;
  title: string;
}) {
  return (
    <div>
      <h2 className="text-2xl font-black">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
      <div className="mt-5 space-y-2">
        {playlists.map((playlist) => (
          <Link
            className="flex items-center justify-between rounded-lg border border-stone-200 bg-[#fbfaf7] px-4 py-3 text-sm font-bold transition hover:border-primary/30 hover:bg-primary/5"
            href={playlist.canonicalPath}
            key={playlist.slug}
          >
            {playlist.shortTitle}
            <span className="text-xs font-semibold text-stone-500">
              {playlist.songCountLabel}
            </span>
          </Link>
        ))}
      </div>
      <Button asChild className="mt-5 rounded-full" variant="outline">
        <Link href={href}>Browse all</Link>
      </Button>
    </div>
  );
}
