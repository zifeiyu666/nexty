import { Button } from "@/components/ui/button";
import { Link, Locale } from "@/i18n/routing";
import { getFinalSongsForOwner } from "@/lib/ai/final-song";
import { toWallArtSongOptions } from "@/lib/ai/final-song-editor-options";
import { getSession } from "@/lib/auth/server";
import { constructMetadata } from "@/lib/metadata";
import { ArrowRight, Disc3, Image as ImageIcon, Sparkles } from "lucide-react";
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
    title: locale === "es" ? "Crea una lámina personalizada con la letra de tu canción" : locale === "ja" ? "オリジナル歌詞アート作成スタジオ" : "Lyric Wall Art Studio",
    description: locale === "es"
      ? "Diseña una lámina imprimible con la letra de tu canción personalizada: póster de disco, composición en forma de corazón o retrato con texto."
      : locale === "ja" ? "オリジナルソングの歌詞を、レコード風ポスター、ハート型アート、文字で描く写真作品にできます。"
      : "Design printable lyric wall art from a finalized custom song with record posters, heart lyrics, and photo lyric templates.",
    images: ["/images/blog/custom-song-lyric-gifts/custom-song-lyric-gifts-cover.webp"],
    locale: locale as Locale,
    path: "/lyricwallart",
  });
}

function PublicLyricWallArtPage({ locale }: { locale: string }) {
  const es = locale === "es";
  const ja = locale === "ja";
  const features = es
    ? ["Plantillas de póster", "Tipografía editable", "Exportación en alta resolución"]
    : ja ? ["ポスターテンプレート", "文字を自由に編集", "高解像度で書き出し"]
    : ["Record poster templates", "Editable lyric typography", "High-resolution export"];
  return (
    <main className="min-h-screen w-full bg-[#fbfaf7] text-stone-950">
      <section className="grid min-h-[calc(100svh-64px)] w-full gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)] lg:items-center lg:px-8 lg:py-16">
        <div className="mx-auto w-full max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#b56e4f] shadow-sm">
            <Disc3 className="size-4" />
            {es ? "Estudio de láminas con letras" : ja ? "歌詞アートスタジオ" : "Lyric Wall Art Studio"}
          </p>
          <h1 className="mt-6 text-5xl font-black leading-[0.96] tracking-normal sm:text-6xl lg:text-7xl">
            {es ? "Convierte tu canción en una lámina para imprimir." : ja ? "大切な歌を、飾れる歌詞アートに。" : "Turn your song into printable lyric art."}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-stone-700">
            {es ? "Usa la letra, la portada y el enlace de tu canción para crear pósteres de disco, composiciones en forma de corazón y retratos hechos con texto." : ja ? "完成した曲の歌詞やジャケットを使って、レコード風ポスターやハート型の歌詞アート、文字で描く写真作品を作れます。" : "Use your finalized custom song lyrics, cover art, and share link to create record posters, heart lyric keepsakes, and photo lyric portraits ready for home printing or a print shop."}
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
                  <Sparkles className="mb-2 size-4 text-[#b56e4f]" />
                  {item}
                </div>
              ),
            )}
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-4xl gap-4 sm:grid-cols-[0.92fr_1.08fr]">
          <div className="grid gap-4">
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-stone-200 shadow-[0_24px_70px_rgba(41,29,22,0.18)]">
              <Image
                alt={es ? "Plantilla de póster con la letra de una canción" : "Record poster lyric wall art template"}
                className="object-cover"
                fill
                priority
                sizes="(min-width: 1024px) 28vw, 90vw"
                src="/wallart/color_preset/template2_preset/color_preset1.avif"
              />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-stone-200 shadow-[0_18px_48px_rgba(41,29,22,0.14)]">
              <Image
                alt={es ? "Selector de plantillas para láminas con letras" : "Lyric wall art template preset chooser"}
                className="object-cover"
                fill
                sizes="(min-width: 1024px) 28vw, 90vw"
                src="/wallart/heart_lyrics.avif"
              />
            </div>
          </div>
          <div className="relative aspect-[5/6] overflow-hidden rounded-lg bg-stone-200 shadow-[0_30px_80px_rgba(41,29,22,0.2)]">
            <Image
              alt={es ? "Editor de retratos creados con la letra de una canción" : "Photo lyric portrait wall art editor"}
              className="object-cover"
              fill
              priority
              sizes="(min-width: 1024px) 36vw, 90vw"
              src="/wallart/color_preset/lytric_fill_template/color_preset1.avif"
            />
            <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-white/90 p-4 shadow-lg backdrop-blur">
              <div className="flex items-center gap-2 text-sm font-black text-stone-950">
                <ImageIcon className="size-4 text-[#b56e4f]" />
                {es ? "Inicia sesión para editar una de tus canciones." : "Sign in to edit your own finalized song."}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default async function LyricWallArtPage({ params }: { params: Params }) {
  const { locale } = await params;
  const session = await getSession();
  if (!session?.user) return <PublicLyricWallArtPage locale={locale} />;

  const { WallArtStudio } = await import(
    "@/components/song/WallArtEditorDrawer"
  );
  const finalSongs = await getFinalSongsForOwner(session.user.id);
  const songOptions = toWallArtSongOptions(finalSongs);

  return (
    <main className="w-full bg-[#eee5dc]">
      <WallArtStudio
        initialSong={songOptions[0]}
        songOptions={songOptions}
        surface="page"
      />
    </main>
  );
}
