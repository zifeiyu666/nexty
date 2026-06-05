ALTER TABLE "orders" RENAME COLUMN "subscription_provider_id" TO "subscription_id";--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "stripe_payment_intent_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "stripe_invoice_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "stripe_refund_id" text;