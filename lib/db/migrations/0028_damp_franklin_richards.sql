CREATE TABLE "user_activity_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"feature" varchar(80) NOT NULL,
	"action" varchar(100) NOT NULL,
	"outcome" varchar(24) NOT NULL,
	"resource_type" varchar(80),
	"resource_id" text,
	"duration_ms" integer,
	"issue_fingerprint" varchar(80),
	"metadata_jsonb" jsonb DEFAULT '{}' NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_activity_events" ADD CONSTRAINT "user_activity_events_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_user_activity_events_user_occurred_at" ON "user_activity_events" USING btree ("user_id","occurred_at");--> statement-breakpoint
CREATE INDEX "idx_user_activity_events_feature_occurred_at" ON "user_activity_events" USING btree ("feature","occurred_at");--> statement-breakpoint
CREATE INDEX "idx_user_activity_events_outcome_occurred_at" ON "user_activity_events" USING btree ("outcome","occurred_at");--> statement-breakpoint
CREATE INDEX "idx_user_activity_events_issue_fingerprint" ON "user_activity_events" USING btree ("issue_fingerprint");