"use client";

import { Button } from "@/components/ui/button";
import { buildPayPalOptions } from "@/lib/paypal/script-options";
import { pricingPlans as pricingPlansSchema } from "@/lib/db/schema";
import {
  PayPalButtons,
  PayPalScriptProvider,
} from "@paypal/react-paypal-js";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";

type PricingPlan = typeof pricingPlansSchema.$inferSelect;

interface Props {
  plan: PricingPlan;
  onSuccess?: (data: {
    orderId: string;
    planName: string;
    pending?: boolean;
  }) => void;
}

export function PayPalCheckoutButton({ plan, onSuccess }: Props) {
  const router = useRouter();
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  if (!clientId) {
    return (
      <Button disabled className="w-full">
        PayPal not configured
      </Button>
    );
  }

  const options = buildPayPalOptions({
    currency: (plan.currency as string) || "USD",
    intent: "capture",
  });

  async function handleCreateOrder(): Promise<string> {
    try {
      // Ask the backend to create a PayPal Order
      const response = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        if (response.status === 401) {
          router.push("/login");
          toast.error("You must be logged in to purchase a plan.");
          throw new Error(result.error || "Unauthorized");
        }
        throw new Error(result.error || "Failed to create PayPal order");
      }

      // Return the orderId to the PayPal SDK
      return result.data.orderId;
    } catch (error) {
      console.error("[PayPal] Create order error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to create order";
      toast.error(message);
      throw error;
    }
  }

  async function handleApprove(data: { orderID: string }): Promise<void> {
    try {
      // After the user approves, ask the backend to capture the payment
      const response = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: data.orderID }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        if (response.status === 401) {
          router.push("/login");
          toast.error("You must be logged in to purchase a plan.");
          throw new Error(result.error || "Unauthorized");
        }
        throw new Error(result.error || "Failed to capture payment");
      }

      // Handle the pending state (3D Secure, risk review, etc.)
      if (result.data?.pending) {
        toast.info(
          result.data.message ||
            "Your payment is being processed. Please check back in a moment.",
          { duration: 5000 }
        );
        onSuccess?.(result.data);
        return;
      }

      // Payment success callback
      onSuccess?.(result.data);
    } catch (error) {
      console.error("[PayPal] Capture error:", error);
      const message = error instanceof Error ? error.message : "Payment failed";
      toast.error(message);
      throw error;
    }
  }

  function handleError(err: Record<string, unknown>): void {
    console.error("[PayPal] Button error:", err);
  }

  function handleCancel(): void {
    console.log("[PayPal] Payment cancelled by user");
  }

  return (
    <PayPalScriptProvider options={options}>
      <PayPalButtons
        style={{ layout: "vertical", label: "pay" }}
        createOrder={handleCreateOrder}
        onApprove={handleApprove}
        onError={handleError}
        onCancel={handleCancel}
      />
    </PayPalScriptProvider>
  );
}
