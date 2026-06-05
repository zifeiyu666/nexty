ALTER TABLE "pricing_plans" ADD COLUMN "creem_product_id" varchar(255);
ALTER TABLE "pricing_plans" ADD COLUMN "creem_discount_code" varchar(255);
ALTER TABLE "user" ADD COLUMN "creem_customer_id" text;
ALTER TABLE "user" ADD CONSTRAINT "user_creem_customer_id_unique" UNIQUE ("creem_customer_id");
ALTER TABLE "pricing_plans" ADD COLUMN "creem_price_id" varchar(255);--> statement-breakpoint
ALTER TABLE "pricing_plans" ADD COLUMN "creem_product_id" varchar(255);--> statement-breakpoint
ALTER TABLE "pricing_plans" ADD COLUMN "creem_plan_id" varchar(255);--> statement-breakpoint
ALTER TABLE "pricing_plans" ADD COLUMN "creem_coupon_id" varchar(255);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "creem_customer_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_creem_customer_id_unique" UNIQUE("creem_customer_id");