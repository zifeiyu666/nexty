import { apiResponse } from "@/lib/api-response";
import { getSession } from "@/lib/auth/server";
import { getMusicVideoForOwner } from "@/lib/music-video/renders";

type Params = Promise<{ videoId: string }>;

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

  return apiResponse.success(video);
}
