export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireServiceAccount } from "@/lib/service-auth";

export async function GET(request: Request) {
  try {
    await requireServiceAccount();

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const type = searchParams.get("type");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = parseInt(searchParams.get("limit") || "100");

    const where: any = {};

    if (workspaceId) {
      where.workspaceId = workspaceId;
    }

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const events = await db.telemetryEvent.findMany({
      where,
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: Math.min(limit, 1000),
    });

    return NextResponse.json({
      events,
      count: events.length,
    });
  } catch (error) {
    console.error("[ADMIN_TELEMETRY_GET]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unauthorized" },
      { status: 401 }
    );
  }
}
