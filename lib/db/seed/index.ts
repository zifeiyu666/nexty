/**
 * Database Seed Script
 * 数据库种子脚本
 *
 * Seeds pricing data from TypeScript config to database.
 * Supports upsert (insert or update) operations.
 *
 * 从 TypeScript 配置文件将定价数据同步到数据库。
 * 支持 upsert（插入或更新）操作。
 *
 * Usage / 使用方法:
 * pnpm db:seed
 */

import { loadEnvConfig } from '@next/env'
import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { pricingPlanGroups, pricingPlans as pricingPlansTable } from '../schema'
import { pricingGroups, pricingPlans } from './pricing-config'

const projectDir = process.cwd()
loadEnvConfig(projectDir)

async function main() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  console.log('🌱 Seeding database...\n')
  console.log(`📦 Found ${pricingGroups.length} groups and ${pricingPlans.length} plans`)

  const client = postgres(connectionString)
  const db = drizzle(client)

  try {
    // Insert pricing_plan_groups
    console.log('\n📁 Inserting pricing plan groups...')
    for (const group of pricingGroups) {
      await db
        .insert(pricingPlanGroups)
        .values({ slug: group.slug })
        .onConflictDoNothing({ target: pricingPlanGroups.slug })

      console.log(`   ✓ Group: ${group.slug}`)
    }

    // Insert pricing_plans
    console.log('\n📋 Inserting pricing plans...')
    for (const plan of pricingPlans) {
      if (!plan.id) {
        throw new Error(`Plan "${plan.cardTitle}" is missing required id field`)
      }

      await db
        .insert(pricingPlansTable)
        .values({
          id: plan.id,
          environment: plan.environment,
          groupSlug: plan.groupSlug ?? 'default',
          cardTitle: plan.cardTitle,
          cardDescription: plan.cardDescription,
          provider: plan.provider,
          stripePriceId: plan.stripePriceId,
          stripeProductId: plan.stripeProductId,
          stripeCouponId: plan.stripeCouponId,
          creemProductId: plan.creemProductId,
          creemDiscountCode: plan.creemDiscountCode,
          enableManualInputCoupon: plan.enableManualInputCoupon ?? false,
          paymentType: plan.paymentType,
          recurringInterval: plan.recurringInterval,
          trialPeriodDays: plan.trialPeriodDays,
          price: plan.price,
          currency: plan.currency,
          displayPrice: plan.displayPrice,
          originalPrice: plan.originalPrice,
          priceSuffix: plan.priceSuffix,
          features: plan.features ?? [],
          isHighlighted: plan.isHighlighted ?? false,
          highlightText: plan.highlightText,
          buttonText: plan.buttonText,
          buttonLink: plan.buttonLink,
          displayOrder: plan.displayOrder ?? 0,
          isActive: plan.isActive ?? true,
          langJsonb: plan.langJsonb ?? {},
          benefitsJsonb: plan.benefitsJsonb ?? {},
        })
        .onConflictDoUpdate({
          target: pricingPlansTable.id,
          set: {
            environment: plan.environment,
            groupSlug: plan.groupSlug ?? 'default',
            cardTitle: plan.cardTitle,
            cardDescription: plan.cardDescription,
            provider: plan.provider,
            stripePriceId: plan.stripePriceId,
            stripeProductId: plan.stripeProductId,
            stripeCouponId: plan.stripeCouponId,
            creemProductId: plan.creemProductId,
            creemDiscountCode: plan.creemDiscountCode,
            enableManualInputCoupon: plan.enableManualInputCoupon ?? false,
            paymentType: plan.paymentType,
            recurringInterval: plan.recurringInterval,
            trialPeriodDays: plan.trialPeriodDays,
            price: plan.price,
            currency: plan.currency,
            displayPrice: plan.displayPrice,
            originalPrice: plan.originalPrice,
            priceSuffix: plan.priceSuffix,
            features: plan.features ?? [],
            isHighlighted: plan.isHighlighted ?? false,
            highlightText: plan.highlightText,
            buttonText: plan.buttonText,
            buttonLink: plan.buttonLink,
            displayOrder: plan.displayOrder ?? 0,
            isActive: plan.isActive ?? true,
            langJsonb: plan.langJsonb ?? {},
            benefitsJsonb: plan.benefitsJsonb ?? {},
          },
        })

      console.log(`   ✓ Plan: ${plan.cardTitle} (${plan.id.slice(0, 8)}...)`)
    }

    console.log('\n🎉 Database seeded successfully!')
    console.log('\nNext steps:')
    console.log('  - Edit lib/db/seed/pricing-config.ts to modify pricing')
    console.log('  - Run `pnpm db:seed` to sync changes to database')
    console.log('  - Run `pnpm db:export-pricing` to export database to config')
  } catch (error) {
    console.error('\n❌ An error occurred while seeding the database:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
