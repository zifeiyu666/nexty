import { ReactPayPalScriptOptions } from "@paypal/react-paypal-js";

const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

/**
 * Build the initialization options for the PayPal JS SDK.
 *
 * Shared configuration is centralized here to avoid scattering it across
 * components. Button components or the Provider pass `overrides` to customize
 * the parts that differ (e.g. currency, intent).
 */
export function buildPayPalOptions(
  overrides?: Partial<ReactPayPalScriptOptions>
): ReactPayPalScriptOptions {
  const options: ReactPayPalScriptOptions = {
    clientId: CLIENT_ID || "",
    currency: "USD",
    components: "buttons",
    disableFunding: "card",
    ...overrides,
  };

  return options;
}

export const PAYPAL_SCRIPT_OPTIONS = buildPayPalOptions();
