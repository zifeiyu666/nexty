/**
 * Public feature flags that affect rendered marketing content.
 *
 * Testimonials are disabled unless explicitly enabled so review environments
 * do not accidentally expose illustrative customer quotes.
 */
export const isTestimonialsEnabled =
  process.env.NEXT_PUBLIC_TESTIMONIALS_ENABLED === "true";

/**
 * Customer reaction videos are disabled unless explicitly enabled. This keeps
 * unverifiable social-proof content out of public review environments while
 * preserving the section for future use.
 */
export const isCustomerReactionsEnabled =
  process.env.NEXT_PUBLIC_CUSTOMER_REACTIONS_ENABLED === "true";
