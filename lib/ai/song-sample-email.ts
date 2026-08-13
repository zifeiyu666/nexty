import { sendEmail } from "@/actions/usesend";
import { siteConfig } from "@/config/site";
import SongSampleReadyEmail from "@/emails/song-sample-ready";
import { db } from "@/lib/db";
import { user as userSchema } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { SongSample } from "./song-sample-store";

function buildSampleReadyUrl(sample: SongSample): string {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url).replace(/\/+$/, "");
  const params = new URLSearchParams({ ref: "sample_ready_listen" });

  return `${baseUrl}/samples/${sample.songId}?${params.toString()}`;
}

export async function sendSongSampleReadyEmail(sample: SongSample): Promise<void> {
  if (!sample.userId) return;
  if (!process.env.USESEND_API_KEY) {
    console.warn("[Song Sample Email] UseSend is not configured.");
    return;
  }

  const sampleUrl = buildSampleReadyUrl(sample);
  const [user] = await db
    .select({ email: userSchema.email })
    .from(userSchema)
    .where(eq(userSchema.id, sample.userId))
    .limit(1);

  if (!user?.email) return;

  try {
    await sendEmail({
      email: user.email,
      subject: `Your song sample is ready: ${sample.title}`,
      react: SongSampleReadyEmail,
      reactProps: {
        title: sample.title,
        sampleUrl,
        recipientLabel: sample.recipientNames.join(" and ") || "someone special",
      },
    });
  } catch (error) {
    console.error("[Song Sample Email] Failed to send ready email:", error);
    throw error;
  }
}

export const songSampleEmail = {
  buildSampleReadyUrl,
  sendSongSampleReadyEmail,
};
