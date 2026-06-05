ALTER TABLE "pricing_plans" ADD COLUMN "creem_product_id" varchar(255);--> statement-breakpoint
ALTER TABLE "pricing_plans" ADD COLUMN "creem_discount_code" varchar(255);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "creem_customer_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_creem_customer_id_unique" UNIQUE("creem_customer_id");