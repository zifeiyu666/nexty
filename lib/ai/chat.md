# `streamChat` — Advanced Usage Guide

`streamChat` is the unified AI chat entry point in this project. It wraps the AI SDK's `streamText` and is the **single place to add cross-cutting concerns** such as logging, token tracking, rate limiting, and retry logic.

---

## Current Signature

```ts
// lib/ai/chat.ts
interface ChatOptions {
  provider: string;   // e.g. "openai", "anthropic", "deepseek"
  modelId: string;    // e.g. "gpt-4o", "claude-3-5-sonnet", "deepseek-chat"
  messages?: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  prompt?: string;    // shorthand for single-turn: wraps into messages automatically
  system?: string;    // system prompt
}

export function streamChat(options: ChatOptions): ReturnType<typeof streamText>
```

- Pass either `messages` (multi-turn) **or** `prompt` (single-turn). If both are provided, `messages` takes precedence.
- The return value is an AI SDK `StreamTextResult`. The API route calls `.toUIMessageStreamResponse()` on it to send the stream to the client.

---

## Basic Usage (already in place)

```ts
// Single-turn
const result = streamChat({
  provider: "openai",
  modelId: "gpt-4o",
  prompt: "Explain React Server Components in one paragraph.",
  system: "You are a concise technical writer.",
});

// Multi-turn
const result = streamChat({
  provider: "anthropic",
  modelId: "claude-3-5-sonnet-20241022",
  messages: [
    { role: "user",      content: "Hello!" },
    { role: "assistant", content: "Hi! How can I help?" },
    { role: "user",      content: "What is the capital of France?" },
  ],
});

return result.toUIMessageStreamResponse();
```

---

## Advanced Patterns

### 1. Token Counting & Cost Tracking

Use the `onFinish` callback (already wired in `chat.ts`) to record token usage after the stream completes.

```ts
// lib/ai/chat.ts
return streamText({
  model,
  system: options.system,
  messages,
  onFinish: async ({ usage, finishReason }) => {
    await db.insert(aiUsageLogs).values({
      provider:          options.provider,
      modelId:           options.modelId,
      promptTokens:      usage.promptTokens,
      completionTokens:  usage.completionTokens,
      finishReason,                          // "stop" | "length" | "tool-calls" | ...
      createdAt:         new Date(),
    });
  },
});
```

> **Why `onFinish` and not `result.usage`?**
> `result.usage` is a Promise that resolves after the stream ends — fine for fire-and-forget logging.
> `onFinish` is the canonical AI SDK hook and gives you both `usage` and `finishReason` in one place.

---

### 2. Rate Limiting (Abuse Prevention)

