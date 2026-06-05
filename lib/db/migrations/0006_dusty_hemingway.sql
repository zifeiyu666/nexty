ALTER TABLE "posts" ALTER COLUMN "post_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "post_type" SET DEFAULT 'blog'::text;--> statement-breakpoint
ALTER TABLE "tags" ALTER COLUMN "post_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "tags" ALTER COLUMN "post_type" SET DEFAULT 'blog'::text;--> statement-breakpoint
DROP TYPE "public"."post_type";--> statement-breakpoint
CREATE TYPE "public"."post_type" AS ENUM('blog');--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "post_type" SET DEFAULT 'blog'::"public"."post_type";--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "post_type" SET DATA TYPE "public"."post_type" USING "post_type"::"public"."post_type";--> statement-breakpoint
ALTER TABLE "tags" ALTER COLUMN "post_type" SET DEFAULT 'blog'::"public"."post_type";--> statement-breakpoint
ALTER TABLE "tags" ALTER COLUMN "post_type" SET DATA TYPE "public"."post_type" USING "post_type"::"public"."post_type";