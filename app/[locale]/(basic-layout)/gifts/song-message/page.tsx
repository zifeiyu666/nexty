import SongMessageLandingPage, {
  songMessageFaqs,
} from "@/components/gifts/SongMessageLandingPage";
import { siteConfig } from "@/config/site";
import { type Locale } from "@/i18n/routing";
import { constructMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

type Params = Promise<{ locale: string }>;

const path = "/gifts/song-message";
const title = "Turn a Message Into a Song | Song Message Gift";
const description =
  "Turn a message, memory, or voice-note idea into a personalized song gift. Preview it free, edit the lyrics and style, then share a song made for them.";

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale } = await params;

  return constructMetadata({
    title,
    description,
    keywords: [
      "turn a message into a song",
      "personalized song message",
      "song message gift",
      "custom song message",
      "voice message gift",
    ],
    images: ["/images/blog/voice-message-gift-ideas/cover.webp"],
    locale: "en" as Locale,
    path,
    canonicalUrl: path,
    availableLocales: ["en"],
    noIndex: locale !== "en",
  });
}

export default async function SongMessagePage({ params }: { params: Params }) {
  const { locale } = await params;

  if (locale !== "en") {
    permanentRedirect(path);
  }

  const faqSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: songMessageFaqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }).replaceAll("<", "\\u003c");

  const breadcrumbSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteConfig.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Song Message Gift",
        item: `${siteConfig.url}${path}`,
      },
    ],
  }).replaceAll("<", "\\u003c");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: faqSchema }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbSchema }}
      />
      <SongMessageLandingPage />
    </>
  );
}
