ALTER TABLE "subscriptions" ALTER COLUMN "price_id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "price_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "product_id" text;