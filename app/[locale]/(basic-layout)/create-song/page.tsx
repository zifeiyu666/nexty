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
    title: "Create a Custom AI Song",
    description:
      "Create a personalized AI song from a story, capture a free preview, and unlock the full MP3.",
    locale: locale as Locale,
    path: "/create-song",
  });
}

export default function CreateSongPage() {
  return (
    <div className="w-full min-h-screen bg-muted">
      <CustomSongWizard />
    </div>
  );
}
