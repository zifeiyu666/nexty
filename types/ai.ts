// ============================================================
// Generation Types
// ============================================================

/** Common generation request */
export interface GenerationRequest {
  provider: string;
  modelId: string;
  prompt: string;
}

/** Chat request */
export interface ChatRequest extends GenerationRequest {
  messages?: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  system?: string;
}

/** Image request */
export interface ImageRequest extends GenerationRequest {
  size?: string;
  sourceImage?: string;
}

/** Video request */
export interface VideoRequest extends GenerationRequest {
  duration: number;
  image?: string;
  aspectRatio?: string;
  resolution?: string;
  negativePrompt?: string;
  cfgScale?: number;
  generateAudio?: boolean;
  cameraFixed?: boolean;
  seed?: number;
}

// ============================================================
// Generation Results
// ============================================================

export interface ImageResult {
  imageUrl: string;
  mimeType: string;
}

export interface VideoTaskResult {
  taskId: string;
  status: "pending" | "processing" | "succeeded" | "failed";
  videoUrl?: string;
  error?: string;
}

// ============================================================
// Replicate Types (kept for webhook payload typing)
// ============================================================

export interface ReplicatePredictionResponse {
  id: string;
  version?: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  input: Record<string, any>;
  output: string | string[] | Record<string, any> | null;
  error: { message: string; cause: string | null; stack: string | null } | null;
  logs: string | null;
  metrics?: { predict_time?: number; total_time?: number };
  urls: { stream?: string; get: string; cancel: string };
  created_at: string;
  completed_at: string | null;
}

// ============================================================
// fal.ai Types
// ============================================================

export interface FalVideoResult {
  video: { url: string; content_type: string };
  seed?: number;
}

export interface FalWebhookPayload {
  status: "OK" | "ERROR";
  payload: FalVideoResult | null;
  error: string | null;
  request_id: string;
}
