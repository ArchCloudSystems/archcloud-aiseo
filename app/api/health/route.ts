import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();

  try {
    await db.$queryRaw`SELECT 1`;
    const dbResponseTime = Date.now() - startTime;

    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: "connected",
        responseTime: `${dbResponseTime}ms`,
      },
      environment: process.env.NODE_ENV || "unknown",
      version: "1.0.0",
    };

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    const health = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      environment: process.env.NODE_ENV || "unknown",
      version: "1.0.0",
    };

    return NextResponse.json(health, { status: 503 });
  }
}
