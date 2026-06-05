ALTER TYPE "public"."provider" ADD VALUE 'none' BEFORE 'stripe';
COMMIT;
ALTER TABLE "pricing_plans" ALTER COLUMN "provider" SET DEFAULT 'none';