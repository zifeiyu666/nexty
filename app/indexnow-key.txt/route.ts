import { getIndexNowKey } from "@/lib/indexnow";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  const key = getIndexNowKey();

  if (!key) {
    return new NextResponse("IndexNow is not configured.", { status: 404 });
  }

  return new NextResponse(key, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}
