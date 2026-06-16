CREATE TABLE "songs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"source_sample_id" text NOT NULL,
	"selected_version_id" text NOT NULL,
	"title" text NOT NULL,
	"lyrics" text NOT NULL,
	"genre" text NOT NULL,
	"occasion" text NOT NULL,
	"language" text NOT NULL,
	"vocal_gender" text NOT NULL,
	"recipient_names_jsonb" jsonb DEFAULT '[]' NOT NULL,
	"story" text NOT NULL,
	"audio_url" text NOT NULL,
	"image_url" text,
	"duration" integer,
	"status" text DEFAULT 'ready' NOT NULL,
	"share_token" text NOT NULL,
	"share_enabled" boolean DEFAULT true NOT NULL,
	"shared_at" timestamp with time zone DEFAULT now(),
	"wall_art_jsonb" jsonb DEFAULT '{}' NOT NULL,
	"mv_jsonb" jsonb DEFAULT '{}' NOT NULL,
	"metadata_jsonb" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "songs_share_token_unique" UNIQUE("share_token"),
	CONSTRAINT "idx_songs_user_sample_version_unique" UNIQUE("user_id","source_sample_id","selected_version_id")
);
--> statement-breakpoint
ALTER TABLE "songs" ADD CONSTRAINT "songs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_songs_user_id" ON "songs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_songs_source_sample_id" ON "songs" USING btree ("source_sample_id");--> statement-breakpoint
CREATE INDEX "idx_songs_share_token" ON "songs" USING btree ("share_token");--> statement-breakpoint
CREATE INDEX "idx_songs_created_at" ON "songs" USING btree ("created_at");
