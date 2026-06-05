/**
 * Pricing Configuration File
 * 定价配置文件
 *
 * This file serves as the single source of truth for pricing plans.
 * AI can edit this file directly, then run `pnpm db:seed` to sync to database.
 *
 * 此文件作为定价计划的单一真相来源。
 * AI 可以直接编辑此文件，然后运行 `pnpm db:seed` 同步到数据库。
 *
 * Usage / 使用方法:
 * 1. Edit this file to add/update/remove pricing plans
 * 2. Run `pnpm db:seed` to sync changes to database
 * 3. Run `pnpm db:export-pricing` to export current database state back to this file
 *
 * Type Safety / 类型安全:
 * Types are derived from database schema (lib/db/schema.ts).
 * If schema changes, TypeScript will catch any mismatches.
 * 类型从数据库 schema 推导，如果 schema 变更，TypeScript 会捕获不匹配的错误。
 *
 * Auto-generated at: 2025-12-30T04:02:42.809Z
 */

import type { InferInsertModel } from 'drizzle-orm'
import { pricingPlanGroups as pricingPlanGroupsTable, pricingPlans as pricingPlansTable } from '../schema'

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
  { slug: 'default' },
  { slug: 'monthly' },
  { slug: 'onetime' },
  { slug: 'no-payment' },
  { slug: 'annual' },
]

// ============================================================================
// Pricing Plans / 定价计划
// ============================================================================

