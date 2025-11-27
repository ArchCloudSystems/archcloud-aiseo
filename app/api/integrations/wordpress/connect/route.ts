export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/rbac";
import { db } from "@/lib/db";
import { z } from "zod";

const connectSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  apiToken: z.string().min(1),
  projectId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const context = await requireAuth();
    const body = await req.json();
    const { name, url, apiToken, projectId } = connectSchema.parse(body);

    const testResult = await fetch(`${url}/wp-json/wp/v2/posts?per_page=1`, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    }).catch(() => null);

    const status = testResult?.ok ? "CONNECTED" : "ERROR";
    const lastSyncStatus = testResult?.ok
      ? "Successfully connected"
      : "Failed to connect - check URL and API token";

    const connectedSite = await db.connectedSite.create({
      data: {
        workspaceId: context.workspaceId,
        projectId: projectId || null,
        type: "WORDPRESS",
        name,
        url,
        status,
        lastSyncAt: testResult?.ok ? new Date() : null,
        lastSyncStatus,
        meta: JSON.stringify({ apiToken }),
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
    console.error("Error connecting WordPress site:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to connect WordPress site" },
      { status: 500 }
    );
  }
}
