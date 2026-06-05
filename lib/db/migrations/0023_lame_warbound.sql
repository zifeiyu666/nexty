ALTER TYPE "public"."provider" ADD VALUE 'paypal';--> statement-breakpoint
ALTER TABLE "pricing_plans" ADD COLUMN "paypal_plan_id" varchar(255);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "paypal_payer_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_paypal_payer_id_unique" UNIQUE("paypal_payer_id");