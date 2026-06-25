import CustomerReactions from "@/components/home/CustomerReactions";
import FAQ from "@/components/home/FAQ";
import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import OccasionShowcase from "@/components/home/OccasionShowcase";
import OurProducts from "@/components/home/OurProducts";
import SongfinchComparison from "@/components/home/SongfinchComparison";
import Testimonials from "@/components/home/Testimonials";
import { BG1 } from "@/components/shared/BGs";
import { type FinalSongPlayerData } from "@/components/song/FinalSongPlayer";
import { type WallArtSongOption } from "@/components/song/WallArtEditorDrawer";
import { buildSongShareUrl, getFinalSongsForOwner } from "@/lib/ai/final-song";
import { getSession } from "@/lib/auth/server";
import { getMessages } from "next-intl/server";

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

export default async function HomeComponent() {
  const messages = await getMessages();
  const session = await getSession();
  const isAuthenticated = Boolean(session?.user);
  const finalSongs = session?.user
    ? await getFinalSongsForOwner(session.user.id)
    : [];
  const musicVideoSongOptions: FinalSongPlayerData[] = finalSongs.map(
    (song) => ({
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
    }),
  );
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
    <div className="-mt-[53px] w-full">
      <BG1 />

      {messages.Landing.Hero && <Hero />}

      {/* <DiagonalCounterflowShowcase /> */}

      {messages.Landing.CustomerReactions && (
        <>
          {/* <CustomerReactionCollage /> */}
          <CustomerReactions sectionId="customer-reactions-grid" />
        </>
      )}

      {messages.Landing.HowItWorks && <HowItWorks />}

      {messages.Landing.OurProducts && (
        <OurProducts
          isAuthenticated={isAuthenticated}
          musicVideoSongOptions={musicVideoSongOptions}
          wallArtSongOptions={wallArtSongOptions}
        />
      )}

      <OccasionShowcase />

      {/* {messages.Landing.Features && <Features />} */}

      {/* {messages.Landing.UseCases && <UseCases />} */}

      {messages.Landing.SongfinchComparison && <SongfinchComparison />}

      {/* {messages.Pricing && <PricingByGroup />}
      {messages.Pricing && <PricingAll />}
      {messages.Pricing && <PricingByPaymentType />} */}

      {messages.Landing.Testimonials && <Testimonials />}

      {messages.Landing.FAQ && <FAQ />}
    </div>
  );
}
