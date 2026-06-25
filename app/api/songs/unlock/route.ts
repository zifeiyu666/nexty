import { apiResponse } from "@/lib/api-response";

export async function POST() {
  return apiResponse.error(
    "Song unlock is no longer supported. Use /api/songs/finalize to save a full song.",
    410
  );
}
