# One Custom Song

One Custom Song is an AI-powered music gift platform for turning personal memories, love notes, family stories, and meaningful moments into custom songs. Users can create a personalized AI song, then turn it into a shareable music video, printable lyric poster, and downloadable keepsake.

## Live Demo

- Live Demo: [https://onecustomsong.com](https://onecustomsong.com)
- Create a Song: [https://onecustomsong.com/create-song](https://onecustomsong.com/create-song)

## Overview

One Custom Song is built with Next.js 16 and focuses on productizing the process of making a song for someone special. Users do not need music skills or a blank-page songwriting process. They provide relationship context, story details, occasion, mood, and the message they want to express, then the app generates a gift-ready song preview.

One Custom Song is more than a single AI audio generator. It supports a complete personalized music gift workflow:

- Capture the story, recipient, occasion, and emotional direction.
- Generate lyrics and a song preview.
- Refine lyrics, style, and creative direction.
- Unlock the full custom song.
- Create a shareable music video.
- Generate printable or collectible lyric wall art.
- Manage orders, songs, downloads, subscriptions, and credits from the user dashboard.

The product is designed for birthdays, anniversaries, weddings, holidays, long-distance relationships, family memories, thank-you gifts, memorial moments, and other occasions where a personal song can feel more meaningful than a generic gift.

## Features

### AI Custom Songs

- Generate personalized lyrics from user stories and gift context.
- Support different occasions, genres, vocal vibes, and emotional directions.
- Offer a free preview before users decide to unlock the full song.
- Allow users to refine lyrics and song direction after generation.

### Music Video Gifts

- Combine finished songs with photos, lyric scenes, and video templates.
- Create videos suitable for sharing by text, email, or social media.
- Use Remotion-powered rendering for music visualizers and template-based videos.

### Lyric Posters And Keepsakes

- Turn song titles, lyrics, dates, photos, and personal messages into visual posters.
- Support multiple wall art and lyric poster styles.
- Provide digital keepsakes that can be downloaded, printed, or paired with a physical gift.

### User Accounts And Monetization

- Handle authentication and user sessions with Better Auth.
- Let users manage orders, songs, subscriptions, credits, and downloads from a dashboard.
- Support Stripe, Creem, and PayPal payment integrations.
- Support one-time purchases, subscriptions, entitlement deduction, and payment webhook verification.

### Content And Growth

- Use a multilingual App Router architecture.
- Include blog and glossary content management capabilities.
- Support SEO metadata, sitemap, robots, and Open Graph configuration.
- Keep Product Hunt launch materials in `product-introduction.md`.

## Tech Stack

- Framework: Next.js 16, React 19, TypeScript
- Styling/UI: Tailwind CSS, Radix UI, shadcn-style components, lucide-react
- Auth: Better Auth
- Database: PostgreSQL, Drizzle ORM
- Payments: Stripe, Creem, PayPal
- AI: AI SDK, OpenAI, Anthropic, Google, DeepSeek, xAI, OpenRouter, Replicate, fal.ai
- Media: Remotion, Cloudflare R2 / S3-compatible storage
- Email: Resend, React Email
- Observability: Sentry, PostHog, Microsoft Clarity, Vercel Analytics
- Content: MDX, TipTap, blog/glossary management
- i18n: next-intl

## Project Structure

```text
app/                 Next.js App Router pages, layouts, route handlers
actions/             Server actions and domain operations
components/          UI, homepage, song creation, dashboard, CMS components
config/              Site config, AI provider config, shared constants
emails/              Transactional email templates
i18n/                next-intl routing and translation messages
lib/                 Auth, database, payments, AI, storage, metadata utilities
public/              Logo, OG images, product assets, blog images
remotion-src/        Remotion compositions for music video generation
scripts/             Deployment, database, content, and utility scripts
tests/               Project tests and test helpers
```

## Local Development

Install dependencies:

```bash
pnpm install
```

Prepare environment variables:

```bash
cp .env.example .env.local
```

Fill in the required provider keys for the database, authentication, payments, AI providers, storage, and email services. Production secrets should live only in the deployment platform and should not be committed to Git.

Start the development server:

```bash
pnpm dev
```

Default local URL:

```text
http://localhost:3000
```

## Commands

```bash
pnpm lint
pnpm build
pnpm start
```

Database commands:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:push
pnpm db:studio
pnpm db:seed
```

Remotion commands:

```bash
pnpm remotion:deploy
pnpm remotion:deploy:auto
pnpm remotion:function:deploy
```

## Launch And Assets

- Official website: [https://onecustomsong.com](https://onecustomsong.com)
- Product Hunt launch materials: `product-introduction.md`
- Site configuration: `config/site.ts`
- Product images: `public/images/products/`
- Open Graph image: `public/og.jpg`

## License

This project is proprietary unless a license file is added.
