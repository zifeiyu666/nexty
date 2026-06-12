"use client";

import { Button } from "@/components/ui/button";
import { DEFAULT_LOCALE, useRouter } from "@/i18n/routing";
import { pricingPlans as pricingPlansSchema } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { Loader2, MousePointerClick } from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { PayPalCheckoutButton } from "./PayPalCheckoutButton";

type PricingPlan = typeof pricingPlansSchema.$inferSelect;

type Params = {
  buttonClassName?: string;
  plan: PricingPlan;
  localizedPlan: any;
};

export default function PricingCTA({
  buttonClassName,
  plan,
  localizedPlan,
}: Params) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const locale = useLocale();

  const provider = plan.provider;
  const isCreem = provider === "creem";
  const isStripe = provider === "stripe";
  const isPayPal = provider === "paypal";

  const handleCheckout = async (applyCoupon = true) => {
    const stripePriceId = plan.stripePriceId ?? null;
    if (isStripe && !stripePriceId) {
      toast.error("Stripe price ID is missing for this plan.");
      return;
    }

    const creemProductId = plan.creemProductId ?? null;
    if (isCreem && !creemProductId) {
      toast.error("Creem product ID is missing for this plan.");
      return;
    }

    // PayPal one-time payments are handled by the PayPalCheckoutButton component
    if (isPayPal && plan.paymentType === "one_time") {
      toast.error("PayPal one-time payments should use PayPalCheckoutButton.");
      return;
    }
    if (isPayPal && plan.paymentType === "recurring" && !plan.paypalPlanId) {
      toast.error("PayPal Plan ID is missing for this subscription plan.");
      return;
    }
    if (isPayPal && !plan.paymentType) {
      toast.error("This plan is not configured for PayPal payments.");
      return;
    }

    setIsLoading(true);
    try {
      let requestBody: {
        provider: string;
        couponCode?: string;
        // Stripe
        stripePriceId?: string;
        referral?: string;

        // Creem
        creemProductId?: string;

        // PayPal
        planId?: string;
      } = {
        provider: provider || "stripe",
      };

      if (isStripe) {
        requestBody.stripePriceId = stripePriceId!;
        requestBody.couponCode =
          applyCoupon && plan.stripeCouponId ? plan.stripeCouponId : undefined;

        const toltReferral = (window as any).tolt_referral;
        requestBody.referral = toltReferral ?? undefined;
      }
      if (isCreem) {
        requestBody.creemProductId = creemProductId!;
        requestBody.couponCode =
          applyCoupon && plan.creemDiscountCode
            ? plan.creemDiscountCode
            : undefined;
      }
      // PayPal subscriptions use planId (redirect flow)
      if (isPayPal) {
        requestBody.planId = plan.id;
      }

      const response = await fetch("/api/payment/checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": (locale || DEFAULT_LOCALE) as string,
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          toast.error("You must be logged in to purchase a plan.");
          return;
        }
        throw new Error(
          result.error || "HTTP error! status: " + response.status
        );
      }

      if (!result.success) {
        throw new Error(result.error || "Failed to create checkout session.");
      }

      const data = result.data;

      if (data.url) {
        router.push(data.url);
        setIsLoading(false);
      } else {
        throw new Error("Checkout URL not received.");
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred."
      );
      setIsLoading(false);
    }
  };

  let defaultCouponCode = null;
  if (isCreem) {
    defaultCouponCode = plan.creemDiscountCode;
  } else if (isStripe) {
    defaultCouponCode = plan.stripeCouponId;
  }

  const allowManualCoupon =
    Boolean(defaultCouponCode) && plan.enableManualInputCoupon;

  // For PayPal one-time payments, render the PayPal buttons (no page redirect)
  if (isPayPal && plan.paymentType === "one_time") {
    return (
      <div className="mb-6">
        <PayPalCheckoutButton
          plan={plan}
          onSuccess={(data) => {
            const params = new URLSearchParams();
            params.set("provider", "paypal");
            params.set("order_id", data.orderId);
            if (data.pending) {
              params.set("pending", "true");
            }
            router.push(`/payment/success?${params.toString()}`);
          }}
        />
      </div>
    );
  }

  // Disable the purchase button for PayPal plans that are not fully configured
  if (isPayPal && !plan.paymentType) {
    return (
      <Button disabled className="w-full py-5 mb-6">
        Not Available
      </Button>
    );
  }

  return (
    <div>
      <Button
        asChild={!!plan.buttonLink}
        disabled={isLoading}
        className={cn(
          "flex w-full items-center justify-center gap-2 py-5 font-medium",
          buttonClassName ||
            (plan.isHighlighted
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-foreground text-primary-foreground hover:bg-foreground/90"),
          allowManualCoupon ? "mb-2" : "mb-6"
        )}
        {...(!plan.buttonLink && {
          onClick: () => handleCheckout(),
        })}
      >
        {plan.buttonLink ? (
          <Link
            href={plan.buttonLink}
            title={localizedPlan.buttonText || plan.buttonText}
            rel="noopener noreferrer nofollow"
            target="_blank"
            prefetch={false}
          >
            {localizedPlan.buttonText || plan.buttonText}
            {plan.isHighlighted && <MousePointerClick className="w-5 h-5" />}
          </Link>
        ) : (
          <>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              localizedPlan.buttonText || plan.buttonText
            )}
            {plan.isHighlighted && !isLoading && (
              <MousePointerClick className="w-5 h-5 ml-2" />
            )}
          </>
        )}
      </Button>
      {allowManualCoupon && (
        <div className="text-center mb-2">
          <button
            onClick={() => handleCheckout(false)}
            disabled={isLoading}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 underline underline-offset-2"
          >
            I have a different coupon code
          </button>
        </div>
      )}
    </div>
  );
}
