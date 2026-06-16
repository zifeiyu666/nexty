ALTER TABLE "credit_logs" ADD COLUMN "entitlement_delta_jsonb" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "credit_logs" ADD COLUMN "entitlement_snapshot_jsonb" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
UPDATE "usage"
SET
  "subscription_credits_balance" = 0,
  "one_time_credits_balance" = 0,
  "balance_jsonb" = jsonb_set(
    coalesce("balance_jsonb", '{}'::jsonb),
    '{entitlements}',
    jsonb_build_object(
      'subscription',
      jsonb_build_object('song', 0, 'mv', 0, 'wallArt', 0),
      'oneTime',
      jsonb_build_object('song', 0, 'mv', 0, 'wallArt', 0)
    ),
    true
  );--> statement-breakpoint
WITH latest_active_subscription AS (
  SELECT DISTINCT ON (s."user_id")
    s."user_id",
    s."plan_id"
  FROM "subscriptions" s
  WHERE
    s."status" IN ('active', 'trialing')
    AND (s."current_period_end" IS NULL OR s."current_period_end" > now())
  ORDER BY s."user_id", s."created_at" DESC
)
UPDATE "usage" u
SET "balance_jsonb" = jsonb_set(
  coalesce(u."balance_jsonb", '{}'::jsonb),
  '{entitlements}',
  jsonb_build_object(
    'subscription',
    jsonb_build_object(
      'song', coalesce((p."benefits_jsonb" #>> '{entitlements,song}')::int, 0),
      'mv', coalesce((p."benefits_jsonb" #>> '{entitlements,mv}')::int, 0),
      'wallArt', coalesce((p."benefits_jsonb" #>> '{entitlements,wallArt}')::int, 0)
    ),
    'oneTime',
    jsonb_build_object('song', 0, 'mv', 0, 'wallArt', 0)
  ),
  true
)
FROM latest_active_subscription las
JOIN "pricing_plans" p ON p."id" = las."plan_id"
WHERE u."user_id" = las."user_id";
