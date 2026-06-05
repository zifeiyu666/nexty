ALTER TABLE "user" DROP CONSTRAINT "user_creem_customer_id_unique";--> statement-breakpoint
CREATE INDEX "idx_subscriptions_subscription_id" ON "subscriptions" USING btree ("subscription_id");--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "creem_customer_id";