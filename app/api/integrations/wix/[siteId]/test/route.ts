export const runtime = "nodejs";

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

    const testResult = await fetch(
      `https://www.wixapis.com/v1/sites/${wixSiteId}/pages`,
      {
        headers: {
          Authorization: apiToken,
        },
      }
    ).catch(() => null);

    const success = testResult?.ok === true;
    const status = success ? "CONNECTED" : "ERROR";
    const message = success
      ? "Successfully connected to Wix"
      : "Failed to connect - check Site ID and API token";

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
    console.error("Error testing Wix connection:", error);
    return NextResponse.json(
      { success: false, error: "Failed to test connection" },
      { status: 500 }
    );
  }
}
