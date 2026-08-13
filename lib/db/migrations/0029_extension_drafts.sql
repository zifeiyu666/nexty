CREATE TABLE "extension_drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" uuid NOT NULL,
	"occasion" varchar(120) NOT NULL,
	"recipient_name" varchar(80) NOT NULL,
	"relationship" varchar(80),
	"story" text NOT NULL,
	"genre" varchar(120) NOT NULL,
	"language" varchar(8) DEFAULT 'en' NOT NULL,
	"source" varchar(40) DEFAULT 'browser-extension' NOT NULL,
	"campaign" varchar(80),
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "extension_drafts_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE INDEX "idx_extension_drafts_token" ON "extension_drafts" USING btree ("token");
--> statement-breakpoint
CREATE INDEX "idx_extension_drafts_expires_at" ON "extension_drafts" USING btree ("expires_at");
