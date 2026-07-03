import { apiResponse } from "@/lib/api-response";
import { getSession } from "@/lib/auth/server";
import { getMusicVideoForOwner } from "@/lib/music-video/renders";

type Params = Promise<{ videoId: string }>;

function getDownloadFileName(title: string) {
  const safeTitle = title
    .trim()
    .replace(/[^a-z0-9._-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${safeTitle || "music-video"}.mp4`;
}

export async function GET(_request: Request, { params }: { params: Params }) {
  const session = await getSession();
  const user = session?.user;
  if (!user) return apiResponse.unauthorized();

  const { videoId } = await params;
  const video = await getMusicVideoForOwner({
    userId: user.id,
    videoId,
  });
  if (!video) return apiResponse.notFound("Music video not found.");

  const sourceUrl = video.videoUrl ?? video.temporaryVideoUrl;
  if (!sourceUrl) return apiResponse.notFound("Music video file not found.");

  const upstream = await fetch(sourceUrl);
  if (!upstream.ok || !upstream.body) {
    return apiResponse.error("Unable to download music video.", 502);
  }

  const headers = new Headers();
  headers.set(
    "Content-Disposition",
    `attachment; filename="${getDownloadFileName(video.title)}"`,
  );
  headers.set(
    "Content-Type",
    upstream.headers.get("content-type") ?? "video/mp4",
  );

  const contentLength = upstream.headers.get("content-length");
  if (contentLength) headers.set("Content-Length", contentLength);

  return new Response(upstream.body, {
    headers,
    status: 200,
  });
}
