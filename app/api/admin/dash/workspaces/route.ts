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
    const name = searchParams.get("name");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = {};

    if (name) {
      where.name = { contains: name, mode: "insensitive" };
    }

    const [workspaces, total] = await Promise.all([
      db.workspace.findMany({
        where,
        include: {
          _count: {
            select: {
              users: true,
              projects: true,
              clients: true,
            },
          },
          users: {
            where: { role: "OWNER" },
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
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
      db.workspace.count({ where }),
    ]);

    await logAdminAction({
      level: "INFO",
      action: "WORKSPACES_LIST_ACCESSED",
      userId: authResult.userId,
      metadata: { filters: { name } },
    });

    return NextResponse.json(
      { workspaces, total, limit, offset },
      {
        headers: {
          "Access-Control-Allow-Origin": req.headers.get("origin") || "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    return NextResponse.json(
      { error: "Failed to fetch workspaces" },
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
