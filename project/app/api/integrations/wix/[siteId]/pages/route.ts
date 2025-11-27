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
        type: "WIX",
      },
    });

    if (!site) {
      return NextResponse.json({ success: false, error: "Site not found" }, { status: 404 });
    }

    const meta = site.meta ? JSON.parse(site.meta) : {};
    const { siteId: wixSiteId, apiToken } = meta;

    if (!wixSiteId || !apiToken) {
      return NextResponse.json(
        { success: false, error: "No Wix credentials configured" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://www.wixapis.com/v1/sites/${wixSiteId}/pages`,
      {
        headers: {
          Authorization: apiToken,
        },
      }
    ).catch(() => null);

    if (!response || !response.ok) {
      return NextResponse.json({
        success: false,
        pages: [],
        message: "Unable to fetch pages from Wix",
      });
    }

    const data = await response.json();
    const pages = data.pages || [];

    const formattedPages = pages.map((page: any) => ({
      id: page.id,
      title: page.title || "Untitled",
      url: page.url || `${site.url}${page.slug || ""}`,
      status: "published",
      modified: page.lastModified,
    }));

    return NextResponse.json({
      success: true,
      pages: formattedPages,
    });
  } catch (error) {
    console.error("Error fetching Wix pages:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch pages" },
      { status: 500 }
    );
  }
}
