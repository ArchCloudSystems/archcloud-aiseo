import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireServiceAccount } from "@/lib/service-auth";

export async function GET() {
  try {
    await requireServiceAccount();

    const dbCheck = await db.$queryRaw`SELECT 1 as health`;

    const stats = {
      database: dbCheck ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      env: {
        nodeEnv: process.env.NODE_ENV,
        hasOpenAI: !!process.env.OPENAI_API_KEY,
        hasSerpAPI: !!process.env.SERPAPI_API_KEY,
        hasStripe: !!process.env.STRIPE_SECRET_KEY,
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("[ADMIN_HEALTH_GET]", error);
    return NextResponse.json(
      {
        database: "unhealthy",
        error: error instanceof Error ? error.message : "Health check failed",
      },
      { status: 500 }
    );
  }
}
