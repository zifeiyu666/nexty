/**
 * Public feature flags that affect rendered marketing content.
 *
 * Testimonials are disabled unless explicitly enabled so review environments
 * do not accidentally expose illustrative customer quotes.
 */
export const isTestimonialsEnabled =
  process.env.NEXT_PUBLIC_TESTIMONIALS_ENABLED === "true";