export const pricingPlans: PricingPlanConfig[] = [
  {
    id: '19ce176f-d89a-4838-afe7-35c951d150c2',
    environment: 'test',
    groupSlug: 'annual',
    cardTitle: 'Annual Plan',
    cardDescription: '[Test] Annual subscription, no credits scenario.',
    provider: 'stripe',
    stripePriceId: 'price_1RmRDIInsTsiNJR5nGIIDCXw',
    stripeProductId: 'prod_ShqvpEkgBN1Sbb',
    stripeCouponId: '123',
    paymentType: 'recurring',
    recurringInterval: 'year',
    price: '99',
    currency: 'USD',
    displayPrice: '$99.00',
    priceSuffix: 'yearly',
    features: [
      {
        bold: true,
        href: '',
        included: true,
        description: 'All-Access Pass',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'No per-use charges or hidden fees',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'Cancel anytime',
      },
    ],
    isHighlighted: false,
    buttonText: 'Get Common Version',
    buttonLink: 'https://nexty.dev/#pricing',
    displayOrder: 3,
    isActive: true,
    langJsonb: {
      en: {
        features: [
          {
            bold: true,
            included: true,
            description: 'All-Access Pass',
          },
          {
            bold: false,
            included: true,
            description: 'No per-use charges or hidden fees',
          },
          {
            bold: false,
            included: true,
            description: 'Cancel anytime',
          },
        ],
        cardTitle: 'Annual Plan',
        buttonText: 'Get Common Version',
        priceSuffix: 'yearly',
        displayPrice: '$99.00',
        highlightText: '',
        originalPrice: '',
        cardDescription: '[Test] Annual subscription, no credits scenario.',
      },
      ja: {
        features: [
          {
            bold: true,
            included: true,
            description: 'すべての機能を利用可能',
          },
          {
            bold: false,
            included: true,
            description: '従量課金・隠れコストなし',
          },
          {
            bold: false,
            included: true,
            description: 'いつでも解約可能',
          },
        ],
        cardTitle: '年額プラン',
        buttonText: '通常版を申し込む',
        priceSuffix: '年',
        displayPrice: '$99.00',
        highlightText: '',
        originalPrice: '',
        cardDescription: '［テスト］年額サブスクリプション、クレジット不要。',
      },
      zh: {
        features: [
          {
            bold: true,
            included: true,
            description: '全功能访问权限',
          },
          {
            bold: false,
            included: true,
            description: '无按次收费或隐藏费用',
          },
          {
            bold: false,
            included: true,
            description: '随时可取消',
          },
        ],
        cardTitle: '年度计划',
        buttonText: '获取通用版',
        priceSuffix: '每年',
        displayPrice: '$99.00',
        highlightText: '',
        originalPrice: '',
        cardDescription: '[测试] 按年订阅，无额度限制。',
      },
    },
    benefitsJsonb: {},
  },
  {
    id: '33ba5f54-b997-48fb-ab6f-88e3bf023cac',
    environment: 'test',
    groupSlug: 'annual',
    cardTitle: 'Annual Credits Plan',
    cardDescription: '[Test] Annual subscription, credits scenario.',
    provider: 'stripe',
    stripePriceId: 'price_1RmRDIInsTsiNJR5sn3gyyoQ',
    stripeProductId: 'prod_ShqvpEkgBN1Sbb',
    paymentType: 'recurring',
    recurringInterval: 'year',
    price: '199',
    currency: 'USD',
    displayPrice: '$199.00',
    priceSuffix: 'yearly',
    features: [
      {
        bold: true,
        href: '',
        included: true,
        description: '1000 credits per month',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'Full access at no extra cost',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'Cancel or upgrade anytime',
      },
    ],
    isHighlighted: true,
    highlightText: 'Best Value',
    buttonText: 'Get Credits Version',
    buttonLink: 'https://nexty.dev/#pricing',
    displayOrder: 4,
    isActive: true,
    langJsonb: {
      en: {
        features: [
          {
            bold: true,
            included: true,
            description: '1000 credits per month',
          },
          {
            bold: false,
            included: true,
            description: 'Full access at no extra cost',
          },
          {
            bold: false,
            included: true,
            description: 'Cancel or upgrade anytime',
          },
        ],
        cardTitle: 'Annual Credits Plan',
        buttonText: 'Get Credits Version',
        priceSuffix: 'yearly',
        displayPrice: '$199.00',
        highlightText: 'Best Value',
        originalPrice: '',
        cardDescription: '[Test] Annual subscription, credits scenario.',
      },
      ja: {
        features: [
          {
            bold: true,
            included: true,
            description: '毎月1,000クレジット',
          },
          {
            bold: false,
            included: true,
            description: '追加料金なしで全機能利用',
          },
          {
            bold: false,
            included: true,
            description: 'いつでも解約・アップグレード可能',
          },
        ],
        cardTitle: '年間クレジットプラン',
        buttonText: 'クレジット版を申し込む',
        priceSuffix: '年',
        displayPrice: '$199.00',
        highlightText: '最もお得',
        originalPrice: '',
        cardDescription: '［テスト］年額サブスクリプション、クレジット付与プラン。',
      },
      zh: {
        features: [
          {
            bold: true,
            included: true,
            description: '每月 1000 额度',
          },
          {
            bold: false,
            included: true,
            description: '全功能访问，无额外费用',
          },
          {
            bold: false,
            included: true,
            description: '随时取消或升级',
          },
        ],
        cardTitle: '年度额度计划',
        buttonText: '获取额度版',
        priceSuffix: '每年',
        displayPrice: '$199.00',
        highlightText: '性价比最高',
        originalPrice: '',
        cardDescription: '[测试] 按年订阅，额度方案。',
      },
    },
    benefitsJsonb: {
      totalMonths: 12,
      monthlyCredits: 1000,
    },
  },
  {
    id: '0f9c8e3b-db74-4de8-bbb4-672dd1a3ff7e',
    environment: 'test',
    groupSlug: 'monthly',
    cardTitle: 'Monthly Plan',
    cardDescription: null,
    provider: 'stripe',
    stripePriceId: 'price_1REnJGInsTsiNJR5m3YTCh0b',
    stripeProductId: 'prod_S95UdH9Cq5abtk',
    paymentType: 'recurring',
    recurringInterval: 'month',
    price: '9.9',
    currency: 'USD',
    displayPrice: '$9.90',
    priceSuffix: 'month',
    features: [
      {
        bold: true,
        href: '',
        included: true,
        description: 'All-Access Pass',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'No per-use charges or hidden fees',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'Cancel anytime',
      },
    ],
    isHighlighted: true,
    highlightText: 'Stripe Plan',
    buttonText: 'Get Stripe Version',
    displayOrder: 3,
    isActive: true,
    langJsonb: {
      en: {
        currency: 'usd',
        features: [
          {
            bold: true,
            href: '',
            included: true,
            description: 'All-Access Pass',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'No per-use charges or hidden fees',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'Cancel anytime',
          },
        ],
        cardTitle: 'Monthly Plan',
        buttonText: 'Get Stripe Version',
        priceSuffix: 'month',
        displayPrice: '$9.90',
        highlightText: 'Stripe Plan',
        originalPrice: '',
        cardDescription: '',
      },
      ja: {
        currency: 'usd',
        features: [
          {
            bold: true,
            href: '',
            included: true,
            description: '全アクセスパス',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '使用料や隠れた手数料はなし',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'いつでもキャンセル可能',
          },
        ],
        cardTitle: '月額プラン',
        buttonText: 'Stripeバージョンを取得',
        priceSuffix: '月',
        displayPrice: '$9.90',
        highlightText: 'Stripeプラン',
        originalPrice: '',
        cardDescription: '',
      },
      zh: {
        currency: 'usd',
        features: [
          {
            bold: true,
            href: '',
            included: true,
            description: '全部功能的权限',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '没有按使用收费或隐藏费用',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '随时取消',
          },
        ],
        cardTitle: '月度计划',
        buttonText: '获取Stripe版本',
        priceSuffix: '每月',
        displayPrice: '$9.90',
        highlightText: 'Stripe计划',
        originalPrice: '',
        cardDescription: '',
      },
    },
    benefitsJsonb: {
      monthlyCredits: 500,
    },
  },
  {
    id: 'caa8be4e-dcb2-405a-8ec9-da8e12e93912',
    environment: 'test',
    groupSlug: 'monthly',
    cardTitle: 'Monthly Plan',
    cardDescription: null,
    provider: 'creem',
    creemProductId: 'prod_41izeM5t7E6V5NgodCVOWM',
    creemDiscountCode: 'BF2025',
    paymentType: 'recurring',
    recurringInterval: 'every-month',
    price: '19',
    currency: 'USD',
    displayPrice: '$19.00',
    priceSuffix: 'month',
    features: [
      {
        bold: true,
        href: '',
        included: true,
        description: 'All-Access Pass',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'No per-use charges or hidden fees',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'Cancel anytime',
      },
    ],
    isHighlighted: false,
    highlightText: 'Creem Plan',
    buttonText: 'Get Creem Version',
    displayOrder: 3,
    isActive: true,
    langJsonb: {
      en: {
        currency: 'USD',
        features: [
          {
            bold: true,
            href: '',
            included: true,
            description: 'All-Access Pass',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'No per-use charges or hidden fees',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'Cancel anytime',
          },
        ],
        cardTitle: 'Monthly Plan',
        buttonText: 'Get Creem Version',
        priceSuffix: 'month',
        displayPrice: '$19.00',
        highlightText: 'Creem Plan',
        originalPrice: '',
        cardDescription: '',
      },
      ja: {
        currency: 'USD',
        features: [
          {
            bold: true,
            href: '',
            included: true,
            description: '全アクセスパス',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '使用料や隠れた手数料はなし',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'いつでもキャンセル可能',
          },
        ],
        cardTitle: '月額プラン',
        buttonText: 'Creemバージョンを取得',
        priceSuffix: '月',
        displayPrice: '$19.00',
        highlightText: 'Creemプラン',
        originalPrice: '',
        cardDescription: '',
      },
      zh: {
        currency: 'USD',
        features: [
          {
            bold: true,
            href: '',
            included: true,
            description: '全访问通行证',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '没有按使用收费或隐藏费用',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '随时取消',
          },
        ],
        cardTitle: '月度计划',
        buttonText: '获取Creem版本',
        priceSuffix: '月',
        displayPrice: '$19.00',
        highlightText: 'Creem计划',
        originalPrice: '',
        cardDescription: '',
      },
    },
    benefitsJsonb: {
      monthlyCredits: 500,
    },
  },
  {
    id: 'df9be754-0f09-4289-9ef6-25323353dce0',
    environment: 'test',
    groupSlug: 'no-payment',
    cardTitle: 'Internal Link',
    cardDescription: 'Next.js SaaS starter template for developers and product managers.',
    provider: 'none',
    paymentType: null,
    recurringInterval: null,
    price: '0',
    currency: null,
    displayPrice: '$128.00',
    originalPrice: '$256.00',
    priceSuffix: '/lifetime',
    features: [
      {
        bold: false,
        href: '',
        included: true,
        description: 'Analytics & Ads',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'Email Newsletter',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'Internationalization',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'Database',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'Dynamic Blog(CMS)',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'Static Blog',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'Authentication',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'Payment',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'AI',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'File Storage',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'Admin Dashboard',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'Lifetime license',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: '24/7 Email Support',
      },
    ],
    isHighlighted: false,
    highlightText: 'Best Value',
    buttonText: 'Get Pro Version',
    buttonLink: '/blog',
    displayOrder: 5,
    isActive: true,
    langJsonb: {
      en: {
        currency: 'usd',
        features: [
          {
            bold: false,
            href: '',
            included: true,
            description: 'Analytics & Ads',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'Email Newsletter',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'Internationalization',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'Database',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'Dynamic Blog(CMS)',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'Static Blog',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'Authentication',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'Payment',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'AI',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'File Storage',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'Admin Dashboard',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'Lifetime license',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '24/7 Email Support',
          },
        ],
        cardTitle: 'Internal Link',
        buttonText: 'Get Pro Version',
        priceSuffix: '/lifetime',
        displayPrice: '$128.00',
        highlightText: 'Best Value',
        originalPrice: '$256.00',
        cardDescription: 'Next.js SaaS starter template for developers and product managers.',
      },
      ja: {
        currency: 'usd',
        features: [
          {
            bold: false,
            href: '',
            included: true,
            description: '分析と広告',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'メールニュースレター',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '国際化',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'データベース',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'ダイナミックブログ（CMS）',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'スタティックブログ',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '認証',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '支払い',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'AI',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'ファイルストレージ',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '管理者ダッシュボード',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '生涯ライセンス',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '24/7 メールサポート',
          },
        ],
        cardTitle: '内部リンク',
        buttonText: 'プロ版を取得',
        priceSuffix: '/生涯',
        displayPrice: '$128.00',
        highlightText: '最高の価値',
        originalPrice: '$256.00',
        cardDescription: '開発者とプロダクトマネージャーのための Next.js SaaS スターターテンプレート。',
      },
      zh: {
        currency: 'usd',
        features: [
          {
            bold: false,
            href: '',
            included: true,
            description: '分析与广告',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '电子邮件通讯',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '国际化',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '数据库',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '动态博客（CMS）',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '静态博客',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '身份验证',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '支付',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '人工智能',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '文件存储',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '管理员仪表板',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '终身许可证',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '24/7 电子邮件支持',
          },
        ],
        cardTitle: '内部链接',
        buttonText: '获取专业版',
        priceSuffix: '/终身',
        displayPrice: '$128.00',
        highlightText: '最佳价值',
        originalPrice: '$256.00',
        cardDescription: '适用于开发人员和产品经理的 Next.js SaaS 启动模板。',
      },
    },
    benefitsJsonb: {
      oneTimeCredits: 1000,
    },
  },
  {
    id: 'f1b4be4e-24f1-458c-b161-8dd47761a103',
    environment: 'test',
    groupSlug: 'onetime',
    cardTitle: 'Pro - No Credits',
    cardDescription: 'Next.js SaaS starter template for developers and product managers.',
    provider: 'stripe',
    stripePriceId: 'price_1RmRDIInsTsiNJR5RBtb7egL',
    stripeProductId: 'prod_ShqvpEkgBN1Sbb',
    stripeCouponId: 'BKTLnjeF',
    enableManualInputCoupon: true,
    paymentType: 'one_time',
    recurringInterval: null,
    price: '256',
    currency: 'USD',
    displayPrice: '$128.00',
    originalPrice: '$256.00',
    priceSuffix: '/lifetime',
    features: [
      {
        bold: false,
        href: '',
        included: true,
        description: 'Internationalization',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'Email Newsletter',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'Analytics & Ads',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'Database',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'Static Blog',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'Dynamic Blog(CMS)',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'Authentication',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'Payment',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'AI',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'File Storage',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'Admin Dashboard',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'Lifetime license',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: '24/7 Email Support',
      },
    ],
    isHighlighted: false,
    highlightText: 'Best Value',
    buttonText: 'Get Pro Version',
    displayOrder: 5,
    isActive: true,
    langJsonb: {
      en: {
        features: [
          {
            included: true,
            description: 'Internationalization',
          },
          {
            included: true,
            description: 'Email Newsletter',
          },
          {
            included: true,
            description: 'Analytics & Ads',
          },
          {
            included: true,
            description: 'Database',
          },
          {
            included: true,
            description: 'Static Blog',
          },
          {
            included: true,
            description: 'Dynamic Blog(CMS)',
          },
          {
            included: true,
            description: 'Authentication',
          },
          {
            included: true,
            description: 'Payment',
          },
          {
            included: true,
            description: 'AI',
          },
          {
            included: true,
            description: 'File Storage',
          },
          {
            included: true,
            description: 'Admin Dashboard',
          },
          {
            included: true,
            description: 'Lifetime license',
          },
          {
            included: true,
            description: '24/7 Email Support',
          },
        ],
        cardTitle: 'Pro',
        buttonText: 'Get Pro Version',
        priceSuffix: '/lifetime',
        displayPrice: '$256.00',
        highlightText: 'Best Value',
        cardDescription: 'Next.js SaaS starter template for developers and product managers.',
      },
      ja: {
        features: [
          {
            included: true,
            description: '国際化対応',
          },
          {
            included: true,
            description: 'メールニュースレター',
          },
          {
            included: true,
            description: '分析＆広告',
          },
          {
            included: true,
            description: 'データベース',
          },
          {
            included: true,
            description: '静的ブログ',
          },
          {
            included: true,
            description: '動的ブログ(CMS)',
          },
          {
            included: true,
            description: '認証機能',
          },
          {
            included: true,
            description: '決済機能',
          },
          {
            included: true,
            description: 'AI',
          },
          {
            included: true,
            description: 'ファイルストレージ',
          },
          {
            included: true,
            description: '管理ダッシュボード',
          },
          {
            included: true,
            description: '永久ライセンス',
          },
          {
            included: true,
            description: '24時間年中無休のメールサポート',
          },
        ],
        cardTitle: 'プロ版',
        buttonText: 'プロ版を入手',
        priceSuffix: '/永久',
        displayPrice: '$256.00',
        highlightText: '最高の価値',
        cardDescription: '開発者やプロダクトマネージャー向けのNext.js SaaSスターターテンプレート。',
      },
      zh: {
        features: [
          {
            included: true,
            description: '国际化支持',
          },
          {
            included: true,
            description: '电子邮件通讯',
          },
          {
            included: true,
            description: '分析与广告',
          },
          {
            included: true,
            description: '数据库',
          },
          {
            included: true,
            description: '静态博客',
          },
          {
            included: true,
            description: '动态博客(CMS)',
          },
          {
            included: true,
            description: '身份验证',
          },
          {
            included: true,
            description: '支付功能',
          },
          {
            included: true,
            description: '人工智能',
          },
          {
            included: true,
            description: '文件存储',
          },
          {
            included: true,
            description: '管理仪表板',
          },
          {
            included: true,
            description: '终身许可证',
          },
          {
            included: true,
            description: '24/7 电子邮件支持',
          },
        ],
        cardTitle: '专业版',
        buttonText: '获取专业版',
        priceSuffix: '/终身',
        displayPrice: '$256.00',
        highlightText: '最佳价值',
        cardDescription: '为开发者和产品经理打造的Next.js SaaS起步模板。',
      },
    },
    benefitsJsonb: {},
  },
  {
    id: 'be8acdef-46d3-4c0b-8c20-58a86a4a8b6f',
    environment: 'test',
    groupSlug: 'onetime',
    cardTitle: 'Pro - creem',
    cardDescription: 'Next.js SaaS starter template for developers and product managers.',
    provider: 'creem',
    creemProductId: 'prod_6JLiUBr0GKYQxqtHQ8TF8A',
    creemDiscountCode: 'NEW',
    paymentType: 'onetime',
    recurringInterval: 'once',
    price: '256',
    currency: 'USD',
    displayPrice: '$256.00',
    priceSuffix: '/lifetime',
    features: [
      {
        bold: false,
        href: '',
        included: true,
        description: 'Internationalization',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'Email Newsletter',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'Analytics & Ads',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'Database',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'Static Blog',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'Dynamic Blog(CMS)',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'Authentication',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'Payment',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'AI',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'File Storage',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'Admin Dashboard',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: 'Lifetime license',
      },
      {
        bold: false,
        href: '',
        included: true,
        description: '24/7 Email Support',
      },
    ],
    isHighlighted: true,
    highlightText: 'Best Value',
    buttonText: 'Get Pro Version',
    displayOrder: 6,
    isActive: true,
    langJsonb: {
      en: {
        currency: 'USD',
        features: [
          {
            bold: false,
            href: '',
            included: true,
            description: 'Internationalization',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'Email Newsletter',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'Analytics & Ads',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'Database',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'Static Blog',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'Dynamic Blog(CMS)',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'Authentication',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'Payment',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'AI',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'File Storage',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'Admin Dashboard',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'Lifetime license',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '24/7 Email Support',
          },
        ],
        cardTitle: 'Pro - creem',
        buttonText: 'Get Pro Version',
        priceSuffix: '/lifetime',
        displayPrice: '$256.00',
        highlightText: 'Best Value',
        originalPrice: '',
        cardDescription: 'Next.js SaaS starter template for developers and product managers.',
      },
      ja: {
        currency: 'USD',
        features: [
          {
            bold: false,
            href: '',
            included: true,
            description: '国際化',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'メールニュースレター',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '分析と広告',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'データベース',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '静的ブログ',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '動的ブログ（CMS）',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '認証',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '支払い',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'AI',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: 'ファイルストレージ',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '管理者ダッシュボード',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '生涯ライセンス',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '24/7 メールサポート',
          },
        ],
        cardTitle: 'プロ - creem',
        buttonText: 'プロ版を取得',
        priceSuffix: '/生涯',
        displayPrice: '$256.00',
        highlightText: '最高の価値',
        originalPrice: '',
        cardDescription: '開発者とプロダクトマネージャーのための Next.js SaaS スターターテンプレート。',
      },
      zh: {
        currency: 'USD',
        features: [
          {
            bold: false,
            href: '',
            included: true,
            description: '国际化',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '电子邮件通讯',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '分析与广告',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '数据库',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '静态博客',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '动态博客（CMS）',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '身份验证',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '支付',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '人工智能',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '文件存储',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '管理员仪表板',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '终身许可证',
          },
          {
            bold: false,
            href: '',
            included: true,
            description: '24/7 电子邮件支持',
          },
        ],
        cardTitle: '专业版 - creem',
        buttonText: '获取专业版',
        priceSuffix: '/终身',
        displayPrice: '$256.00',
        highlightText: '最佳价值',
        originalPrice: '',
        cardDescription: '适用于开发者和产品经理的 Next.js SaaS 启动模板。',
      },
    },
    benefitsJsonb: {
      oneTimeCredits: 500,
    },
  },
]
