import { createCreemPortalSession } from "@/actions/creem/portal";
import { createStripePortalSession } from "@/actions/stripe";
import { getUserBenefits } from "@/actions/usage/benefits";
import CurrentUserBenefitsDisplay from "@/components/layout/CurrentUserBenefitsDisplay";
import { Button } from "@/components/ui/button";
import { Link as I18nLink } from "@/i18n/routing";
import { getSession } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { subscriptions as subscriptionsSchema } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { PortalButton } from "./PortalButton";

export default async function SubscriptionPage() {
  const session = await getSession();
  const user = session?.user;
  if (!user) redirect("/login");

  const benefits = await getUserBenefits(user.id);

  // Get the user's subscription provider
  const subscriptionResults = await db
    .select({ provider: subscriptionsSchema.provider })
    .from(subscriptionsSchema)
    .where(eq(subscriptionsSchema.userId, user.id))
    .orderBy(desc(subscriptionsSchema.createdAt))
    .limit(1);

  const subscriptionProvider = subscriptionResults[0]?.provider || null;

  const isMember =
    benefits.subscriptionStatus === "active" ||
    benefits.subscriptionStatus === "trialing";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription plan and billing details.
        </p>
      </div>

      <div className="rounded-lg border p-6 space-y-4">
        {isMember ? (
          <>
            <CurrentUserBenefitsDisplay />
            {subscriptionProvider === "stripe" && (
              <>
                <PortalButton
                  provider="stripe"
                  action={createStripePortalSession}
                />
                <p className="text-xs text-muted-foreground">
                  You will be redirected to Stripe to manage your subscription
                  details.
                </p>
              </>
            )}
            {subscriptionProvider === "creem" && (
              <>
                <PortalButton
                  provider="creem"
                  action={createCreemPortalSession}
                />
                <p className="text-xs text-muted-foreground">
                  You will be redirected to manage your subscription details.
                </p>
              </>
            )}
            {!subscriptionProvider && (
              <p className="text-sm text-muted-foreground">
                Unable to load subscription management portal.
              </p>
            )}
          </>
        ) : (
          <>
            <p>You are currently not subscribed to any plan.</p>
            <Button asChild>
              <I18nLink
                href={process.env.NEXT_PUBLIC_PRICING_PATH!}
                title="Upgrade Plan"
              >
                Upgrade Plan
              </I18nLink>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
