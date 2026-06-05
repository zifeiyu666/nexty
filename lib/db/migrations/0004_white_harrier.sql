UPDATE "posts" SET "published_at" = COALESCE("created_at", now()) WHERE "published_at" IS NULL;--> statement-breakpoint

ALTER TABLE "posts" ALTER COLUMN "published_at" SET DEFAULT now();--> statement-breakpoint

ALTER TABLE "posts" ALTER COLUMN "published_at" SET NOT NULL;