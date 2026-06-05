CREATE TABLE "pricing_plan_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pricing_plan_groups_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "pricing_plans" ADD COLUMN "group_id" uuid;--> statement-breakpoint
ALTER TABLE "pricing_plans" ADD CONSTRAINT "pricing_plans_group_id_pricing_plan_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."pricing_plan_groups"("id") ON DELETE restrict ON UPDATE no action;