import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/rbac";
import { db } from "@/lib/db";

export async function POST(
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

    const testResult = await fetch(`${site.url}/wp-json/wp/v2/posts?per_page=1`, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    }).catch(() => null);

    const success = testResult?.ok === true;
    const status = success ? "CONNECTED" : "ERROR";
    const message = success
      ? "Successfully connected to WordPress"
      : "Failed to connect - check URL and API token";

    await db.connectedSite.update({
      where: { id: siteId },
      data: {
        status,
        lastSyncAt: success ? new Date() : undefined,
        lastSyncStatus: message,
      },
    });

    return NextResponse.json({
      success,
      message,
    });
  } catch (error) {
    console.error("Error testing WordPress connection:", error);
    return NextResponse.json(
      { success: false, error: "Failed to test connection" },
      { status: 500 }
    );
  }
}
