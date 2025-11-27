export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireServiceAccount } from "@/lib/service-auth";

export async function GET(request: Request) {
  try {
    await requireServiceAccount();

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = parseInt(searchParams.get("limit") || "30");

    const where: any = {};

    if (workspaceId) {
      where.workspaceId = workspaceId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const snapshots = await db.dailyUsageSnapshot.findMany({
      where,
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
            owner: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
      take: Math.min(limit, 365),
    });

    const aggregates = await db.dailyUsageSnapshot.aggregate({
      where,
      _sum: {
        loginCount: true,
        projectCount: true,
        keywordSearchCount: true,
        auditRunCount: true,
        contentBriefCount: true,
        documentCount: true,
        apiCallCount: true,
        errorCount: true,
      },
      _avg: {
        loginCount: true,
        projectCount: true,
        keywordSearchCount: true,
        auditRunCount: true,
        contentBriefCount: true,
        documentCount: true,
        apiCallCount: true,
        errorCount: true,
      },
    });

    return NextResponse.json({
      snapshots,
      count: snapshots.length,
      aggregates,
    });
  } catch (error) {
    console.error("[ADMIN_USAGE_GET]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unauthorized" },
      { status: 401 }
    );
  }
}
