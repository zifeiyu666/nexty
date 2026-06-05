'use server'

import { actionResponse, ActionResult } from '@/lib/action-response'
import { isAdmin } from '@/lib/auth/server'
import { db } from '@/lib/db'
import { pricingPlanGroups } from '@/lib/db/schema'
import { getErrorMessage } from '@/lib/error-utils'
import { SLUG_REGEX } from '@/lib/pricing/slug'
import { PricingPlanGroup } from '@/types/pricing'
import { asc, eq } from 'drizzle-orm'
import 'server-only'

/**
 * List all pricing plan groups
 */
export async function listPricingGroupsAction(): Promise<
  ActionResult<PricingPlanGroup[]>
> {
  if (!(await isAdmin())) {
    return actionResponse.forbidden('Admin privileges required.')
  }

  try {
    const groups = await db
      .select()
      .from(pricingPlanGroups)
      .orderBy(asc(pricingPlanGroups.slug))

    return actionResponse.success(groups)
  } catch (error) {
    console.error('Unexpected error in listPricingGroupsAction:', error)
    return actionResponse.error(getErrorMessage(error))
  }
}

/**
 * Create a new pricing plan group
 */
export async function createPricingGroupAction({
  slug,
}: {
  slug: string
}): Promise<ActionResult<PricingPlanGroup>> {
  if (!(await isAdmin())) {
    return actionResponse.forbidden('Admin privileges required.')
  }

  const trimmedSlug = slug.trim().toLowerCase()

  if (!trimmedSlug) {
    return actionResponse.badRequest('Group slug is required.')
  }

  if (!SLUG_REGEX.test(trimmedSlug)) {
    return actionResponse.badRequest(
      'Slug can only contain lowercase letters, numbers, and hyphens.'
    )
  }

  try {
    // Check if slug already exists (slug is now the primary key)
    const existing = await db
      .select({ slug: pricingPlanGroups.slug })
      .from(pricingPlanGroups)
      .where(eq(pricingPlanGroups.slug, trimmedSlug))
      .limit(1)

    if (existing.length > 0) {
      return actionResponse.conflict(`Group "${trimmedSlug}" already exists.`)
    }

    const [newGroup] = await db
      .insert(pricingPlanGroups)
      .values({ slug: trimmedSlug })
      .returning()

    return actionResponse.success(newGroup)
  } catch (error) {
    console.error('Unexpected error in createPricingGroupAction:', error)
    const errorMessage = getErrorMessage(error)
    if (errorMessage.includes('duplicate key value violates unique constraint')) {
      return actionResponse.conflict(`Group "${trimmedSlug}" already exists.`)
    }
    return actionResponse.error(errorMessage)
  }
}

/**
 * Delete a pricing plan group by slug
 * Note: The frontend should validate that no plans use this group before calling this action.
 * This is a safety check to prevent orphaned references.
 */
export async function deletePricingGroupAction({
  slug,
}: {
  slug: string
}): Promise<ActionResult<{ message: string }>> {
  if (!(await isAdmin())) {
    return actionResponse.forbidden('Admin privileges required.')
  }

  if (!slug) {
    return actionResponse.badRequest('Group slug is required.')
  }

  // Prevent deletion of the default group
  if (slug === 'default') {
    return actionResponse.badRequest('Cannot delete the default group.')
  }

  try {
    // Check if group exists
    const group = await db
      .select()
      .from(pricingPlanGroups)
      .where(eq(pricingPlanGroups.slug, slug))
      .limit(1)

    if (group.length === 0) {
      return actionResponse.notFound('Group not found.')
    }

    // Delete the group (the foreign key constraint will prevent deletion if plans exist)
    const result = await db
      .delete(pricingPlanGroups)
      .where(eq(pricingPlanGroups.slug, slug))
      .returning({ slug: pricingPlanGroups.slug })

    if (result.length === 0) {
      return actionResponse.notFound('Group not found.')
    }

    return actionResponse.success({ message: 'Group deleted successfully.' })
  } catch (error) {
    console.error('Unexpected error in deletePricingGroupAction:', error)
    const errorMessage = getErrorMessage(error)
    if (errorMessage.includes('violates foreign key constraint')) {
      return actionResponse.badRequest(
        'Cannot delete group as it has associated pricing plans.'
      )
    }
    return actionResponse.error(errorMessage)
  }
}
