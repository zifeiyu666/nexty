# CustomSong

CustomSong is a Next.js 16 application for creating personalized AI song gifts. Users can turn memories into custom songs, generate shareable music videos, and manage downloads from their account dashboard.

## Stack

- Next.js 16 and React 19
- Better Auth for authentication
- Drizzle ORM with PostgreSQL
- Stripe, Creem, and PayPal payment integrations
- Resend email
- Cloudflare R2/S3-compatible storage
- AI providers for lyrics, music, image, and video workflows

## Development

```bash
pnpm install
pnpm dev
```

Copy `.env.example` to `.env.local` for local development and fill in the required provider keys. Production secrets should live only in the deployment platform.

## Checks

```bash
pnpm lint
pnpm build
```
