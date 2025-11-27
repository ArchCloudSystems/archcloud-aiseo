export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireServiceAccount } from "@/lib/service-auth";

export async function GET(request: Request) {
  try {
    await requireServiceAccount();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const includeStats = searchParams.get("includeStats") === "true";

    const workspaces = await db.workspace.findMany({
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
          },
        },
        subscription: {
          select: {
            plan: true,
            status: true,
            currentPeriodEnd: true,
          },
        },
        _count: {
          select: {
            users: true,
            projects: true,
            clients: true,
            documents: true,
            integrations: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: Math.min(limit, 1000),
    });

    let stats = null;

    if (includeStats) {
      const totalWorkspaces = await db.workspace.count();
      const totalUsers = await db.user.count();
      const totalProjects = await db.project.count();
      const totalKeywords = await db.keyword.count();
      const totalAudits = await db.seoAudit.count();
      const totalBriefs = await db.contentBrief.count();

      const subscriptionStats = await db.subscription.groupBy({
        by: ["plan"],
        _count: {
          plan: true,
        },
      });

      stats = {
        totalWorkspaces,
        totalUsers,
        totalProjects,
        totalKeywords,
        totalAudits,
        totalBriefs,
        subscriptionBreakdown: subscriptionStats,
      };
    }

    return NextResponse.json({
      workspaces,
      count: workspaces.length,
      stats,
    });
  } catch (error) {
    console.error("[ADMIN_WORKSPACES_GET]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unauthorized" },
      { status: 401 }
    );
  }
}
