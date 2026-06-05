CREATE TYPE "public"."payment_type" AS ENUM('one_time', 'onetime', 'recurring');--> statement-breakpoint
CREATE TYPE "public"."recurring_interval" AS ENUM('month', 'year', 'every-month', 'every-year', 'once');--> statement-breakpoint
-- Update empty strings and invalid values to NULL before converting to enum
UPDATE "pricing_plans" SET "payment_type" = NULL WHERE "payment_type" = '' OR "payment_type" IS NULL;--> statement-breakpoint
UPDATE "pricing_plans" SET "recurring_interval" = NULL WHERE "recurring_interval" = '' OR "recurring_interval" = '-' OR "recurring_interval" IS NULL;--> statement-breakpoint
ALTER TABLE "pricing_plans" ALTER COLUMN "payment_type" SET DATA TYPE "public"."payment_type" USING CASE WHEN "payment_type" IN ('one_time', 'onetime', 'recurring') THEN "payment_type"::"public"."payment_type" ELSE NULL END;--> statement-breakpoint
ALTER TABLE "pricing_plans" ALTER COLUMN "recurring_interval" SET DATA TYPE "public"."recurring_interval" USING CASE WHEN "recurring_interval" IN ('month', 'year', 'every-month', 'every-year', 'once') THEN "recurring_interval"::"public"."recurring_interval" ELSE NULL END;