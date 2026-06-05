"use server";

import { actionResponse, ActionResult } from "@/lib/action-response";
import { getSession } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { subscriptions as subscriptionsSchema } from "@/lib/db/schema";
import { and, eq, inArray } from "drizzle-orm";

/**
 * PayPal does not provide a Customer Portal like Stripe/Creem.
 * There are two possible approaches:
 *
 * Option A (recommended): direct the user to PayPal's website to manage the
 *   subscription
 *   - Generated link: https://www.paypal.com/myaccount/autopay/
 *   - Or a subscription-specific link
 *
 * Option B: build a custom subscription management page (in the dashboard)
 *   - Show the subscription status
 *   - Provide a cancel button (calls the PayPal API to cancel)
 *
 * Here we return the URL of PayPal's account management page and let users
 * manage it themselves.
 */
export async function createPayPalPortalSession(): Promise<
  ActionResult<{ portalUrl: string }>
> {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    return actionResponse.unauthorized();
  }

  try {
    // Check whether the user has an active PayPal subscription
    const subscriptions = await db
      .select({
        id: subscriptionsSchema.id,
        subscriptionId: subscriptionsSchema.subscriptionId,
        status: subscriptionsSchema.status,
      })
      .from(subscriptionsSchema)
      .where(
        and(
          eq(subscriptionsSchema.userId, user.id),
          eq(subscriptionsSchema.provider, "paypal"),
          inArray(subscriptionsSchema.status, ["active", "trialing", "past_due"])
        )
      )
      .limit(1);

    if (subscriptions.length === 0) {
      return actionResponse.badRequest("No active PayPal subscription found.");
    }

    // PayPal has no built-in customer portal, so direct the user to PayPal's
    // website to manage automatic payments. Users can manage all of their
    // automatic payments at https://www.paypal.com/myaccount/autopay/
    const portalUrl = "https://www.paypal.com/myaccount/autopay/";

    return actionResponse.success({ portalUrl });
  } catch (error) {
    console.error("[PayPal Portal] Error:", error);
    return actionResponse.error("Failed to create PayPal portal session.");
  }
}
