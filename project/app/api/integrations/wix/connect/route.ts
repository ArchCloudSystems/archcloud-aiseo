import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/rbac";
import { db } from "@/lib/db";
import { z } from "zod";

const connectSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  siteId: z.string().min(1),
  apiToken: z.string().min(1),
  projectId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const context = await requireAuth();
    const body = await req.json();
    const { name, url, siteId, apiToken, projectId } = connectSchema.parse(body);

    const testResult = await fetch(
      `https://www.wixapis.com/v1/sites/${siteId}/pages`,
      {
        headers: {
          Authorization: apiToken,
        },
      }
    ).catch(() => null);

    const status = testResult?.ok ? "CONNECTED" : "ERROR";
    const lastSyncStatus = testResult?.ok
      ? "Successfully connected"
      : "Failed to connect - check Site ID and API token";

    const connectedSite = await db.connectedSite.create({
      data: {
        workspaceId: context.workspaceId,
        projectId: projectId || null,
        type: "WIX",
        name,
        url,
        status,
        lastSyncAt: testResult?.ok ? new Date() : null,
        lastSyncStatus,
        meta: JSON.stringify({ siteId, apiToken }),
      },
    });

    return NextResponse.json({
      success: true,
      site: {
        id: connectedSite.id,
        name: connectedSite.name,
        url: connectedSite.url,
        status: connectedSite.status,
        type: connectedSite.type,
      },
    });
  } catch (error) {
    console.error("Error connecting Wix site:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to connect Wix site" },
      { status: 500 }
    );
  }
}
