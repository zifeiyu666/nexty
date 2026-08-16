type CheckoutLike = {
  status: string;
  order: {
    status: string;
  };
};

/**
 * Creem marks a completed checkout's order as `paid`.
 *
 * `completed` remains accepted for backwards compatibility with historical
 * payloads that used that status for the order as well.
 */
export function isSuccessfulCreemCheckout(
  checkout: CheckoutLike
): boolean {
  return (
    checkout.status === 'completed' &&
    ['paid', 'completed'].includes(checkout.order.status)
  );
}
