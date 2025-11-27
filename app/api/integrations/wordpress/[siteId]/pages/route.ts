export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/rbac";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const context = await requireAuth();
    const { siteId } = await params;

    const site = await db.connectedSite.findFirst({
      where: {
        id: siteId,
        workspaceId: context.workspaceId,
        type: "WORDPRESS",
      },
    });

    if (!site) {
      return NextResponse.json({ success: false, error: "Site not found" }, { status: 404 });
    }

    const meta = site.meta ? JSON.parse(site.meta) : {};
    const apiToken = meta.apiToken;

    if (!apiToken) {
      return NextResponse.json(
        { success: false, error: "No API token configured" },
        { status: 400 }
      );
    }

    const response = await fetch(`${site.url}/wp-json/wp/v2/pages?per_page=50`, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    }).catch(() => null);

    if (!response || !response.ok) {
      return NextResponse.json({
        success: false,
        pages: [],
        message: "Unable to fetch pages from WordPress",
      });
    }

    const pages = await response.json();

    const formattedPages = pages.map((page: any) => ({
      id: page.id,
      title: page.title?.rendered || "Untitled",
      url: page.link,
      status: page.status,
      modified: page.modified,
    }));

    return NextResponse.json({
      success: true,
      pages: formattedPages,
    });
  } catch (error) {
    console.error("Error fetching WordPress pages:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch pages" },
      { status: 500 }
    );
  }
}
