import CustomSongWizard from "@/components/song/CustomSongWizard";
import { Locale } from "@/i18n/routing";
import { constructMetadata } from "@/lib/metadata";
import { Metadata } from "next";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale } = await params;

  return constructMetadata({
    title: "Free AI Song Generator | Preview Your Song",
    description:
      "Turn your story into a quick song preview, refine the lyrics and style, then unlock the final MP3 when it feels right.",
    locale: locale as Locale,
    path: "/create-song",
  });
}

export default function CreateSongPage() {
  return (
    <div className="w-full min-h-screen bg-background">
      <section className="sr-only" aria-labelledby="create-song-title">
        <h1 id="create-song-title">Free AI Song Generator</h1>
        <p>
          Start from a personal story, preview a generated song, then refine the
          lyrics, style, and delivery before unlocking the full MP3.
        </p>
      </section>
      <CustomSongWizard />
    </div>
  );
}
