-- Step 1: Drop the foreign key constraint first
ALTER TABLE "pricing_plans" DROP CONSTRAINT "pricing_plans_group_id_pricing_plan_groups_id_fk";
--> statement-breakpoint
-- Step 2: Drop the group_id column from pricing_plans (will lose this data)
ALTER TABLE "pricing_plans" DROP COLUMN "group_id";--> statement-breakpoint
-- Step 3: Drop the unique constraint on slug in pricing_plan_groups
ALTER TABLE "pricing_plan_groups" DROP CONSTRAINT "pricing_plan_groups_slug_unique";--> statement-breakpoint
-- Step 4: Drop the old primary key from pricing_plan_groups
ALTER TABLE "pricing_plan_groups" DROP CONSTRAINT "pricing_plan_groups_pkey";--> statement-breakpoint
-- Step 5: Drop the id column from pricing_plan_groups
ALTER TABLE "pricing_plan_groups" DROP COLUMN "id";--> statement-breakpoint
-- Step 6: Add slug as the new primary key in pricing_plan_groups
ALTER TABLE "pricing_plan_groups" ADD PRIMARY KEY ("slug");--> statement-breakpoint
-- Step 7: Ensure 'default' group exists in pricing_plan_groups
INSERT INTO "pricing_plan_groups" ("slug") VALUES ('default') ON CONFLICT ("slug") DO NOTHING;--> statement-breakpoint
-- Step 8: Add the new group_slug column to pricing_plans (varchar type, with default value)
ALTER TABLE "pricing_plans" ADD COLUMN "group_slug" varchar(100) NOT NULL DEFAULT 'default';--> statement-breakpoint
-- Step 9: Add the new foreign key constraint
ALTER TABLE "pricing_plans" ADD CONSTRAINT "pricing_plans_group_slug_pricing_plan_groups_slug_fk" FOREIGN KEY ("group_slug") REFERENCES "public"."pricing_plan_groups"("slug") ON DELETE restrict ON UPDATE no action;
