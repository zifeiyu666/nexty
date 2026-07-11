import { Button } from "@/components/ui/button";
import { Link, Locale } from "@/i18n/routing";
import { getFinalSongsForOwner } from "@/lib/ai/final-song";
import { toMusicVideoSongOptions } from "@/lib/ai/final-song-editor-options";
import { getSession } from "@/lib/auth/server";
import { constructMetadata } from "@/lib/metadata";
import { ArrowRight, Clapperboard, Film, Music2, Sparkles } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale } = await params;

  return constructMetadata({
    title: locale === "es" ? "Crea un vídeo musical personalizado" : locale === "ja" ? "オリジナルミュージックビデオ作成スタジオ" : "Music Video Studio",
    description: locale === "es"
      ? "Convierte tu canción personalizada en un vídeo con fotos, letras sincronizadas y plantillas de presentación, vinilo o letra dinámica."
      : locale === "ja" ? "オリジナルソングに写真や同期歌詞を加え、スライドショーやレコード風のミュージックビデオを作れます。"
      : "Create a personalized lyric music video from a finalized custom song with photo slideshow, vinyl, and dynamic lyric templates.",
    images: ["/images/features/photo-lyric-mv-template.webp"],
    locale: locale as Locale,
    path: "/music-video-gift-maker",
  });
}

function CreateSongFirstState({ locale }: { locale: string }) {
  const es = locale === "es";
  const ja = locale === "ja";
  return (
    <div className="flex min-h-full items-center justify-center px-5 py-10 text-center">
      <div className="w-full max-w-md">
        <div className="mx-auto flex size-16 items-center justify-center rounded-lg bg-rose-100 text-rose-600 shadow-sm">
          <Music2 className="size-8" />
        </div>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-rose-500">
          {es ? "Estudio de vídeo musical" : ja ? "ミュージックビデオスタジオ" : "Music Video Studio"}
        </p>
        <h2 className="mt-2 text-3xl font-black leading-tight text-stone-950">
          {es ? "Primero crea una canción" : ja ? "まず曲を作成してください" : "Create a song first"}
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-stone-600">
          {es ? "Necesitas una canción terminada, con audio y letra, antes de crear el vídeo." : ja ? "動画を作るには、音声と歌詞がそろった完成済みの曲が必要です。" : "Music Video needs a finalized song with audio and lyrics before the editor can generate a video."}
        </p>
        <Button
          asChild
          className="mt-7 rounded-full bg-rose-500 px-6 font-black text-white shadow-sm shadow-rose-500/20 hover:bg-rose-600"
        >
          <Link href="/create-song">
            {es ? "Crear una canción" : ja ? "曲を作る" : "Create a song"}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function PublicMusicVideoPage({ locale }: { locale: string }) {
  const es = locale === "es";
  const ja = locale === "ja";
  const features = es ? ["Vídeos con fotos", "Letras sincronizadas", "Exportación en MP4"] : ja ? ["写真スライドショー", "歌詞を自動同期", "MP4で書き出し"] : ["Photo slideshow scenes", "Synced lyric captions", "MP4 video exports"];
  return (
    <main className="min-h-screen w-full bg-[#fbfaf7] text-stone-950">
      <section className="grid min-h-[calc(100svh-64px)] w-full gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)] lg:items-center lg:px-8 lg:py-16">
        <div className="mx-auto w-full max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-rose-600 shadow-sm">
            <Clapperboard className="size-4" />
            {es ? "Estudio de vídeo musical" : ja ? "ミュージックビデオスタジオ" : "Music Video Studio"}
          </p>
          <h1 className="mt-6 text-5xl font-black leading-[0.96] tracking-normal sm:text-6xl lg:text-7xl">
            {es ? "Crea un vídeo con la letra de tu canción." : ja ? "オリジナルソングを歌詞付き動画に。" : "Make a lyric video from your custom song."}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-stone-700">
            {es ? "Combina tu canción con fotos, letras sincronizadas y plantillas animadas. Descarga un MP4 listo para compartir." : ja ? "完成した曲に写真、同期歌詞、アニメーションを加え、共有しやすいMP4動画としてダウンロードできます。" : "Pair your finalized song with photos, synchronized lyrics, motion templates, and downloadable MP4 exports for a gift that feels ready to share."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className="rounded-full px-6 font-black">
              <Link href="/create-song">
                {es ? "Crear una canción" : ja ? "曲を作る" : "Create a song"}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              className="rounded-full bg-white px-6 font-black"
              variant="outline"
            >
              <Link href="/login">{es ? "Iniciar sesión para editar" : ja ? "ログインして編集" : "Log in to open studio"}</Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-3 text-sm font-bold text-stone-700 sm:grid-cols-3">
            {features.map(
              (item) => (
                <div
                  className="rounded-lg border border-black/5 bg-white/80 p-3 shadow-sm"
                  key={item}
                >
                  <Sparkles className="mb-2 size-4 text-rose-500" />
                  {item}
                </div>
              ),
            )}
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-4xl gap-4 sm:grid-cols-3">
          {[
            {
              alt: "Photo lyric music video template",
              src: "/images/features/photo-lyric-mv-template.webp",
              title: "Photo Slideshow",
            },
            {
              alt: "Minimal vinyl music video template",
              src: "/images/features/minimal-vinyl-record-template.webp",
              title: "Minimal Vinyl",
            },
            {
              alt: "Dynamic lyrics video template",
              src: "/images/features/dynamic-wave-radio-template.webp",
              title: "Dynamic Lyrics",
            },
          ].map((template, index) => (
            <div
              className="relative aspect-[9/13] overflow-hidden rounded-lg bg-stone-200 shadow-[0_24px_70px_rgba(41,29,22,0.18)]"
              key={template.src}
            >
              <Image
                alt={template.alt}
                className="object-cover"
                fill
                priority={index === 0}
                sizes="(min-width: 1024px) 22vw, 90vw"
                src={template.src}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4 pt-20">
                <div className="flex items-center gap-2 text-sm font-black text-white">
                  <Film className="size-4 text-rose-200" />
                  {template.title}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default async function MusicVideoPage({ params }: { params: Params }) {
  const { locale } = await params;
  const session = await getSession();
  if (!session?.user) return <PublicMusicVideoPage locale={locale} />;

  const { MusicVideoStudio } = await import(
    "@/components/song/MusicVideoEditorDrawer"
  );
  const finalSongs = await getFinalSongsForOwner(session.user.id);
  const songOptions = toMusicVideoSongOptions(finalSongs);

  return (
    <main className="w-full bg-[#eee5dc]">
      <MusicVideoStudio
        emptyState={songOptions.length ? undefined : <CreateSongFirstState locale={locale} />}
        initialSong={songOptions[0]}
        songOptions={songOptions}
        surface="page"
      />
    </main>
  );
}
