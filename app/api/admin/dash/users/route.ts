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
    const email = searchParams.get("email");
    const workspaceId = searchParams.get("workspaceId");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = {};

    if (email) {
      where.email = { contains: email, mode: "insensitive" };
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          platformRole: true,
          hasCompletedOnboarding: true,
          createdAt: true,
          workspaces: {
            select: {
              role: true,
              workspace: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      db.user.count({ where }),
    ]);

    await logAdminAction({
      level: "INFO",
      action: "USERS_LIST_ACCESSED",
      userId: authResult.userId,
      metadata: { filters: { email, workspaceId } },
    });

    return NextResponse.json(
      { users, total, limit, offset },
      {
        headers: {
          "Access-Control-Allow-Origin": req.headers.get("origin") || "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
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
