import { PricingAll } from "@/components/pricing";
import { PageHero } from "@/components/shared/PageHero";
import { type FinalSongPlayerData } from "@/components/song/FinalSongPlayer";
import { type WallArtSongOption } from "@/components/song/WallArtEditorDrawer";
import { Locale } from "@/i18n/routing";
import { buildSongShareUrl, getFinalSongsForOwner } from "@/lib/ai/final-song";
import { getSession } from "@/lib/auth/server";
import { parseUnlockSongContext } from "@/lib/ai/song-unlock-after-payment";
import { constructMetadata } from "@/lib/metadata";
import { shouldHidePricingHero } from "@/lib/pricing/page-hero";
import { Sparkles } from "lucide-react";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type Params = Promise<{ locale: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getTimestampedLyrics(
  metadata: unknown,
): FinalSongPlayerData["timestampedLyrics"] {
  if (!metadata || typeof metadata !== "object") return null;
  const timestampedLyrics = (metadata as Record<string, unknown>)
    .timestampedLyrics;
  if (!timestampedLyrics || typeof timestampedLyrics !== "object") return null;
  const alignedWords = (timestampedLyrics as Record<string, unknown>)
    .alignedWords;
  if (!Array.isArray(alignedWords)) return null;

  return {
    alignedWords: alignedWords
      .map((word) => {
        if (!word || typeof word !== "object") return null;
        const record = word as Record<string, unknown>;
        const text = String(record.word ?? "").trim();
        const startS = Number(record.startS);
        const endS = Number(record.endS);
        if (!text || !Number.isFinite(startS) || !Number.isFinite(endS)) {
          return null;
        }
        return { word: text, startS, endS };
      })
      .filter((word): word is { word: string; startS: number; endS: number } =>
        Boolean(word),
      ),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pricing" });

  return constructMetadata({
    title: t("title"),
    description: t("description"),
    locale: locale as Locale,
    path: "/pricing",
  });
}

export default async function PricingPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pricing" });
  const session = await getSession();
  const isAuthenticated = Boolean(session?.user);
  const finalSongs = session?.user
    ? await getFinalSongsForOwner(session.user.id)
    : [];
  const resolvedSearchParams = await searchParams;
  const hideHero = shouldHidePricingHero(resolvedSearchParams);
  const unlockSongContext = parseUnlockSongContext(resolvedSearchParams);
  const musicVideoSongOptions: FinalSongPlayerData[] = finalSongs.map((song) => ({
    id: song.id,
    title: song.title,
    lyrics: song.lyrics,
    timestampedLyrics: getTimestampedLyrics(song.metadataJsonb),
    genre: song.genre,
    occasion: song.occasion,
    language: song.language,
    vocalGender: song.vocalGender,
    recipientNames: Array.isArray(song.recipientNamesJsonb)
      ? song.recipientNamesJsonb.filter(
          (value): value is string => typeof value === "string",
        )
      : [],
    story: song.story,
    audioUrl: song.audioUrl,
    imageUrl: song.imageUrl,
    duration: song.duration,
    shareUrl: buildSongShareUrl(song),
  }));
  const wallArtSongOptions: WallArtSongOption[] = musicVideoSongOptions.map(
    (song) => ({
      id: song.id,
      title: song.title,
      lyrics: song.lyrics,
      imageUrl: song.imageUrl,
      shareUrl: song.shareUrl,
    }),
  );

  return (
    <main className="min-h-screen bg-background text-foreground w-full">
      {!hideHero && (
        <PageHero
          badge={{
            icon: <Sparkles className="size-4" />,
            label: t("hero.badge"),
          }}
          backgroundClassName="bg-[#f3eadf]"
          description={t("hero.description")}
          descriptionClassName="text-stone-700"
          titleClassName="text-stone-950"
          titleLines={[t("hero.titleLine1"), t("hero.titleLine2")]}
          underline={{ phrase: t("hero.underline") }}
        />
      )}

      <PricingAll
        isAuthenticated={isAuthenticated}
        musicVideoSongOptions={musicVideoSongOptions}
        unlockSongContext={unlockSongContext}
        wallArtSongOptions={wallArtSongOptions}
      />
    </main>
  );
}
