import { VoiceCloneLandingPage } from "@/components/voice/VoiceCloneLandingPage";
import { Locale } from "@/i18n/routing";
import { getSession } from "@/lib/auth/server";
import { constructMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  return constructMetadata({
    title: "AI Singing Voice Generator | Create Songs in Your Own Voice",
    description: "Create a verified AI singing voice from a recording you own or are authorized to use. Turn memories into original songs in a voice they know and love.",
    keywords: ["AI singing voice generator", "voice clone", "AI voice clone", "AI voice singing", "AI singing voice generator free"],
    images: ["/images/voice-clone/voice-clone-og.webp"],
    locale: locale as Locale,
    path: "/voice-clone",
    canonicalUrl: "/voice-clone",
    availableLocales: ["en"],
  });
}

export default async function VoiceClonePage({ params }: { params: Params }) {
  const { locale } = await params;
  if (locale !== "en") redirect("/voice-clone");
  const session = await getSession();
  const createHref = session?.user ? "/voices?create=1" : "/login?next=/voices%3Fcreate%3D1";
  return <VoiceCloneLandingPage createHref={createHref} />;
}
