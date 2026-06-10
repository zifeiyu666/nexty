---
name: nexty-quick-start
description: Use when a developer wants to quickly customize the NEXTY.DEV template for their own product. Takes product name and business description, then generates landing page content, SEO metadata, Header/Footer navigation, and site configuration across all languages (en/zh/ja).
---

# NEXTY Quick Start - Product Customization

Quickly transform the NEXTY.DEV template into a customized product by collecting product information and generating all necessary content.

## Overview

This skill guides the developer through customizing the template for their specific product. It modifies:

1. **Site Configuration** (`config/site.ts`) - Product name, author, social links
2. **SEO & Branding** (`i18n/messages/*/common.json`) - Title, tagline, description
3. **Landing Page** (`i18n/messages/*/Landing.json`) - Hero, Features, FAQ, CTA
4. **Navigation** (`i18n/messages/*/common.json`) - Header links, Footer links

## Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│  Phase 1: Information Gathering                                 │
│  - Product name                                                 │
│  - Target audience & business description                       │
│  - Key features (3-5)                                           │
│  - Social media links (optional)                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Phase 2: Market Research & SEO Discovery  ★ CRITICAL          │
│  - Search: What problems does this product solve?               │
│  - Search: What keywords do users search for this need?         │
│  - Search: How do competitors describe similar products?        │
│  - For each language: Research local search terms & user needs  │
│  ★ Use WebSearch tool to gather real market data                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Phase 3: Content Generation & Review                           │
│  - Generate SEO content based on research findings              │
│  - Generate Hero section with validated keywords                │
│  - Generate Features addressing real user pain points           │
│  - Generate FAQ from actual user questions                      │
│  - Generate CTA section                                         │
│  ★ CHECKPOINT: Present content for review before proceeding     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Phase 4: Navigation Configuration                              │
│  - Analyze current Header links                                 │
│  - Analyze current Footer links                                 │
│  ★ CHECKPOINT: Confirm Header/Footer changes (add/remove/keep)  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Phase 5: Apply Changes                                         │
│  - Update config/site.ts                                        │
│  - Update i18n/messages/en/common.json                          │
│  - Update i18n/messages/zh/common.json                          │
│  - Update i18n/messages/ja/common.json                          │
│  - Update i18n/messages/en/Landing.json                         │
│  - Update i18n/messages/zh/Landing.json                         │
│  - Update i18n/messages/ja/Landing.json                         │
└─────────────────────────────────────────────────────────────────┘
```

## Phase 1: Information Gathering

Collect information **one question at a time**. Use follow-up questions if answers are unclear.

### Required Information

1. **Product Name**
   - "What is your product name?"
   - Example: "CloudSync", "AIWriter", "DevTools Pro"

2. **Business Description**
   - "Describe your product in 1-2 sentences. What does it do and who is it for?"
   - Example: "An AI-powered writing assistant for content creators and marketers"

3. **Key Features** (3-5 features)
   - "What are the 3-5 main features of your product?"
   - For each feature: title + brief description
   - Example: "AI Writing - Generate blog posts in seconds"

4. **Target Audience**
   - "Who is your primary target audience?"
   - Example: "Solo developers", "Marketing teams", "Small businesses"

### Optional Information

5. **Social Media Links**
   - "Do you have any social media links to add? (GitHub, Twitter/X, Discord, YouTube, etc.)"
   - Skip if not provided - existing placeholder values will remain

6. **Author/Creator Info**
   - "What name should appear as the author/creator?"
   - Default: Use product name if not provided

## Phase 2: Market Research & SEO Discovery

**CRITICAL: Do not skip this phase. SEO without research is guesswork.**

Before generating any content, use WebSearch to understand:
1. What real users are searching for
2. What problems they're trying to solve
3. How competitors position similar products
4. Language-specific search patterns

### 2.1 Problem & Need Research

Search to understand the user's pain points:

```
WebSearch queries (adapt based on product type):
- "{product category} problems"
- "why do people need {product type}"
- "{target audience} challenges with {problem area}"
- "best {product category} for {use case}"
```

**Goal:** Identify 3-5 real pain points your product solves.

### 2.2 Keyword Research by Language

For each language, search for actual user queries:

#### English Keywords
```
WebSearch queries:
- "{product category} software"
- "best {product type} tools"
- "{use case} solution"
- "{product category} for {audience}"
```

#### Chinese Keywords (中文关键词)
```
WebSearch queries:
- "{产品类别} 工具推荐"
- "{产品类别} 哪个好"
- "{使用场景} 解决方案"
- "{产品类别} 软件"
```

#### Japanese Keywords (日本語キーワード)
```
WebSearch queries:
- "{製品カテゴリ} おすすめ"
- "{製品カテゴリ} ツール"
- "{ユースケース} 効率化"
- "{製品タイプ} 比較"
```

### 2.3 Competitor Analysis

Search for how competitors describe their products:

```
WebSearch queries:
- "top {product category} tools 2024"
- "{competitor name} vs alternatives"
- "{product category} comparison"
```

**Extract from competitors:**
- Common value propositions
- Frequently used keywords
- How they describe features
- Their taglines and headlines

### 2.4 User Intent Analysis

Understand what users actually want to achieve:

```
WebSearch queries:
- "how to {solve problem that product addresses}"
- "{target audience} workflow {product area}"
- "{product category} use cases"
```

### 2.5 Research Summary Template

After research, document findings before content generation:

```markdown
## SEO Research Findings

