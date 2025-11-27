import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, RateLimitIdentifier } from "./rate-limit-postgres";

export async function withRateLimit(
  req: NextRequest,
  workspaceId: string | undefined,
  userId: string | undefined,
  route: string
): Promise<NextResponse | null> {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const method = req.method;

  const identifier: RateLimitIdentifier = {
    workspaceId,
    userId,
    ip,
    route,
    method,
  };

  const result = await checkRateLimit(identifier);

  if (!result.allowed) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded. Please try again later.",
        retryAfter: result.retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(result.retryAfter || 60),
          "X-RateLimit-Remaining": String(result.remaining),
        },
      }
    );
  }

  return null;
}
