/**
 * Database Export Script
 * 数据库导出脚本
 *
 * Exports current pricing data from database to pricing-config.ts
 * 从数据库导出当前定价数据到 pricing-config.ts
 *
 * Usage / 使用方法:
 * pnpm db:export-pricing
 */

import { loadEnvConfig } from '@next/env'
import 'dotenv/config'
import type { InferSelectModel } from 'drizzle-orm'
import { asc } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as fs from 'fs'
import * as path from 'path'
import postgres from 'postgres'
import {
  pricingPlanGroups,
  pricingPlans as pricingPlansTable,
} from '../schema'

const projectDir = process.cwd()
loadEnvConfig(projectDir)

// Types derived from schema
type DbPricingPlanGroup = InferSelectModel<typeof pricingPlanGroups>
type DbPricingPlan = InferSelectModel<typeof pricingPlansTable>

function toTypeScriptValue(value: unknown, indent: number = 2): string {
  const spaces = ' '.repeat(indent)
  const innerSpaces = ' '.repeat(indent + 2)

  if (value === null || value === undefined) {
    return 'null'
  }

  if (typeof value === 'string') {
    // Escape single quotes and use single quotes for strings
    const escaped = value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
    return `'${escaped}'`
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    const items = value.map(item => toTypeScriptValue(item, indent + 2))
    return `[\n${innerSpaces}${items.join(`,\n${innerSpaces}`)},\n${spaces}]`
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) return '{}'
    const items = entries.map(
      ([k, v]) => `${k}: ${toTypeScriptValue(v, indent + 2)}`
    )
    return `{\n${innerSpaces}${items.join(`,\n${innerSpaces}`)},\n${spaces}}`
  }

  return String(value)
}

function convertPlanToConfig(plan: DbPricingPlan): string {
  const lines: string[] = []
  const indent = '    '

  lines.push('  {')
  lines.push(`${indent}id: '${plan.id}',`)
  lines.push(`${indent}environment: '${plan.environment}',`)
  lines.push(`${indent}groupSlug: '${plan.groupSlug}',`)
  lines.push(`${indent}cardTitle: '${plan.cardTitle.replace(/'/g, "\\'")}',`)

  if (plan.cardDescription) {
    lines.push(`${indent}cardDescription: '${plan.cardDescription.replace(/'/g, "\\'")}',`)
  } else {
    lines.push(`${indent}cardDescription: null,`)
  }

  lines.push(`${indent}provider: '${plan.provider || 'none'}',`)

  // Stripe fields
  if (plan.stripePriceId) {
    lines.push(`${indent}stripePriceId: '${plan.stripePriceId}',`)
  }
  if (plan.stripeProductId) {
    lines.push(`${indent}stripeProductId: '${plan.stripeProductId}',`)
  }
  if (plan.stripeCouponId) {
    lines.push(`${indent}stripeCouponId: '${plan.stripeCouponId}',`)
  }
  if (plan.enableManualInputCoupon) {
    lines.push(`${indent}enableManualInputCoupon: ${plan.enableManualInputCoupon},`)
  }

  // Creem fields
  if (plan.creemProductId) {
    lines.push(`${indent}creemProductId: '${plan.creemProductId}',`)
  }
  if (plan.creemDiscountCode) {
    lines.push(`${indent}creemDiscountCode: '${plan.creemDiscountCode}',`)
  }

  // Payment fields
  if (plan.paymentType) {
    lines.push(`${indent}paymentType: '${plan.paymentType}',`)
  } else {
    lines.push(`${indent}paymentType: null,`)
  }
  if (plan.recurringInterval) {
    lines.push(`${indent}recurringInterval: '${plan.recurringInterval}',`)
  } else {
    lines.push(`${indent}recurringInterval: null,`)
  }
  if (plan.trialPeriodDays) {
    lines.push(`${indent}trialPeriodDays: ${plan.trialPeriodDays},`)
  }

  // Price fields
  lines.push(`${indent}price: '${plan.price || '0'}',`)
  if (plan.currency) {
    lines.push(`${indent}currency: '${plan.currency}',`)
  } else {
    lines.push(`${indent}currency: null,`)
  }
  if (plan.displayPrice) {
    lines.push(`${indent}displayPrice: '${plan.displayPrice}',`)
  }
  if (plan.originalPrice) {
    lines.push(`${indent}originalPrice: '${plan.originalPrice}',`)
  }
  if (plan.priceSuffix) {
    lines.push(`${indent}priceSuffix: '${plan.priceSuffix}',`)
  }

  // Features
  lines.push(`${indent}features: ${toTypeScriptValue(plan.features, 4)},`)

  // Display fields
  lines.push(`${indent}isHighlighted: ${plan.isHighlighted},`)
  if (plan.highlightText) {
    lines.push(`${indent}highlightText: '${plan.highlightText.replace(/'/g, "\\'")}',`)
  }
  if (plan.buttonText) {
    lines.push(`${indent}buttonText: '${plan.buttonText.replace(/'/g, "\\'")}',`)
  }
  if (plan.buttonLink) {
    lines.push(`${indent}buttonLink: '${plan.buttonLink}',`)
  }
  lines.push(`${indent}displayOrder: ${plan.displayOrder},`)
  lines.push(`${indent}isActive: ${plan.isActive},`)

  // Lang JSON
  if (plan.langJsonb && Object.keys(plan.langJsonb as object).length > 0) {
    lines.push(`${indent}langJsonb: ${toTypeScriptValue(plan.langJsonb, 4)},`)
  }

  // Benefits JSON
  if (plan.benefitsJsonb && Object.keys(plan.benefitsJsonb as object).length > 0) {
    lines.push(`${indent}benefitsJsonb: ${toTypeScriptValue(plan.benefitsJsonb, 4)},`)
  } else {
    lines.push(`${indent}benefitsJsonb: {},`)
  }

  lines.push('  },')

  return lines.join('\n')
}

