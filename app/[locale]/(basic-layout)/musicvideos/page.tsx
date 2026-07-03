import { Button } from "@/components/ui/button";
import { Link, Locale } from "@/i18n/routing";
import { getSession } from "@/lib/auth/server";
import { listMusicVideosWithSongsForUser } from "@/lib/music-video/renders";
import { constructMetadata } from "@/lib/metadata";
import { Film, Plus, Sparkles, Video } from "lucide-react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { MusicVideosList } from "./MusicVideosList";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale } = await params;

  return constructMetadata({
    title: "Music Videos",
    description: "Browse every generated music video version for your songs.",
    locale: locale as Locale,
    path: "/musicvideos",
    noIndex: true,
  });
}

export default async function MusicVideosPage({ params }: { params: Params }) {
  const { locale } = await params;
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const videos = await listMusicVideosWithSongsForUser({
    userId: session.user.id,
  });
  const completedCount = videos.filter(
    ({ musicVideo }) => musicVideo.status === "completed",
  ).length;

  return (
    <main className="min-h-screen w-full bg-[#fbfaf7] text-foreground">
      <section className="w-full border-b border-black/5 bg-[#f3eadf]">
        <div className="w-full px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-black uppercase text-primary shadow-sm">
                <Video className="size-4" />
                Music Videos
              </p>
              <h1 className="mt-6 max-w-5xl text-5xl font-black leading-[0.96] tracking-normal text-stone-950 md:text-7xl">
                Generated MV Versions
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-stone-700">
                Browse every rendered music video, preview completed exports,
                and jump back to the source song when you want to create another
                version.
              </p>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white/70 p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-stone-500">
                    Total videos
                  </p>
                  <p className="mt-1 text-5xl font-black text-stone-950">
                    {videos.length}
                  </p>
                </div>
                <div className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Sparkles className="size-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm font-bold text-stone-600">
                <Film className="size-4 text-primary" />
                {completedCount} completed exports
              </div>
              <Button asChild className="mt-5 w-full rounded-full">
                <Link href="/songs">
                  <Plus className="size-4" />
                  Create from a song
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <MusicVideosList
        createLabel="Create from a song"
        emptyDescription="Open a finalized song, bind photos to the lyrics, and generate a vertical MV. Every render will appear here as its own version."
        emptyTitle="No music videos yet"
        items={videos.map(({ musicVideo, song }) => ({
          createdAt: musicVideo.createdAt.toISOString(),
          id: musicVideo.id,
          imageUrl: song.imageUrl,
          songId: song.id,
          songTitle: song.title,
          status: musicVideo.status,
          temporaryVideoUrl: musicVideo.temporaryVideoUrl,
          title: musicVideo.title,
          videoUrl: musicVideo.videoUrl,
        }))}
        locale={locale}
        noMatchesDescription="Try a different title keyword or clear the search field to see every generated version."
        noMatchesTitle="No matching videos"
        searchPlaceholder="Search by video title"
      />
    </main>
  );
}
