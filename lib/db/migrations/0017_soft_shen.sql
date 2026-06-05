ALTER TABLE "user_source" RENAME COLUMN "referral_code" TO "aff_code";--> statement-breakpoint
CREATE INDEX "idx_user_source_aff_code" ON "user_source" USING btree ("aff_code");