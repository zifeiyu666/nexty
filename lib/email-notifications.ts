import { sendEmail } from "@/actions/usesend";
import TransactionalNotificationEmail from "@/emails/transactional-notification";
import { siteConfig } from "@/config/site";
import { db } from "@/lib/db";
import { user as userSchema } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type Detail = { label: string; value: string };

function adminEmail() {
  return process.env.ADMIN_EMAIL?.trim();
}

export async function notifyTransaction({
  event,
  userId,
  userEmail,
  userTitle,
  userMessage,
  adminTitle,
  adminMessage,
  details = [],
  actionUrl,
  actionLabel,
}: {
  event: string;
  userId?: string;
  userEmail?: string | null;
  userTitle: string;
  userMessage: string;
  adminTitle: string;
  adminMessage: string;
  details?: Detail[];
  actionUrl?: string;
  actionLabel?: string;
}) {
  let recipient = userEmail;
  if (!recipient && userId) {
    const [user] = await db.select({ email: userSchema.email }).from(userSchema).where(eq(userSchema.id, userId)).limit(1);
    recipient = user?.email;
  }
  const sends: Promise<unknown>[] = [];
  if (recipient) {
    sends.push(sendEmail({
      email: recipient,
      subject: userTitle,
      react: TransactionalNotificationEmail,
      reactProps: { title: userTitle, message: userMessage, details, actionUrl, actionLabel, audience: "user" },
      idempotencyKey: `${event}/user/${userId ?? recipient}`,
    }));
  }
  const admin = adminEmail();
  if (admin && admin.toLowerCase() !== recipient?.toLowerCase()) {
    sends.push(sendEmail({
      email: admin,
      subject: adminTitle,
      react: TransactionalNotificationEmail,
      reactProps: { title: adminTitle, message: adminMessage, details, actionUrl, actionLabel, audience: "admin" },
      idempotencyKey: `${event}/admin`,
    }));
  }
  if (!sends.length) return;
  const results = await Promise.allSettled(sends);
  const failed = results.find((result) => result.status === "rejected");
  if (failed && failed.status === "rejected") throw failed.reason;
}

export async function notifyCreditUpgradeFailure(params: {
  userId: string;
  orderId: string;
  planId: string;
  error: unknown;
}) {
  const errorMessage = params.error instanceof Error ? params.error.message : String(params.error);
  return notifyTransaction({
    event: `credit-upgrade-failed/${params.orderId}`,
    userId: params.userId,
    userTitle: "Your payment needs attention",
    userMessage: "Your payment was received, but we could not finish adding the purchased credits. Our team has been notified and will correct this automatically or contact you shortly.",
    adminTitle: `Credit upgrade failed for order ${params.orderId}`,
    adminMessage: "A successful payment could not be matched with the purchased entitlements.",
    details: [
      { label: "User ID", value: params.userId },
      { label: "Order ID", value: params.orderId },
      { label: "Plan ID", value: params.planId },
      { label: "Error", value: errorMessage },
    ],
    actionUrl: dashboardUrl(),
    actionLabel: "Open dashboard",
  });
}

export async function notifySongUnlockCompleted(params: {
  userId: string;
  orderId?: string | null;
  songId: string;
  songUrl: string;
}) {
  return notifyTransaction({
    event: `song-unlock-completed/${params.orderId ?? params.songId}`,
    userId: params.userId,
    userTitle: "Your full song is ready",
    userMessage: "Your paid song has been unlocked and is ready to listen to and share.",
    adminTitle: `Paid song unlocked for ${params.userId}`,
    adminMessage: "A paid song unlock completed successfully.",
    details: [
      { label: "Order ID", value: params.orderId ?? "N/A" },
      { label: "Song ID", value: params.songId },
    ],
    actionUrl: `${process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url}${params.songUrl}`,
    actionLabel: "Open song",
  });
}

export function formatEntitlements(entitlements: { song: number; mv: number; wallArt: number }) {
  return `Songs: ${entitlements.song}, Music videos: ${entitlements.mv}, Wall art: ${entitlements.wallArt}`;
}

export const dashboardUrl = () => `${process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url}/dashboard`;