async function main() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  console.log('Exporting pricing data from database...')

  const client = postgres(connectionString)
  const db = drizzle(client)

  try {
    // Fetch groups using Drizzle ORM
    const groups: DbPricingPlanGroup[] = await db
      .select()
      .from(pricingPlanGroups)
      .orderBy(asc(pricingPlanGroups.createdAt))

    // Fetch plans using Drizzle ORM
    const plans: DbPricingPlan[] = await db
      .select()
      .from(pricingPlansTable)
      .orderBy(asc(pricingPlansTable.groupSlug), asc(pricingPlansTable.displayOrder))

    console.log(`Found ${groups.length} groups and ${plans.length} plans`)

    // Generate TypeScript file content
    const configContent = `/**
 * Pricing Configuration File
 * 定价配置文件
 *
 * This file serves as the single source of truth for pricing plans.
 * AI can edit this file directly, then run \`pnpm db:seed\` to sync to database.
 *
 * 此文件作为定价计划的单一真相来源。
 * AI 可以直接编辑此文件，然后运行 \`pnpm db:seed\` 同步到数据库。
 *
 * Usage / 使用方法:
 * 1. Edit this file to add/update/remove pricing plans
 * 2. Run \`pnpm db:seed\` to sync changes to database
 * 3. Run \`pnpm db:export-pricing\` to export current database state back to this file
 *
 * Type Safety / 类型安全:
 * Types are derived from database schema (lib/db/schema.ts).
 * If schema changes, TypeScript will catch any mismatches.
 * 类型从数据库 schema 推导，如果 schema 变更，TypeScript 会捕获不匹配的错误。
 *
 * Auto-generated at: ${new Date().toISOString()}
 */

import type { InferInsertModel } from 'drizzle-orm'
import { pricingPlans as pricingPlansTable, pricingPlanGroups as pricingPlanGroupsTable } from '../schema'

// ============================================================================
// Type Definitions - Derived from Schema / 类型定义 - 从 Schema 推导
// ============================================================================

/**
 * Pricing Plan Config type derived from database schema.
 * Omit auto-generated fields (createdAt, updatedAt).
 *
 * 从数据库 schema 推导的定价计划配置类型。
 * 排除自动生成的字段（createdAt, updatedAt）。
 */
export type PricingPlanConfig = Omit<
  InferInsertModel<typeof pricingPlansTable>,
  'createdAt' | 'updatedAt'
>

/**
 * Pricing Group Config type derived from database schema.
 *
 * 从数据库 schema 推导的定价分组配置类型。
 */
export type PricingGroupConfig = Omit<
  InferInsertModel<typeof pricingPlanGroupsTable>,
  'createdAt'
>

// ============================================================================
// Helper Types for JSONB Fields / JSONB 字段的辅助类型
// ============================================================================

/**
 * Feature item structure for the features JSONB field.
 * 功能项结构，用于 features JSONB 字段。
 */
export interface PricingFeature {
  description: string
  included: boolean
  bold?: boolean
  href?: string
}

/**
 * Localized content structure for langJsonb field.
 * 多语言内容结构，用于 langJsonb 字段。
 */
export interface LocalizedPricingContent {
  cardTitle?: string
  cardDescription?: string
  displayPrice?: string
  originalPrice?: string
  priceSuffix?: string
  highlightText?: string
  buttonText?: string
  currency?: string
  features?: PricingFeature[]
}

/**
 * Benefits structure for benefitsJsonb field.
 * 权益结构，用于 benefitsJsonb 字段。
 */
export interface PricingBenefits {
  /** One-time credits granted on purchase / 购买时授予的一次性积分 */
  oneTimeCredits?: number
  /** Monthly credits for subscriptions / 订阅的月度积分 */
  monthlyCredits?: number
  /** Total months for yearly plans / 年度计划的总月数 */
  totalMonths?: number
  /** Custom fields / 自定义字段 */
  [key: string]: unknown
}

// ============================================================================
// Pricing Groups / 定价分组
// ============================================================================

export const pricingGroups: PricingGroupConfig[] = [
${groups.map(g => `  { slug: '${g.slug}' },`).join('\n')}
]

// ============================================================================
// Pricing Plans / 定价计划
// ============================================================================

export const pricingPlans: PricingPlanConfig[] = [
${plans.map(p => convertPlanToConfig(p)).join('\n')}
]
`

    // Write to file
    const outputPath = path.join(__dirname, 'pricing-config.ts')
    fs.writeFileSync(outputPath, configContent)

    console.log(`\n✅ Exported to: ${outputPath}`)
    console.log('\n🎉 Export completed successfully!')
  } catch (error) {
    console.error('Error exporting pricing data:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
