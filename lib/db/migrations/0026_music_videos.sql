CREATE TYPE "public"."music_video_status" AS ENUM('queued', 'rendering', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "music_videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"song_id" uuid NOT NULL,
	"template_id" text NOT NULL,
	"title" text NOT NULL,
	"status" "music_video_status" DEFAULT 'queued' NOT NULL,
	"timeline_jsonb" jsonb DEFAULT '{}' NOT NULL,
	"input_props_jsonb" jsonb DEFAULT '{}' NOT NULL,
	"render_id" text,
	"lambda_bucket_name" text,
	"lambda_output_key" text,
	"r2_key" text,
	"video_url" text,
	"thumbnail_url" text,
	"duration" integer,
	"width" integer DEFAULT 1080 NOT NULL,
	"height" integer DEFAULT 1920 NOT NULL,
	"fps" integer DEFAULT 30 NOT NULL,
	"error" text,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "music_videos" ADD CONSTRAINT "music_videos_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "music_videos" ADD CONSTRAINT "music_videos_song_id_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_music_videos_user_id" ON "music_videos" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_music_videos_song_id" ON "music_videos" USING btree ("song_id");--> statement-breakpoint
CREATE INDEX "idx_music_videos_status" ON "music_videos" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_music_videos_created_at" ON "music_videos" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_music_videos_user_song_created_at" ON "music_videos" USING btree ("user_id","song_id","created_at");
