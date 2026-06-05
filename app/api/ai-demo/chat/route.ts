import { streamChat } from "@/lib/ai/chat";
import { getSession } from "@/lib/auth/server";
import { apiResponse } from "@/lib/api-response";
import { z } from "zod";

// TODO [Auth]: Add session verification before handling the request.
//   import { getSession } from "@/lib/auth/server";
//   const session = await getSession();
//   if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

// TODO [Rate Limit]: Apply per-user rate limiting to prevent abuse.
//   import { checkRateLimit, getClientIPFromHeaders } from "@/lib/upstash";
//   Call checkRateLimit(userId, REDIS_RATE_LIMIT_CONFIGS.chatApi) before processing.

// TODO [Credits]: Deduct credits/usage after a successful stream.
//   See actions/usage/deduct.ts for the deductUsage pattern.
//   Estimate token cost before streaming; finalize deduction in onFinish callback.

// TODO [DB - Save Conversation]: Persist conversation records to the database.
//   Schema suggestion: table ai_chat_messages { id, userId, sessionId, role, content,
//   provider, modelId, promptTokens, completionTokens, createdAt }
//   Call a DB insert inside the streamText onFinish callback so you have the final token counts.
//   See Drizzle schema patterns in db/schema/ and lib/db/ for examples.

// TODO [Multimodal - Image in Messages]: If your chat supports image attachments,
//   have the client upload images to R2 via presigned URL BEFORE sending this request,
//   then pass the R2 public URL in the message parts instead of a base64 data URI.
//   Client upload flow:
//     1. Call generateUserPresignedUploadUrl() from actions/r2-resources/index.ts
//     2. PUT the file directly to the presignedUrl from the browser
//     3. Include publicObjectUrl in the message parts sent here
//   This avoids sending large base64 payloads in the JSON body.

// v6 UIMessage format: messages have `parts` array instead of `content` string
const uiMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().optional(),
  parts: z
    .array(
      z.object({
        type: z.string(),
        text: z.string().optional(),
      }).passthrough()
    )
    .optional(),
});

const inputSchema = z.object({
  provider: z.string().min(1),
  modelId: z.string().min(1),
  messages: z.array(uiMessageSchema).optional(),
  prompt: z.string().optional(),
}).refine(
  (data) => data.messages || data.prompt,
  { message: "Either 'messages' or 'prompt' is required" }
);

function extractContent(msg: z.infer<typeof uiMessageSchema>): string {
  if (msg.content) return msg.content;
  if (msg.parts) {
    return msg.parts
      .filter((p) => p.type === "text" && p.text)
      .map((p) => p.text!)
      .join("");
  }
  return "";
}

export async function POST(req: Request) {
  try {
    // Demo restriction: Only admins can use AI demo to prevent API key abuse.
    // In production, remove this check and use proper auth + rate limiting instead.
    const session = await getSession();
    if (!session?.user) {
      return apiResponse.unauthorized("Please sign in to use the AI demo.");
    }
    if (session.user.role !== "admin") {
      return apiResponse.forbidden("Admin privileges required.");
    }

    const body = await req.json();
    const input = inputSchema.parse(body);

    const messages = input.messages?.map((m) => ({
      role: m.role,
      content: extractContent(m),
    }));

    const result = streamChat({
      provider: input.provider,
      modelId: input.modelId,
      messages,
      prompt: input.prompt,
      system: "You are a helpful assistant." // custom system prompt
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    return apiResponse.serverError(error.message || "Chat generation failed");
  }
}
