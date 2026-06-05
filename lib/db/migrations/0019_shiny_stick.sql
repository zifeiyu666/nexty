ALTER TABLE "tags" DROP CONSTRAINT "tags_name_unique";--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_name_post_type_unique" UNIQUE("name","post_type");