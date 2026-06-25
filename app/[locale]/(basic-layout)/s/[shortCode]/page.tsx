import { getSharedSongByShortCode } from "@/lib/ai/final-song";
import { notFound, redirect } from "next/navigation";

type Params = Promise<{ shortCode: string }>;

export default async function ShortSongSharePage({
  params,
}: {
  params: Params;
}) {
  const { shortCode } = await params;
  const song = await getSharedSongByShortCode(shortCode);

  if (!song) notFound();

  redirect(`/shared/songs/${song.shareToken}`);
}
