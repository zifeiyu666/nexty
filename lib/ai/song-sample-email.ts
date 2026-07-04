import { siteConfig } from "@/config/site";
import SongSampleReadyEmail from "@/emails/song-sample-ready";
import { db } from "@/lib/db";
import { user as userSchema } from "@/lib/db/schema";
import resend from "@/lib/resend";
import { eq } from "drizzle-orm";
import React from "react";
import type { SongSample } from "./song-sample-store";

function buildSampleReadyUrl(sample: SongSample): string {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url).replace(/\/+$/, "");
  const params = new URLSearchParams({ ref: "sample_ready_listen" });

  return `${baseUrl}/samples/${sample.songId}?${params.toString()}`;
}

export async function sendSongSampleReadyEmail(sample: SongSample): Promise<void> {
  if (!sample.userId) return;
  if (!resend) {
    console.warn("[Song Sample Email] Resend is not configured.");
    return;
  }

  const senderEmail = process.env.ADMIN_EMAIL;
  if (!senderEmail) {
    console.warn("[Song Sample Email] ADMIN_EMAIL is not configured.");
    return;
  }

  const senderName = process.env.ADMIN_NAME || siteConfig.name;
  const sampleUrl = buildSampleReadyUrl(sample);
  const [user] = await db
    .select({ email: userSchema.email })
    .from(userSchema)
    .where(eq(userSchema.id, sample.userId))
    .limit(1);

  if (!user?.email) return;

  try {
    await resend.emails.send({
      from: `${senderName} <${senderEmail}>`,
      to: user.email,
      subject: `Your song sample is ready: ${sample.title}`,
      react: React.createElement(SongSampleReadyEmail, {
        title: sample.title,
        sampleUrl,
        recipientLabel: sample.recipientNames.join(" and ") || "someone special",
      }),
    });
  } catch (error) {
    console.error("[Song Sample Email] Failed to send ready email:", error);
  }
}

export const songSampleEmail = {
  buildSampleReadyUrl,
  sendSongSampleReadyEmail,
};
