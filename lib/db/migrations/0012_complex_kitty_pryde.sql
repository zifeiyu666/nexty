ALTER TABLE "subscriptions" RENAME COLUMN "stripe_subscription_id" TO "subscription_id";--> statement-breakpoint
ALTER TABLE "subscriptions" RENAME COLUMN "stripe_customer_id" TO "customer_id";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_stripe_subscription_id_unique";--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "provider" "provider" NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_subscription_id_unique" UNIQUE("subscription_id");