import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import {
  type PlaylistDimension,
  getPlaylistsByDimension,
  playlistDimensions,
} from "@/lib/playlists/catalog";
import { ArrowLeft, Tags } from "lucide-react";

import { PlaylistCard } from "./PlaylistCard";

export function PlaylistDirectoryPage({
  dimension,
}: {
  dimension: PlaylistDimension;
}) {
  const config = playlistDimensions[dimension];
  const playlists = getPlaylistsByDimension(dimension);

  return (
    <main className="min-h-screen w-full bg-[#fbfaf7] text-stone-950">
      <section className="bg-[#efe3d4]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
          <Button asChild className="rounded-full bg-white text-stone-950 hover:bg-white/80" size="sm">
            <Link href="/playlists">
              <ArrowLeft className="size-4" />
              All playlists
            </Link>
          </Button>
          <p className="mt-7 inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-primary shadow-sm">
            <Tags className="size-4" />
            {config.keywords.join(" · ")}
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.96] tracking-normal md:text-7xl">
            {config.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700">
            {config.description}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist.slug} playlist={playlist} />
          ))}
        </div>
      </section>
    </main>
  );
}
