"use server";

import type { ActionResult } from '@/lib/action-response';
import { actionResponse } from '@/lib/action-response';
import { isAdmin } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { session as sessionSchema, user as userSchema, userSource as userSourceSchema } from '@/lib/db/schema';
import { getErrorMessage } from '@/lib/error-utils';
import { count, desc, eq, ilike, or } from 'drizzle-orm';

type UserType = typeof userSchema.$inferSelect;

// Extended user type with fields from userSource
export type UserWithSource = UserType & {
  affCode?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
  referrer?: string | null;
  countryCode?: string | null;
  browser?: string | null;
  os?: string | null;
  deviceType?: string | null;
  deviceBrand?: string | null;
  deviceModel?: string | null;
  language?: string | null;
};

export interface GetUsersResult {
  success: boolean;
  data?: {
    users: UserWithSource[];
    totalCount: number;
  };
  error?: string;
}

const DEFAULT_PAGE_SIZE = 20;

export async function getUsers({
  pageIndex = 0,
  pageSize = DEFAULT_PAGE_SIZE,
  filter = "",
}: {
  pageIndex?: number;
  pageSize?: number;
  filter?: string;
}): Promise<GetUsersResult> {
  if (!(await isAdmin())) {
    return actionResponse.forbidden('Admin privileges required.');
  }

  try {
    const conditions = [];
    if (filter) {
      conditions.push(
        or(
          ilike(userSchema.email, `%${filter}%`),
          ilike(userSchema.name, `%${filter}%`)
        )
      );
    }

    // Query users with left join to userSource for source tracking fields
    const usersQuery = db
      .select({
        // User fields
        id: userSchema.id,
        email: userSchema.email,
        emailVerified: userSchema.emailVerified,
        name: userSchema.name,
        image: userSchema.image,
        role: userSchema.role,
        isAnonymous: userSchema.isAnonymous,
        referral: userSchema.referral,
        stripeCustomerId: userSchema.stripeCustomerId,
        banned: userSchema.banned,
        banReason: userSchema.banReason,
        banExpires: userSchema.banExpires,
        createdAt: userSchema.createdAt,
        updatedAt: userSchema.updatedAt,
        // UserSource fields
        affCode: userSourceSchema.affCode,
        utmSource: userSourceSchema.utmSource,
        utmMedium: userSourceSchema.utmMedium,
        utmCampaign: userSourceSchema.utmCampaign,
        utmTerm: userSourceSchema.utmTerm,
        utmContent: userSourceSchema.utmContent,
        referrer: userSourceSchema.referrer,
        countryCode: userSourceSchema.countryCode,
        browser: userSourceSchema.browser,
        os: userSourceSchema.os,
        deviceType: userSourceSchema.deviceType,
        deviceBrand: userSourceSchema.deviceBrand,
        deviceModel: userSourceSchema.deviceModel,
        language: userSourceSchema.language,
      })
      .from(userSchema)
      .leftJoin(userSourceSchema, eq(userSchema.id, userSourceSchema.userId))
      .where(conditions.length > 0 ? or(...conditions) : undefined)
      .orderBy(desc(userSchema.createdAt))
      .offset(pageIndex * pageSize)
      .limit(pageSize);

    const totalCountQuery = db
      .select({ value: count() })
      .from(userSchema)
      .where(conditions.length > 0 ? or(...conditions) : undefined);

    const [results, totalCountResult] = await Promise.all([
      usersQuery,
      totalCountQuery,
    ]);

    const totalCount = totalCountResult[0].value;

    return actionResponse.success({
      users: results as UserWithSource[] || [],
      totalCount: totalCount,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return actionResponse.error(getErrorMessage(error));
  }
}

export async function banUser({
  userId,
  reason,
}: {
  userId: string;
  reason?: string;
}): Promise<ActionResult> {
  if (!(await isAdmin())) {
    return actionResponse.forbidden('Admin privileges required.');
  }

  try {
    const target = await db
      .select({ id: userSchema.id, role: userSchema.role })
      .from(userSchema)
      .where(eq(userSchema.id, userId))
      .limit(1);

    if (target.length === 0) {
      return actionResponse.notFound('User not found.');
    }

    if (target[0].role === 'admin') {
      return actionResponse.forbidden('Cannot ban admin users.');
    }

    await db
      .update(userSchema)
      .set({ banned: true, banReason: reason ?? 'Banned by admin', banExpires: null })
      .where(eq(userSchema.id, userId));

    // Revoke all sessions for this user to enforce immediate logout
    await db.delete(sessionSchema).where(eq(sessionSchema.userId, userId));

    return actionResponse.success();
  } catch (error: any) {
    return actionResponse.error(getErrorMessage(error));
  }
}

export async function unbanUser({
  userId,
}: {
  userId: string;
}): Promise<ActionResult> {
  if (!(await isAdmin())) {
    return actionResponse.forbidden('Admin privileges required.');
  }

  try {
    const target = await db
      .select({ id: userSchema.id })
      .from(userSchema)
      .where(eq(userSchema.id, userId))
      .limit(1);

    if (target.length === 0) {
      return actionResponse.notFound('User not found.');
    }

    await db
      .update(userSchema)
      .set({ banned: false, banReason: null, banExpires: null })
      .where(eq(userSchema.id, userId));

    return actionResponse.success();
  } catch (error: any) {
    return actionResponse.error(getErrorMessage(error));
  }
}