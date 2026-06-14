import { siteConfig } from "@/config/site";
import SongSampleReadyEmail from "@/emails/song-sample-ready";
import resend from "@/lib/resend";
import React from "react";
import type { SongSample } from "./song-sample-store";

function buildSampleReadyUrl(sample: SongSample): string {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url).replace(/\/+$/, "");
  const params = new URLSearchParams({ ref: "sample_ready_listen" });

  if (!sample.userId && sample.email) {
    params.set("email", sample.email);
  }

  return `${baseUrl}/samples/${sample.songId}?${params.toString()}`;
}

export async function sendSongSampleReadyEmail(sample: SongSample): Promise<void> {
  if (!sample.email) return;
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

  try {
    await resend.emails.send({
      from: `${senderName} <${senderEmail}>`,
      to: sample.email,
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
