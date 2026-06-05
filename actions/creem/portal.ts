'use server';

import { getSession } from '@/lib/auth/server';
import { createCreemCustomerPortalLink } from '@/lib/creem/client';
import { db } from '@/lib/db';
import { subscriptions as subscriptionsSchema } from '@/lib/db/schema';
import { getErrorMessage } from '@/lib/error-utils';
import { and, desc, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export async function createCreemPortalSession(): Promise<void> {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    redirect('/login');
  }

  let portalUrl: string | null = null;
  try {
    // Get the user's Creem subscription to retrieve the customer ID
    const subscriptionResults = await db
      .select({
        customerId: subscriptionsSchema.customerId,
      })
      .from(subscriptionsSchema)
      .where(and(eq(subscriptionsSchema.userId, user.id), eq(subscriptionsSchema.provider, 'creem')))
      .orderBy(desc(subscriptionsSchema.createdAt))
      .limit(1);

    const subscription = subscriptionResults[0];
    const customerId = subscription.customerId;

    // Create the Creem customer portal link
    portalUrl = await createCreemCustomerPortalLink(customerId);
    console.log('portalUrl', portalUrl);

    if (!portalUrl) {
      throw new Error('Failed to create Creem portal link (URL missing).');
    }

  } catch (error) {
    console.error('Error preparing Creem portal session:', error);
    const errorMessage = getErrorMessage(error);
    redirect(`/redirect-error?message=Failed to open subscription management: ${encodeURIComponent(errorMessage)}`);
  }

  if (portalUrl) {
    redirect(portalUrl);
  } else {
    redirect(`/redirect-error?message=Failed to get portal URL after creation attempt.`);
  }
}

