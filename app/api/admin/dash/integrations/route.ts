export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin, validateDashAppRequest } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logAdminAction } from "@/lib/admin-logger";

export async function GET(req: NextRequest) {
  const authResult = await requireSuperAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  if (!validateDashAppRequest(req)) {
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 }
    );
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const workspaceId = searchParams.get("workspaceId");
    const type = searchParams.get("type");

    const where: any = {};

    if (workspaceId) {
      where.workspaceId = workspaceId;
    }

    if (type) {
      where.type = type;
    }

    const integrations = await db.integrationConfig.findMany({
      where,
      select: {
        id: true,
        type: true,
        displayName: true,
        isEnabled: true,
        lastTestedAt: true,
        lastTestStatus: true,
        lastTestError: true,
        createdAt: true,
        updatedAt: true,
        workspaceId: true,
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    await logAdminAction({
      level: "INFO",
      action: "INTEGRATIONS_LIST_ACCESSED",
      userId: authResult.userId,
      metadata: { filters: { workspaceId, type } },
    });

    return NextResponse.json(
      { integrations },
      {
        headers: {
          "Access-Control-Allow-Origin": req.headers.get("origin") || "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching integrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch integrations" },
      { status: 500 }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": req.headers.get("origin") || "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  );
}