Check limits **before** calling `streamText` so the AI provider is never hit unnecessarily.
The example below uses [Upstash Ratelimit](https://github.com/upstash/ratelimit-js), but any Redis-backed solution works.

```ts
// lib/ai/chat.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis }     from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis:     Redis.fromEnv(),
  limiter:   Ratelimit.slidingWindow(20, "1 m"), // 20 requests per minute
  analytics: true,
});

export async function streamChat(options: ChatOptions & { userId?: string }) {
  // Rate limit check
  if (options.userId) {
    const { success, remaining, reset } = await ratelimit.limit(options.userId);
    if (!success) {
      const retryAfterSec = Math.ceil((reset - Date.now()) / 1000);
      throw Object.assign(new Error("Rate limit exceeded"), {
        status: 429,
        retryAfter: retryAfterSec,
      });
    }
  }

  const model    = getLanguageModel(options.provider, options.modelId);
  const messages = options.messages ?? [{ role: "user" as const, content: options.prompt ?? "" }];
  return streamText({ model, system: options.system, messages });
}
```

In `route.ts`, catch the error and return the right HTTP status:

```ts
} catch (error: any) {
  return Response.json(
    { error: error.message },
    {
      status: error.status ?? 400,
      headers: error.retryAfter
        ? { "Retry-After": String(error.retryAfter) }
        : undefined,
    }
  );
}
```

---

### 3. Content Safety / Keyword Filtering

Inspect the user's message **before** sending it to the model.

```ts
const BANNED_PATTERNS = [/\b(pattern1|pattern2)\b/i];

function isSafe(text: string): boolean {
  return !BANNED_PATTERNS.some((re) => re.test(text));
}

export function streamChat(options: ChatOptions) {
  // Extract the last user message for inspection
  const lastUserContent =
    options.prompt ??
    [...(options.messages ?? [])].reverse().find((m) => m.role === "user")?.content ??
    "";

  if (!isSafe(lastUserContent)) {
    throw Object.assign(new Error("Content policy violation"), { status: 400 });
  }

  const model    = getLanguageModel(options.provider, options.modelId);
  const messages = options.messages ?? [{ role: "user" as const, content: options.prompt ?? "" }];
  return streamText({ model, system: options.system, messages });
}
```

For production, consider using the [OpenAI Moderation API](https://platform.openai.com/docs/guides/moderation) or a dedicated content-safety service instead of keyword matching.

---

### 4. Retry with Exponential Backoff

Automatically retry on transient provider errors (429, 502, 503) without touching `route.ts`.

```ts
async function withRetry<T>(
  fn: () => T,
  { maxAttempts = 3, baseDelayMs = 500 } = {}
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return fn();
    } catch (err: any) {
      const retryable = err?.status === 429 || (err?.status ?? 0) >= 500;
      if (!retryable || attempt === maxAttempts) throw err;

      const delay = baseDelayMs * 2 ** (attempt - 1); // 500ms, 1s, 2s, ...
      console.warn(`[AI] attempt ${attempt} failed (${err.status}), retrying in ${delay}ms`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("Unreachable");
}

export function streamChat(options: ChatOptions) {
  const model    = getLanguageModel(options.provider, options.modelId);
  const messages = options.messages ?? [{ role: "user" as const, content: options.prompt ?? "" }];

  return withRetry(() => streamText({ model, system: options.system, messages }));
}
```

> **Important**: Retry only wraps the *initiation* of the stream (the `streamText()` call). Once the client starts consuming the stream, retry is no longer possible — the HTTP response has already begun.

---

### 5. Structured Logging

Emit structured JSON logs for observability tools (Datadog, Grafana Loki, etc.).

```ts
export function streamChat(options: ChatOptions) {
  const model    = getLanguageModel(options.provider, options.modelId);
  const messages = options.messages ?? [{ role: "user" as const, content: options.prompt ?? "" }];
  const startMs  = Date.now();

  console.log(JSON.stringify({
    event:    "ai.chat.start",
    provider: options.provider,
    modelId:  options.modelId,
    turns:    messages.length,
  }));

  const result = streamText({
    model,
    system: options.system,
    messages,
    onFinish: ({ usage, finishReason }) => {
      console.log(JSON.stringify({
        event:            "ai.chat.finish",
        provider:         options.provider,
        modelId:          options.modelId,
        durationMs:       Date.now() - startMs,
        promptTokens:     usage.promptTokens,
        completionTokens: usage.completionTokens,
        finishReason,
      }));
    },
  });

  return result;
}
```

---

### 6. Persisting Chat Messages to Database

Many products need to store the full conversation history. There are **three distinct moments** to write to the database, each with different trade-offs.

#### Timing overview

| When | What you can save | Trade-off |
|---|---|---|
| **Before** `streamText` | User message + metadata | Earliest; AI reply not yet available |
| **`onFinish`** | Full AI reply + token usage | Most common; atomic, after stream ends |
| **`onChunk`** | Each token as it arrives | Real-time; higher write volume |

---

#### Option A — Save user message before, AI reply in `onFinish` (recommended)

This is the most common pattern. Save the user turn immediately so it's never lost, then append the assistant turn once the stream completes.

```ts
export async function streamChat(options: ChatOptions & { conversationId?: string }) {
  const model    = getLanguageModel(options.provider, options.modelId);
  const messages = options.messages ?? [{ role: "user" as const, content: options.prompt ?? "" }];

  // 1. Persist the user message before calling the model
  if (options.conversationId) {
    const lastUserMsg = messages.at(-1);
    if (lastUserMsg?.role === "user") {
      await db.insert(chatMessages).values({
        conversationId: options.conversationId,
        role:           "user",
        content:        lastUserMsg.content,
        createdAt:      new Date(),
      });
    }
  }

  return streamText({
    model,
    system: options.system,
    messages,
    // 2. Persist the assistant reply after the stream finishes
    onFinish: async ({ text, usage }) => {
      if (options.conversationId) {
        await db.insert(chatMessages).values({
          conversationId:  options.conversationId,
          role:            "assistant",
          content:         text,             // full reply text
          promptTokens:    usage.promptTokens,
          completionTokens: usage.completionTokens,
          createdAt:       new Date(),
        });
      }
    },
  });
}
```

> **Why save the user message first?**
> If the AI call fails mid-stream, the user message is already in the DB. You can show it in the UI and let the user retry, rather than losing the turn entirely.

---

#### Option B — Save everything in `onFinish` only (simpler)

If losing the user message on a failed request is acceptable (e.g. single-turn, stateless), you can do a single write at the end.

```ts
return streamText({
  model,
  system: options.system,
  messages,
  onFinish: async ({ text, usage }) => {
    await db.insert(chatMessages).values([
      // Save both turns atomically in one insert
      { role: "user",      content: messages.at(-1)!.content, conversationId: options.conversationId },
      { role: "assistant", content: text,                      conversationId: options.conversationId },
    ]);
  },
});
```

---

#### Option C — Stream chunks to DB in real time (`onChunk`)

Use this only if you need to resume an interrupted stream or show server-side progress. The write volume is high (one write per token).

```ts
let buffer = "";

return streamText({
  model,
  system: options.system,
  messages,
  onChunk: async ({ chunk }) => {
    if (chunk.type === "text-delta") {
      buffer += chunk.textDelta;
      // Optionally: debounce writes, e.g. flush every 50 chars
      await db
        .update(chatMessages)
        .set({ content: buffer })
        .where(eq(chatMessages.id, placeholderMessageId));
    }
  },
  onFinish: async ({ usage }) => {
    // Finalize: mark as complete, save token counts
    await db
      .update(chatMessages)
      .set({ status: "done", promptTokens: usage.promptTokens, completionTokens: usage.completionTokens })
      .where(eq(chatMessages.id, placeholderMessageId));
  },
});
```

> **Tip**: For Option C, insert a placeholder row with `status: "streaming"` before calling `streamText`, then update it in `onChunk` / `onFinish`. This lets the UI poll or subscribe to the row and render progress.

---

## Combining Multiple Patterns

In practice you'll want several of these at once. A production-ready `streamChat` might look like:

```ts
export async function streamChat(options: ChatOptions & { userId?: string }) {
  // 1. Rate limiting
  if (options.userId) await checkRateLimit(options.userId);

  // 2. Content safety
  assertContentSafe(options);

  const model    = getLanguageModel(options.provider, options.modelId);
  const messages = options.messages ?? [{ role: "user" as const, content: options.prompt ?? "" }];
  const startMs  = Date.now();

  // 3. Persist user message before calling the model
  if (options.conversationId) await saveUserMessage(options);

  // 4. Retry + 5. Token counting + 6. Logging + 7. Persist AI reply — all in one place
  return withRetry(() =>
    streamText({
      model,
      system: options.system,
      messages,
      onFinish: async ({ text, usage, finishReason }) => {
        await Promise.all([
          logAndTrackUsage({ options, usage, finishReason, durationMs: Date.now() - startMs }),
          options.conversationId
            ? saveAssistantMessage({ conversationId: options.conversationId, text, usage })
            : Promise.resolve(),
        ]);
      },
    })
  );
}
```

`route.ts` stays unchanged — it only calls `streamChat(...)` and returns the stream. All cross-cutting concerns live here.

---

## Key AI SDK References

| Feature | API |
|---|---|
| Streaming text | [`streamText()`](https://sdk.vercel.ai/docs/reference/ai-sdk-core/stream-text) |
| Post-stream hook | `streamText({ onFinish })` |
| Per-chunk hook | `streamText({ onChunk })` |
| Full reply text | `onFinish({ text })` |
| Token usage | `result.usage` (Promise) or `onFinish({ usage })` |
| Finish reason | `onFinish({ finishReason })` — `"stop"`, `"length"`, `"tool-calls"`, `"error"` |
| HTTP response | `result.toUIMessageStreamResponse()` |
