"use server";

import { actionResponse, ActionResult } from "@/lib/action-response";
import { getSession } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { orders as ordersSchema } from "@/lib/db/schema";
import { getErrorMessage } from "@/lib/error-utils";
import { and, count, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { z } from "zod";

const FilterSchema = z.object({
  pageIndex: z.coerce.number().default(0),
  pageSize: z.coerce.number().default(10),
  filter: z.string().optional(),
  provider: z.string().optional(),
  orderType: z.string().optional(),
  status: z.string().optional(),
});

export type GetMyOrdersResult = ActionResult<{
  orders: typeof ordersSchema.$inferSelect[];
  totalCount: number;
}>;

export async function getMyOrders(
  params: z.infer<typeof FilterSchema>
): Promise<GetMyOrdersResult> {
  const session = await getSession();
  const user = session?.user;
  if (!user) return actionResponse.unauthorized();

  try {
    const { pageIndex, pageSize, filter, provider, orderType, status } =
      FilterSchema.parse(params);

    const baseWhere = eq(ordersSchema.userId, user.id);
    const optionalConditions: SQL[] = [];
    if (provider) {
      optionalConditions.push(eq(ordersSchema.provider, provider));
    }
    if (orderType) {
      optionalConditions.push(eq(ordersSchema.orderType, orderType));
    }
    if (status) {
      optionalConditions.push(eq(ordersSchema.status, status));
    }
    if (filter) {
      optionalConditions.push(
        or(
          ilike(ordersSchema.providerOrderId, `%${filter}%`),
          sql`CAST(${ordersSchema.id} AS TEXT) ILIKE ${`%${filter}%`}`
        ) as SQL
      );
    }
    const whereClause: SQL = optionalConditions.length
      ? (and(baseWhere, ...optionalConditions) as SQL)
      : baseWhere;

    const ordersQuery = db
      .select()
      .from(ordersSchema)
      .where(whereClause)
      .orderBy(desc(ordersSchema.createdAt))
      .offset(pageIndex * pageSize)
      .limit(pageSize);

    const totalCountQuery = db
      .select({ value: count() })
      .from(ordersSchema)
      .where(whereClause);

    const [orders, totalCountResult] = await Promise.all([
      ordersQuery,
      totalCountQuery,
    ]);

    const totalCount = totalCountResult[0]?.value ?? 0;

    return actionResponse.success({ orders, totalCount });
  } catch (error) {
    console.error("Error getting my orders", error);
    return actionResponse.error(getErrorMessage(error));
  }
}


