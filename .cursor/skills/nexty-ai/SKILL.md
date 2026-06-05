---
name: nexty-ai
description: Integrate AI providers in NEXTY.DEV using ai-sdk. Use when adding chat, text generation, image generation, video generation, or other AI features. Covers multiple providers (OpenAI, Anthropic, Google, DeepSeek, xAI, OpenRouter, Replicate, fal.ai, KIE, Custom OpenAI) and streaming patterns.
---

# AI Integration in NEXTY.DEV

## Architecture

```
Pages (app/[locale]/(basic-layout)/ai-demo/) → API Routes (app/api/ai-demo/) → Core Logic (lib/ai/) → Config (config/ai-*.ts)
```

- **SDK**: `ai` (Vercel AI SDK v6) and `@ai-sdk/*` provider packages
- **Config**: `config/ai-providers.ts` (provider registry), `config/ai-models.ts` (model registry)
- **Core Logic**: `lib/ai/chat.ts`, `lib/ai/image.ts`, `lib/ai/video.ts`
- **Adapters**: `lib/ai/adapters/` (provider-specific adapters: KIE image/video, fal video, replicate video)
- **API Routes**: `app/api/ai-demo/{chat,image,video}/`
- **Webhooks**: `app/api/webhooks/{fal,replicate,kie}/`
- **UI Components**: `components/ai-demo/{chat,image,video,shared}/`
- **Types**: `types/ai.ts`

## Supported Providers

| Provider | Package | Env Variable | Capabilities |
|----------|---------|--------------|--------------|
| OpenAI | `@ai-sdk/openai` | `OPENAI_API_KEY` | chat, image |
| Anthropic | `@ai-sdk/anthropic` | `ANTHROPIC_API_KEY` | chat |
| Google | `@ai-sdk/google` | `GOOGLE_GENERATIVE_AI_API_KEY` | chat, image |
| DeepSeek | `@ai-sdk/deepseek` | `DEEPSEEK_API_KEY` | chat |
| xAI | `@ai-sdk/xai` | `XAI_API_KEY` | chat, image |
| OpenRouter | `@ai-sdk/openrouter` | `OPENROUTER_API_KEY` | chat |
| Replicate | `replicate` | `REPLICATE_API_TOKEN` | image, video |
| fal.ai | `@fal-ai/client` | `FAL_KEY` | image, video |
| KIE | custom adapter | `KIE_API_KEY` | image, video |
| Custom OpenAI | `@ai-sdk/openai` (compatible) | `CUSTOM_OPENAI_API_KEY` + `CUSTOM_OPENAI_BASE_URL` | chat |

Provider registry is in `config/ai-providers.ts`. Use helper functions:
- `validateProviderKey(providerId)` — check if API key is configured
- `getLanguageModel(providerId, modelId)` — get language model instance
- `getImageModel(providerId, modelId)` — get image model instance

## Model Registry

All models are defined in `config/ai-models.ts` with arrays: `LANGUAGE_MODELS`, `IMAGE_MODELS`, `VIDEO_MODELS`.

Each model has a `capabilities` object describing supported features (aspect ratios, resolutions, seeds, negative prompts, etc.). The UI reads capabilities to show/hide settings dynamically.

To add a new model, append to the appropriate array in `config/ai-models.ts`.

## Chat (Text Generation)

### Core: `lib/ai/chat.ts`

```typescript
import { streamChat } from '@/lib/ai/chat';

// Single-turn
const result = streamChat({ provider: 'openai', modelId: 'gpt-4o', prompt: 'Hello' });

// Multi-turn
const result = streamChat({
  provider: 'anthropic',
  modelId: 'claude-sonnet-4-6',
  messages: [{ role: 'user', content: 'Hello' }],
  system: 'You are helpful.',
});
```

### API Route: `app/api/ai-demo/chat/route.ts`

- Accepts `{ provider, modelId, messages?, prompt?, system? }`
- Validates with Zod
- Supports AI SDK v6 UIMessage format (messages with `parts` array)
- Returns `result.toUIMessageStreamResponse()`
- Supports reasoning traces for models like o3, o4-mini, deepseek-reasoner, gemini-2.5-pro, claude-3-7-sonnet, grok-3-mini

### Client: `useChat` hook

```typescript
'use client';
import { useChat } from '@ai-sdk/react';

const { messages, input, handleInputChange, handleSubmit, isLoading, stop } = useChat({
  api: '/api/ai-demo/chat',
  transport: new DefaultChatTransport({
    api: '/api/ai-demo/chat',
    body: { provider, modelId }, // extra fields merged into request
  }),
});
```

Multi-turn chat component: `components/ai-demo/chat/MultiTurnChat.tsx`
Single-turn chat component: `components/ai-demo/chat/SingleTurnChat.tsx`

### Custom OpenAI-Compatible Provider

