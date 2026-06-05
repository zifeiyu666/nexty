import type { orders as ordersSchema } from '@/lib/db/schema';
import type { InferInsertModel } from 'drizzle-orm';

/**
 * Order type from database schema
 */
export type Order = typeof ordersSchema.$inferSelect;

/**
 * Order data for insertion into database
 */
export type OrderInsertData = InferInsertModel<typeof ordersSchema>;

/**
 * Result of order creation
 */
export interface CreateOrderResult {
  order: { id: string } | null;
  existed: boolean;
}
