CREATE TYPE "public"."provider" AS ENUM('stripe', 'creem');--> statement-breakpoint
ALTER TABLE "pricing_plans" ADD COLUMN "provider" "provider";