For using any OpenAI-compatible API (SiliconFlow, 302.ai, Together AI, etc.):

```env
CUSTOM_OPENAI_BASE_URL=https://api.siliconflow.cn/v1
CUSTOM_OPENAI_API_KEY=sk-xxx
NEXT_PUBLIC_CUSTOM_OPENAI_MODELS=Qwen/Qwen2.5-72B-Instruct:Qwen2.5 72B,deepseek-ai/DeepSeek-V3:DeepSeek V3
```

Models are configured dynamically via `NEXT_PUBLIC_CUSTOM_OPENAI_MODELS` env var. Format: `model-id:Display Name,model-id-2:Display Name 2`.

## Image Generation

### Core: `lib/ai/image.ts`

```typescript
import { generateImageUnified } from '@/lib/ai/image';

const result = await generateImageUnified({
  prompt: 'A sunset over mountains',
  provider: 'openai',
  modelId: 'gpt-image-1',
  aspectRatio: '16:9',
  quality: 'high',
  // Optional: referenceImageBase64, imageStrength, seed, negativePrompt, etc.
});
// result.imageUrl is a data URI (base64)
```

Three internal paths:
- **Standard path**: Uses `generateImage()` from AI SDK (OpenAI, xAI, Replicate, fal.ai)
- **Gemini path**: Uses `generateText()` with `responseModalities: ["IMAGE"]` for Google Gemini image models
- **KIE path**: Custom adapter via `lib/ai/adapters/kie-image.ts` using KIE jobs API

### API Route: `app/api/ai-demo/image/route.ts`

Accepts all image generation parameters, validates with Zod, returns `{ imageUrl }`.

### UI Components

- `components/ai-demo/image/ImagePage.tsx` — main page with controls
- `components/ai-demo/image/ImageAdvancedSettings.tsx` — aspect ratio, quality, seed, negative prompt, guidance scale, etc.
- `components/ai-demo/image/ImageResultArea.tsx` — result display with download

## Video Generation

### Core: `lib/ai/video.ts`

Video generation is fully webhook-based (task-based) because it takes minutes. All providers submit the job and return immediately; completion is notified via webhook callback.

```typescript
import { submitVideoGeneration } from '@/lib/ai/video';

const { taskId } = await submitVideoGeneration({
  prompt: 'A cat walking',
  provider: 'replicate',
  modelId: 'kwaivgi/kling-v2.5-turbo-pro',
  aspectRatio: '16:9',
  duration: 5,
  // Optional: image, negativePrompt, generateAudio, cfgScale, seed, etc.
});
```

Flow:
1. Client submits → receives `taskId` immediately (no blocking)
2. Server builds per-task webhook URL from `WEBHOOK_BASE_URL` and submits to provider
3. Task status stays `"processing"` in Redis
4. Provider finishes → calls webhook → handler updates task to `"succeeded"` with `videoUrl`
5. Client polls `GET /api/ai-demo/video/status?taskId=xxx` until done

### Webhook URL Construction (`lib/ai/video.ts`)

`buildWebhookUrl(provider, taskId)` constructs per-provider callback URLs:

| Provider | Webhook URL |
|----------|-------------|
| Replicate | `${WEBHOOK_BASE_URL}/api/webhooks/replicate?taskId={taskId}` |
| fal.ai | `${WEBHOOK_BASE_URL}/api/webhooks/fal?taskId={taskId}` |
| KIE | `${WEBHOOK_BASE_URL}/api/webhooks/kie` |

`WEBHOOK_BASE_URL` must be publicly reachable. For local dev, use ngrok or Cloudflare Tunnel.

### Adapters: `lib/ai/adapters/`

All video adapters return `{ videoUrl: "", externalId }` immediately after submission — webhook fills the URL later.

- `replicate-video.ts` — `predictions.create()` with `webhook` + `webhook_events_filter: ["completed"]`
- `fal-video.ts` — `fal.queue.submit()` with `webhookUrl`
- `kie-video.ts` — `POST /api/v1/jobs/createTask` with `callBackUrl`; also exports `fetchKIETaskResult()` used by webhook handler
- `kie-image.ts` — custom adapter for KIE image generation (uploads base64 to R2, submits via jobs API)

### KIE Provider Details

KIE uses a unified jobs API at `https://api.kie.ai`:
- Submit: `POST /api/v1/jobs/createTask` with model-specific parameters
- Result fetch: `GET /api/v1/jobs/recordInfo?taskId=xxx` (called by webhook handler after callback)
- Webhook: `app/api/webhooks/kie/route.ts`

KIE image generation requires Cloudflare R2 for reference image uploads (KIE needs public URLs, not base64).

### Task Store: `lib/ai/task-store.ts`

