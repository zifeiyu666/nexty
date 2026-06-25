/**
 * Shared types for payment verification
 */

import type { UnlockSongResult } from "@/lib/ai/song-unlock-after-payment";
import { PaymentProvider } from "@/lib/db/schema";

export type Provider = PaymentProvider

export type SubscriptionData = {
  id: string;
  planId: string | null;
  status: string;
  metadata: unknown;
};

export type OrderData = {
  id: string;
  metadata: unknown;
  status: string;
};

export type VerifyPaymentData = {
  message: string;
  orderId?: string;
  subscriptionId?: string;
  planId?: string | null;
  planName?: string;
  status?: string;
  unlockSong?: UnlockSongResult | null;
};
