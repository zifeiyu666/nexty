import { PlaylistDetailPage } from "@/components/playlists/PlaylistDetailPage";
import { Locale } from "@/i18n/routing";
import { constructMetadata } from "@/lib/metadata";
import {
  getPlaylistByDimensionAndSlug,
  getPlaylistsByDimension,
} from "@/lib/playlists/catalog";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type Params = Promise<{ locale: string; slug: string }>;

export function generateStaticParams() {
  return getPlaylistsByDimension("style").map((playlist) => ({
    slug: playlist.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const playlist = getPlaylistByDimensionAndSlug("style", slug);
  if (!playlist) notFound();

  return constructMetadata({
    title: playlist.shortTitle,
    description: playlist.description,
    images: [playlist.image],
    locale: locale as Locale,
    path: playlist.canonicalPath,
  });
}

export default async function StylePlaylistPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const playlist = getPlaylistByDimensionAndSlug("style", slug);
  if (!playlist) notFound();

  return <PlaylistDetailPage playlist={playlist} />;
}