Upstash Redis-backed store with 1-hour TTL. Two key types:
- `{site}:vtask:{taskId}` — task object (status, videoUrl, externalId, …)
- `{site}:vtask:ext:{externalId}` — reverse mapping: platform ID → internal taskId (used by KIE webhook)

```typescript
import { taskStore } from '@/lib/ai/task-store';
```

### Webhooks

| Handler | Path | Auth |
|---------|------|------|
| Replicate | `app/api/webhooks/replicate/route.ts` | HMAC signature (optional, `REPLICATE_WEBHOOK_SIGNING_SECRET`) |
| fal.ai | `app/api/webhooks/fal/route.ts` | JWKS / Ed25519 (optional, `FAL_VERIFY_WEBHOOKS=true`) |
| KIE | `app/api/webhooks/kie/route.ts` | None (uses externalId lookup) |

Replicate and fal.ai receive `taskId` in the URL query string. KIE receives `kieTaskId` in the body and looks up the internal task via the Redis reverse mapping.

### UI Components

- `components/ai-demo/video/VideoPage.tsx` — tabbed T2V/I2V interface
- `components/ai-demo/video/VideoAdvancedSettings.tsx` — aspect ratio, duration, audio, CFG scale
- `components/ai-demo/video/VideoResultArea.tsx` — polling + video player

## Shared UI Components (`components/ai-demo/shared/`)

| Component | Purpose |
|-----------|---------|
| `ModelSelector` | Grouped select dropdown, models grouped by provider |
| `PromptInput` | Textarea with Enter-to-submit, character counter |
| `GenerateButton` | Loading button with optional cancel |
| `ImageUploader` | Drag & drop with base64 conversion, size validation |
| `MediaPreview` | Generic image/video display with download |
| `ProviderBadge` | Color-coded provider label |
| `TaskStatusBar` | Standalone polling component |

## Page Structure

```
app/[locale]/(basic-layout)/ai-demo/
├── layout.tsx          # Shared layout with navigation tabs
├── page.tsx            # Redirects or landing
├── chat/page.tsx       # Renders ChatPage (tabs: Single/Multi-turn)
├── image/page.tsx      # Renders ImagePage
└── video/page.tsx      # Renders VideoPage
```

## Types (`types/ai.ts`)

Key types: `GenerationRequest`, `ChatRequest`, `ImageRequest`, `VideoRequest`, `ImageResult`, `VideoTaskResult`, `ReplicatePredictionResponse`, `FalVideoResult`, `FalWebhookPayload`.

## Adding a New AI Feature

1. **New model**: Add entry to `LANGUAGE_MODELS`, `IMAGE_MODELS`, or `VIDEO_MODELS` in `config/ai-models.ts`
2. **New provider**: Add to `PROVIDERS` in `config/ai-providers.ts` with capabilities
3. **New modality**: Create `lib/ai/{modality}.ts` core logic, API route, and UI components following existing patterns
4. **New adapter**: Add to `lib/ai/adapters/` for provider-specific logic (see KIE adapters as reference)

## Environment Variables

```env
# Chat Providers
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
DEEPSEEK_API_KEY=
XAI_API_KEY=
OPENROUTER_API_KEY=

# Custom OpenAI-Compatible
CUSTOM_OPENAI_BASE_URL=
CUSTOM_OPENAI_API_KEY=
NEXT_PUBLIC_CUSTOM_OPENAI_MODELS=   # Format: model-id:Display Name,model-id-2:Display Name 2

# Image & Video Providers
REPLICATE_API_TOKEN=
REPLICATE_WEBHOOK_SIGNING_SECRET=   # Optional: enable Replicate webhook signature verification
FAL_KEY=
FAL_VERIFY_WEBHOOKS=false           # Optional: set "true" to enable fal.ai JWKS verification
KIE_API_KEY=
WEBHOOK_BASE_URL=                   # Required for video: public base URL for webhook callbacks
                                    # e.g. https://your-domain.com or https://xxxx.ngrok.io

# Required for KIE image uploads (reference images)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
```

## Credit Deduction Pattern

```typescript
import { deductCredits } from '@/actions/usage/deduct';

// Check and deduct credits before AI generation
const creditResult = await deductCredits(10, 'AI chat generation');
if (!creditResult.success) {
  return apiResponse.badRequest(creditResult.error);
}
```

## Error Handling

API routes use Zod validation at boundaries and return structured responses via `apiResponse` helper.

## Checklist

1. Check API key is configured via `validateProviderKey()`
2. Add model to registry in `config/ai-models.ts` with correct capabilities
3. Use `streamChat` / `generateImageUnified` / `submitVideoGeneration` from `lib/ai/`
4. Add authentication check in API route if needed
5. Implement credit deduction if applicable
6. Use streaming for chat (`.toUIMessageStreamResponse()`)
7. Use task-based polling for long-running operations (video)
8. Keep API keys server-side only
