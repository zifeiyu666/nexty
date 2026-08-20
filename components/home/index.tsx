import CustomerReactions from "@/components/home/CustomerReactions";
import FAQ from "@/components/home/FAQ";
import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import OccasionShowcase from "@/components/home/OccasionShowcase";
import OurProducts from "@/components/home/OurProducts";
import VoicePersonalization from "@/components/home/VoicePersonalization";
import WallArtGallery, {
  PRODUCT_DIMENSIONS,
  type WallArtImage,
} from "@/components/home/WallArtGallery";

import SongfinchComparison from "@/components/home/SongfinchComparison";
import ScrollReveal from "@/components/home/ScrollReveal";
import Testimonials from "@/components/home/Testimonials";
import { isCustomerReactionsEnabled } from "@/config/features";
import { BG1 } from "@/components/shared/BGs";
import { siteConfig } from "@/config/site";
import { type FinalSongPlayerData } from "@/components/song/FinalSongPlayer";
import { type WallArtSongOption } from "@/components/song/WallArtEditorDrawer";
import { buildSongShareUrl, getFinalSongsForOwner } from "@/lib/ai/final-song";
import { getSession } from "@/lib/auth/server";
import { listR2Objects } from "@/lib/cloudflare/r2";
import { R2_PUBLIC_URL } from "@/lib/cloudflare/public-url";
import { getLocale, getMessages } from "next-intl/server";

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

async function getProductGalleryImages(): Promise<WallArtImage[]> {
  const objects = [] as Awaited<ReturnType<typeof listR2Objects>>["objects"];
  let continuationToken: string | undefined;

  try {
    do {
      const result = await listR2Objects({
        prefix: "products/",
        pageSize: 1000,
        continuationToken,
      });
      if (result.error) return [];
      objects.push(...result.objects);
      continuationToken = result.nextContinuationToken;
    } while (continuationToken);
  } catch (error) {
    console.error("Failed to load product gallery from R2:", error);
    return [];
  }

  const imageObjects = objects
    .filter((object) => object.key.toLowerCase().endsWith(".webp"))
    .sort((a, b) => a.key.localeCompare(b.key));
  const videoKeys = new Set(
    objects
      .filter((object) => object.key.toLowerCase().endsWith(".mp4"))
      .map((object) => object.key.slice(0, -4).toLowerCase()),
  );

  return imageObjects.map((object) => {
    const fileName = object.key.split("/").pop() ?? object.key;
    const [width, height] = PRODUCT_DIMENSIONS[fileName] ?? [4, 5];
    const stem = object.key.slice(0, -5).toLowerCase();
    return {
      src: `${R2_PUBLIC_URL}/${object.key}`,
      width,
      height,
      videoSrc: videoKeys.has(stem)
        ? `${R2_PUBLIC_URL}/${object.key.slice(0, -5)}.mp4`
        : undefined,
    };
  });
}

export default async function HomeComponent() {
  const [messages, locale, productGalleryImages] = await Promise.all([
    getMessages(),
    getLocale(),
    getProductGalleryImages(),
  ]);
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": `${siteConfig.url}/#organization`,
                name: "SendTheSong.io",
                alternateName: "SendTheSong AI Custom Song Gift Maker",
                url: siteConfig.url,
                logo: `${siteConfig.url}/logo.png`,
                email: siteConfig.socialLinks.email,
              },
              {
                "@type": "WebSite",
                "@id": `${siteConfig.url}/#website`,
                name: "SendTheSong.io",
                url: siteConfig.url,
                publisher: { "@id": `${siteConfig.url}/#organization` },
                description: "Create and send personalized custom song gifts from your story.",
              },
              {
                "@type": "WebApplication",
                name: "SendTheSong.io",
                url: siteConfig.url,
                applicationCategory: "MultimediaApplication",
                operatingSystem: "Web",
                description: "Create a personalized custom song gift, preview it free, edit the lyrics, and send it in minutes.",
              },
            ],
          }),
        }}
      />
      <BG1 />

      {messages.Landing.Hero && <Hero />}

      {/* <DiagonalCounterflowShowcase /> */}

      {messages.Landing.CustomerReactions && isCustomerReactionsEnabled && (
        <ScrollReveal>
          {/* <CustomerReactionCollage /> */}
          <CustomerReactions sectionId="customer-reactions-grid" />
        </ScrollReveal>
      )}

      {messages.Landing.HowItWorks && (
        <ScrollReveal>
          <HowItWorks />
        </ScrollReveal>
      )}

      {messages.Landing.VoicePersonalization && (
        <ScrollReveal>
          <VoicePersonalization />
        </ScrollReveal>
      )}

      {messages.Landing.WallArtGallery && (
        <ScrollReveal>
          <WallArtGallery images={productGalleryImages} />
        </ScrollReveal>
      )}

      {messages.Landing.OurProducts && (
        <ScrollReveal>
          <OurProducts
            isAuthenticated={isAuthenticated}
            musicVideoSongOptions={musicVideoSongOptions}
            wallArtSongOptions={wallArtSongOptions}
          />
        </ScrollReveal>
      )}

      <ScrollReveal>
        <OccasionShowcase />
      </ScrollReveal>

      {/* {messages.Landing.Features && <Features />} */}

      {/* {messages.Landing.UseCases && <UseCases />} */}

      {messages.Landing.SongfinchComparison && (
        <ScrollReveal>
          <SongfinchComparison />
        </ScrollReveal>
      )}

      {/* {messages.Pricing && <PricingByGroup />}
      {messages.Pricing && <PricingAll />}
      {messages.Pricing && <PricingByPaymentType />} */}

      {messages.Landing.Testimonials && (
        <ScrollReveal>
          <Testimonials />
        </ScrollReveal>
      )}

      {messages.Landing.FAQ && (
        <ScrollReveal>
          <FAQ />
        </ScrollReveal>
      )}
    </div>
  );
}