### User Pain Points Discovered:
1. {Pain point 1} - from search: "{query}"
2. {Pain point 2} - from search: "{query}"
3. {Pain point 3} - from search: "{query}"

### High-Value Keywords by Language:

| English | Chinese | Japanese | Search Intent |
|---------|---------|----------|---------------|
| {keyword} | {关键词} | {キーワード} | {what users want} |
| {keyword} | {关键词} | {キーワード} | {what users want} |

### Competitor Insights:
- Common positioning: {how competitors describe products}
- Gaps we can fill: {what competitors don't emphasize}

### Content Strategy:
- Primary message: {address pain point 1}
- Keywords to include: {list}
- User benefit to emphasize: {what they achieve}
```

### Research Examples

**Example: AI Writing Tool**

Before researching:
- ❌ Guessing tagline: "AI-powered content creation"

After researching:
- Search "AI writing tool problems" → Users complain about generic content
- Search "AI写作工具" → Chinese users search "AI写作助手 免费"
- Search "AIライティング おすすめ" → Japanese users want "文章作成 効率化"

Result:
- ✅ EN: "Create content that sounds like you, not a robot"
- ✅ ZH: "AI写作助手 - 告别千篇一律的AI味文案"
- ✅ JA: "あなたらしい文章を、AIがサポート"

**Example: SaaS Boilerplate**

Before researching:
- ❌ Guessing: "Build apps faster"

After researching:
- Search "SaaS boilerplate" → Users want "production-ready", "save weeks"
- Search "Next.js 模板" → Chinese devs search "Next.js SaaS 脚手架"
- Search "SaaS テンプレート" → Japanese devs search "開発効率化"

Result:
- ✅ EN: "Ship your SaaS in days, not months"
- ✅ ZH: "省下3个月开发时间，专注你的核心业务"
- ✅ JA: "開発期間を大幅短縮、すぐにローンチ"

## Phase 3: Content Generation

Based on collected information AND research findings, generate content for all sections. 

**Key principle:** Every piece of content must be informed by the research in Phase 2. Don't generate content that ignores the discovered keywords, pain points, and user intent.

### Content to Generate

#### 3.1 SEO Metadata (Home section in common.json)

```json
{
  "Home": {
    "title": "{Product Name}",
    "tagLine": "{Short compelling tagline in target language}",
    "description": "{2-3 sentence description for SEO}"
  }
}
```

#### 3.2 Hero Section (Landing.json)

```json
{
  "Hero": {
    "badge": { "label": "NEW", "text": "{Category or highlight}", "href": "/#pricing" },
    "title": "{Main headline}",
    "description": "{Compelling description}",
    "getStarted": "{CTA text}",
    "getStartedLink": "/#pricing",
    "viewDocs": "{Secondary CTA}",
    "viewDocsLink": "/docs"
  }
}
```

#### 3.3 Features Section (Landing.json)

Transform the 3-5 features into detailed feature cards with:
- Title
- Description
- 2-3 detail points
- Placeholder for images (keep existing image paths or use placeholders)

#### 3.4 FAQ Section (Landing.json)

Generate 5-8 FAQs based on:
- Common questions about the product type
- Pricing/payment questions
- Feature-related questions
- Support/onboarding questions

#### 3.5 CTA Section (Landing.json)

```json
{
  "CTA": {
    "title": "{Compelling call to action title}",
    "description": "{Why they should act now}",
    "button": "{Button text}",
    "trustText": "{Social proof text}",
    "features": {
      "feature1": "{Key benefit 1}",
      "feature2": "{Key benefit 2}",
      "feature3": "{Key benefit 3}",
      "feature4": "{Key benefit 4}"
    }
  }
}
```

### CHECKPOINT: Content Review

Before proceeding, present all generated content in a clear format:

```markdown
## Generated Content Preview

### SEO & Branding
- **Title:** {value}
- **Tagline:** {value}
- **Description:** {value}

### Hero Section
- **Headline:** {value}
- **Description:** {value}

### Features
1. {Feature 1 title} - {brief description}
2. {Feature 2 title} - {brief description}
...

### FAQ (showing first 3)
1. Q: {question}
   A: {answer}
...

Does this content look correct? (Y to proceed, or provide specific changes)
```

## Phase 4: Navigation Configuration

### Header Links Analysis

Read current Header links from `common.json` and present options:

```markdown
## Current Header Links:
1. Features (/#features) - ✓ KEEP (standard)
2. Pricing (/#pricing) - ✓ KEEP (standard)
3. AI Demo (/ai-demo) - ❓ Your product related?
4. Blog (/blog) - ✓ KEEP (content marketing)
5. Demo (dropdown) - ❓ Remove or customize?

For each link, choose:
- KEEP: Keep as-is
- UPDATE: Update name/href
- REMOVE: Remove from navigation
- ADD: Add new link

Which links should I modify?
```

### Footer Links Analysis

```markdown
## Current Footer Link Groups:

### Group 1: Products
- Features, Pricing, Blog, Glossary

### Group 2: Support
- Docs, Roadmap

### Group 3: Languages
- English, 中文, 日本語 (auto-handled)

Should I update the Products or Support links?
```

### CHECKPOINT: Navigation Confirmation

Present the final navigation structure before applying:

```markdown
## Proposed Navigation Changes

### Header:
[List final header structure]

### Footer:
[List final footer structure]

Confirm these changes? (Y/N)
```

## Phase 5: Apply Changes

Once all content is confirmed, apply changes to files.

### Files to Update

| File | Changes |
|------|---------|
| `config/site.ts` | name, authors, socialLinks |
| `i18n/messages/en/common.json` | Home, Header, Footer |
| `i18n/messages/zh/common.json` | Home, Header, Footer (translated) |
| `i18n/messages/ja/common.json` | Home, Header, Footer (translated) |
| `i18n/messages/en/Landing.json` | Hero, Features, FAQ, CTA |
| `i18n/messages/zh/Landing.json` | Hero, Features, FAQ, CTA (translated) |
| `i18n/messages/ja/Landing.json` | Hero, Features, FAQ, CTA (translated) |

### Localization & SEO Guidelines

**CRITICAL: Generate native-quality content, NOT translations.**

Each language version must read as if written by a native speaker for that market. Avoid word-for-word translation—adapt for cultural context, natural expression, and local SEO.

#### English (en)
- **Tone:** Direct, action-oriented, benefit-focused
- **SEO Keywords:** Use high-search-volume terms natural to English speakers
- **CTA Style:** Imperative verbs ("Get Started", "Try Free", "Build Now")
- **Description:** Concise, scannable, front-load key benefits

#### Chinese (zh-CN)
- **Use:** 简体中文 (Simplified Chinese)
- **Tone:** 专业但亲和，避免过于正式或机械的表达
- **表达习惯:**
  - 避免直译，使用符合中文表达的句式
  - ❌ "构建应用程序在几天内而不是几个月" (直译)
  - ✅ "几天上线，而非数月等待" (本土化)
  - ❌ "获取开始" (Get Started 直译)
  - ✅ "立即开始" 或 "免费试用"
- **SEO 优化:**
  - 使用中国用户常用的搜索词
  - 标题控制在 30 字以内
  - 描述控制在 150 字以内，包含核心关键词
  - 考虑百度 SEO 习惯，关键词靠前
- **技术术语:**
  - API、SaaS、SDK 保持英文
  - Dashboard → 仪表盘 / 控制台
  - Authentication → 身份认证
  - Subscription → 订阅

#### Japanese (ja)
- **Use:** です/ます form (敬語) for user-facing content
- **Tone:** 丁寧で親しみやすい、過度にカジュアルにならない
- **表達習慣:**
  - 直訳を避け、日本語として自然な表現を使用
  - ❌ "あなたのビジネスを変革する準備ができていますか？" (直訳調)
  - ✅ "ビジネスの成長を加速させませんか？" (自然な日本語)
  - ❌ "開始する" (Get Started 直訳)
  - ✅ "今すぐ始める" または "無料で試す"
- **SEO 最適化:**
  - 日本のユーザーが検索するキーワードを使用
  - タイトルは32文字以内（Google表示上限）
  - ディスクリプションは120文字程度
  - 重要なキーワードを文頭に配置
- **技術用語:**
  - API、SaaS、SDK は英語のまま
  - Dashboard → ダッシュボード
  - Authentication → 認証
  - Subscription → サブスクリプション

#### Common Localization Mistakes to Avoid

| Mistake | Example | Fix |
|---------|---------|-----|
| Literal translation | ZH: "一站式商店" (one-stop shop) | ZH: "一站式解决方案" |
| Unnatural word order | JA: "高速で、安全で、信頼性があります" | JA: "高速・安全・信頼性の高い" |
| Ignoring cultural context | Using "10x" claims in JP | Use more modest claims in JP |
| Wrong formality level | Using casual JP for business | Use です/ます form |
| Keyword stuffing | Repeating same keyword | Use semantic variations |

#### SEO Content Length Guidelines

| Element | English | Chinese | Japanese |
|---------|---------|---------|----------|
| Title (meta) | 50-60 chars | 25-30 chars | 28-32 chars |
| Tagline | 60-80 chars | 30-40 chars | 35-45 chars |
| Description (meta) | 150-160 chars | 120-150 chars | 100-120 chars |
| H1 Headline | 6-12 words | 10-20 chars | 15-25 chars |

### Update Order

1. Update `config/site.ts` first (base configuration)
2. Update English files (source content)
3. Update Chinese translations
4. Update Japanese translations

## Common Scenarios

### Scenario: Developer wants minimal changes
- Only update product name and description
- Keep existing Header/Footer structure
- Skip optional sections

### Scenario: Complete rebranding
- Update all product information
- Customize Header/Footer completely
- Update social media links
- Regenerate all landing page content

### Scenario: Keeping some template content
- Some features from NEXTY template may still apply
- Mark sections to keep vs replace
- Merge new features with existing ones

## File Reference

### config/site.ts Structure

```typescript
export const siteConfig: SiteConfig = {
  name: "ProductName",
  url: BASE_URL,
  authors: [{ name: "AuthorName", url: BASE_URL }],
  creator: '@handle',
  socialLinks: {
    github: 'https://github.com/...',
    twitter: 'https://twitter.com/...',
    discord: 'https://discord.gg/...',
    // ...
  },
  // ... rest remains unchanged
}
```

### common.json Key Sections

```json
{
  "Home": { "title", "tagLine", "description" },
  "Header": { "links": [...] },
  "Footer": { "Copyright", "Links": { "groups": [...] } }
}
```

### Landing.json Key Sections

```json
{
  "Hero": { "badge", "title", "description", "getStarted", "viewDocs" },
  "Features": { "badge", "title", "description", "items": [...] },
  "UseCases": { ... },
  "FAQ": { "title", "description", "items": [...] },
  "CTA": { "title", "description", "button", "features" }
}
```

## Checklist

### Phase 1: Information Gathering
- [ ] Collect product name
- [ ] Collect business description  
- [ ] Collect 3-5 key features
- [ ] Collect target audience
- [ ] Ask about social media links

### Phase 2: Market Research (DO NOT SKIP)
- [ ] **WebSearch:** User pain points & problems in this product area
- [ ] **WebSearch:** English keywords users search for
- [ ] **WebSearch:** Chinese keywords (中文关键词)
- [ ] **WebSearch:** Japanese keywords (日本語キーワード)
- [ ] **WebSearch:** Competitor analysis (how they position)
- [ ] Document research findings before proceeding

### Phase 3: Content Generation
- [ ] Generate SEO content (3 languages) - based on research
- [ ] Generate Hero section (3 languages) - using discovered pain points
- [ ] Generate Features section (3 languages) - addressing real needs
- [ ] Generate FAQ section (3 languages) - from real user questions
- [ ] Generate CTA section (3 languages)
- [ ] **CHECKPOINT:** Review generated content with user

### Phase 4: Navigation Configuration
- [ ] Analyze Header links
- [ ] Analyze Footer links
- [ ] **CHECKPOINT:** Confirm navigation changes

### Phase 5: Apply Changes
- [ ] Update config/site.ts
- [ ] Update en/common.json
- [ ] Update zh/common.json
- [ ] Update ja/common.json
- [ ] Update en/Landing.json
- [ ] Update zh/Landing.json
- [ ] Update ja/Landing.json
- [ ] Verify no JSON syntax errors
