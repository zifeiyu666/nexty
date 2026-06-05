"use client";

import { buildPayPalOptions } from "@/lib/paypal/script-options";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

interface PayPalProviderProps {
  children: React.ReactNode;
  /**
   * Payment mode:
   * - "one_time": one-time payment, intent=capture
   * - "subscription": subscription, intent=subscription + vault=true
   * - "both": support both (vault=true, intent decided by each button)
   */
  mode?: "one_time" | "subscription" | "both";
}

/**
 * Optional global PayPal SDK provider.
 *
 * Note: PayPalCheckoutButton already wraps itself in a PayPalScriptProvider, so
 * mounting this globally is only needed if you render raw <PayPalButtons /> in
 * multiple places. It renders children unchanged when PayPal is disabled.
 */
export function PayPalProvider({ children, mode = "both" }: PayPalProviderProps) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const isEnabled = process.env.NEXT_PUBLIC_ENABLE_PAYPAL === "true";

  // If PayPal is not configured, render the children unchanged
  if (!clientId || !isEnabled) return <>{children}</>;

  const options = buildPayPalOptions();

  if (mode === "one_time") {
    // Pure one-time payment: no vault needed
    options.intent = "capture";
  } else if (mode === "subscription") {
    // Pure subscription: must use vault + subscription intent
    options.intent = "subscription";
    options.vault = true;
  } else {
    // both: support one-time and subscription at the same time.
    // vault=true allows subscriptions; intent is left unset so each
    // PayPalButtons component can specify its own.
    options.vault = true;
  }

  return (
    <PayPalScriptProvider options={options}>{children}</PayPalScriptProvider>
  );
}
