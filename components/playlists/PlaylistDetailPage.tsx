import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import {
  type GiftPlaylist,
  getRelatedPlaylists,
  playlistDimensions,
} from "@/lib/playlists/catalog";
import {
  ArrowLeft,
  CheckCircle2,
  Gift,
  ListMusic,
  Music2,
  Search,
  Sparkles,
} from "lucide-react";
import Image from "next/image";

import { PlaylistCard } from "./PlaylistCard";
import { PlaylistPlayButton } from "./PlaylistPlayButton";

export function PlaylistDetailPage({
  playlist,
}: {
  playlist: GiftPlaylist;
}) {
  const related = getRelatedPlaylists(playlist);
  const dimension = playlistDimensions[playlist.dimension];
  const ctaInsertIndex = Math.min(4, Math.max(1, playlist.tracks.length - 1));

  return (
    <main className="min-h-screen w-full bg-[#fbfaf7] text-stone-950">
      <section className="bg-[#efe3d4]">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end lg:py-14">
          <div>
            <Button
              asChild
              className="rounded-full bg-white text-stone-950 hover:bg-white/80"
              size="sm"
            >
              <Link href={dimension.path}>
                <ArrowLeft className="size-4" />
                {dimension.title}
              </Link>
            </Button>
            <p className="mt-7 inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-primary shadow-sm">
              <ListMusic className="size-4" />
              {playlist.eyebrow}
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.96] tracking-normal md:text-7xl">
              {playlist.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700">
              {playlist.intro}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[playlist.primaryKeyword, ...playlist.secondaryKeywords].map(
                (keyword) => (
                  <Badge
                    className="border-stone-300 bg-white/70 px-3 py-1 text-stone-800"
                    key={keyword}
                    variant="outline"
                  >
                    {keyword}
                  </Badge>
                ),
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow-[0_24px_80px_rgba(41,37,36,0.18)]">
            <div className="relative aspect-[4/3]">
              <Image
                alt={playlist.shortTitle}
                className="object-cover"
                fill
                priority
                sizes="(min-width: 1024px) 420px, 100vw"
                src={playlist.image}
              />
            </div>
            <div className="p-5">
              <div className="grid gap-3 text-sm text-stone-700">
                <InfoRow label="Best for" value={playlist.audience} />
                <InfoRow label="Mood" value={playlist.mood} />
                <InfoRow label="Ideas" value={playlist.songCountLabel} />
              </div>
              <Button
                asChild
                className="mt-5 w-full rounded-full bg-stone-950 hover:bg-stone-800"
              >
                <Link href={playlist.createHref}>Create a custom song for this playlist</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-primary">
                <Music2 className="size-4" />
                Playlist song ideas
              </p>
              <h2 className="mt-2 text-4xl font-black tracking-normal">
                Songs to include in your gift playlist
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
                These are song ideas to help you plan the playlist. Public
                catalog tracks are listed for inspiration and are not playable
                here; the playable audio on this page is the custom song demo
                section.
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-lg bg-white shadow-[0_16px_44px_rgba(41,37,36,0.08)] ring-1 ring-stone-200/70">
            {playlist.tracks.map((track, index) => (
              <div key={`${track.title}-${track.artist}`}>
                <div className="grid gap-4 border-b border-stone-100 p-5 md:grid-cols-[40px_minmax(0,1fr)_180px]">
                  <div className="flex size-10 items-center justify-center rounded-full bg-stone-950 text-sm font-black text-white">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-stone-950">
                      {track.title}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-stone-500">
                      {track.artist}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-stone-700">
                      {track.reason}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 md:block md:space-y-2">
                    <Badge
                      className="bg-stone-100 text-stone-700"
                      variant="secondary"
                    >
                      {track.mood}
                    </Badge>
                    <Badge
                      className="bg-primary/10 text-primary"
                      variant="secondary"
                    >
                      {track.moment}
                    </Badge>
                  </div>
                </div>
                {index + 1 === ctaInsertIndex && (
                  <CustomSongInsert playlist={playlist} />
                )}
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg bg-stone-950 p-5 text-white shadow-[0_18px_54px_rgba(41,37,36,0.2)]">
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-amber-200">
              <Gift className="size-4" />
              One Custom Song
            </p>
            <h2 className="mt-3 text-2xl font-black leading-tight">
              Make it personal with one original track.
            </h2>
            <p className="mt-3 text-sm leading-6 text-stone-300">
              Add a custom song to this playlist so the gift includes names,
              memories, and a message no public playlist can match.
            </p>
            <Button
              asChild
              className="mt-5 w-full rounded-full bg-white text-stone-950 hover:bg-amber-100"
            >
              <Link href={playlist.createHref}>Create your custom song</Link>
            </Button>
          </div>

          <div
            className="rounded-lg bg-white p-5 shadow-[0_16px_44px_rgba(41,37,36,0.08)] ring-1 ring-stone-200/70"
            id="custom-song-demos"
          >
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-primary">
              <Sparkles className="size-4" />
              Playable custom song demos
            </p>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              These tracks are One Custom Song demos you can play directly.
            </p>
            <div className="mt-4 space-y-3">
              {playlist.demos.map((demo) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-lg bg-[#fbfaf7] p-3"
                  key={demo.id}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black">{demo.title}</p>
                    <p className="text-xs font-semibold text-stone-500">
                      {demo.style}
                    </p>
                  </div>
                  <PlaylistPlayButton track={demo} />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-primary">
            <CheckCircle2 className="size-4" />
            FAQ
          </p>
          <h2 className="mt-2 text-4xl font-black tracking-normal">
            Playlist gift questions
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {playlist.faqs.map((faq) => (
              <div
                className="rounded-lg border border-stone-200 bg-[#fbfaf7] p-5"
                key={faq.question}
              >
                <h3 className="font-black leading-snug">{faq.question}</h3>
                <p className="mt-3 text-sm leading-6 text-stone-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="text-4xl font-black tracking-normal">
            Related playlist ideas
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <PlaylistCard key={item.slug} playlist={item} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#fbfaf7] px-4 py-3">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-stone-500">
        {label}
      </p>
      <p className="mt-1 font-bold text-stone-950">{value}</p>
    </div>
  );
}

function CustomSongInsert({ playlist }: { playlist: GiftPlaylist }) {
  return (
    <div className="border-b border-stone-100 bg-[#fff7e6] p-5">
      <div className="grid gap-4 rounded-lg border border-amber-200 bg-white p-5 shadow-sm md:grid-cols-[40px_minmax(0,1fr)_auto] md:items-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="size-5" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">
            Make this playlist personal
          </p>
          <h3 className="mt-1 text-xl font-black text-stone-950">
            Add one custom song made from names, memories, and your message.
          </h3>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Use the song ideas around it for context, then make one original
            track the moment they remember.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 md:justify-end">
          <Button asChild className="rounded-full bg-stone-950 hover:bg-stone-800">
            <Link href={playlist.createHref}>Create a custom song</Link>
          </Button>
          <Button asChild className="rounded-full" variant="outline">
            <Link href="#custom-song-demos">
              <Search className="size-4" />
              Hear demos
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
