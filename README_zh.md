# CustomSong

CustomSong 是一个用于生成个性化 AI 歌曲礼物的 Next.js 16 项目。用户可以把故事和回忆转成定制歌曲，并继续生成可分享的音乐视频和下载内容。

当前公开站点只启用英文内容，中文和日文 message JSON 已移除，避免多语言文案长期不一致。

## 技术栈

- Next.js 16 和 React 19
- Better Auth
- Drizzle ORM 与 PostgreSQL
- Stripe、Creem、PayPal 支付集成
- Resend 邮件
- Cloudflare R2/S3 兼容存储
- AI 歌词、音乐、图片、视频工作流

## 本地开发

```bash
pnpm install
pnpm dev
```

本地开发时将 `.env.example` 复制为 `.env.local` 并填写所需密钥。生产环境密钥只放部署平台。
