CREATE TYPE "public"."custom_voice_status" AS ENUM('draft', 'preparing_verification', 'awaiting_recording', 'creating', 'ready', 'failed');--> statement-breakpoint
CREATE TABLE "custom_voices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"style" varchar(300),
	"image_url" text,
	"image_key" text,
	"source_audio_url" text,
	"source_audio_key" text,
	"verification_audio_url" text,
	"verification_audio_key" text,
	"verification_task_id" text,
	"creation_task_id" text,
	"verify_text" text,
	"verify_url" text,
	"voice_id" text,
	"status" "custom_voice_status" DEFAULT 'draft' NOT NULL,
	"error" text,
	"consented_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "custom_voices" ADD CONSTRAINT "custom_voices_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_custom_voices_user_id" ON "custom_voices" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_custom_voices_status" ON "custom_voices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_custom_voices_verification_task_id" ON "custom_voices" USING btree ("verification_task_id");--> statement-breakpoint
CREATE INDEX "idx_custom_voices_creation_task_id" ON "custom_voices" USING btree ("creation_task_id");--> statement-breakpoint
