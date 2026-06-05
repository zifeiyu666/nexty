CREATE TABLE "user_source" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"referral_code" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"utm_term" text,
	"utm_content" text,
	"referrer" text,
	"referrer_domain" text,
	"landing_page" text,
	"user_agent" text,
	"browser" text,
	"browser_version" text,
	"os" text,
	"os_version" text,
	"device_type" text,
	"device_brand" text,
	"device_model" text,
	"screen_width" integer,
	"screen_height" integer,
	"language" text,
	"timezone" text,
	"ip_address" text,
	"country" text,
	"country_code" varchar(2),
	"region" text,
	"city" text,
	"continent" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_source" ADD CONSTRAINT "user_source_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_user_source_user_id" ON "user_source" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_source_utm_source" ON "user_source" USING btree ("utm_source");--> statement-breakpoint
CREATE INDEX "idx_user_source_country_code" ON "user_source" USING btree ("country_code");--> statement-breakpoint
CREATE INDEX "idx_user_source_created_at" ON "user_source" USING btree ("created_at");