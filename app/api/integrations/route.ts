import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUserWorkspace } from "@/lib/workspace";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const INTEGRATION_TYPES = ["GA4", "GSC", "SERPAPI", "OPENAI", "STRIPE"];
    const workspace = await getUserWorkspace(session.user.id);

    let integrations = await db.integration.findMany({
      where: { workspaceId: workspace.id },
    });

    for (const type of INTEGRATION_TYPES) {
      const exists = integrations.find((i) => i.type === type);
      if (!exists) {
        const envVarMap: Record<string, string> = {
          GA4: "GA4_API_KEY",
          GSC: "GSC_API_KEY",
          SERPAPI: "SERP_API_KEY",
          OPENAI: "OPENAI_API_KEY",
          STRIPE: "STRIPE_SECRET_KEY",
        };

        const envVar = envVarMap[type];
        const isConfigured = process.env[envVar] ? true : false;

        const integration = await db.integration.create({
          data: {
            workspaceId: workspace.id,
            type,
            status: isConfigured ? "CONNECTED" : "DISCONNECTED",
          },
        });
        integrations.push(integration);
      }
    }

    return NextResponse.json({ integrations });
  } catch (error) {
    console.error("[INTEGRATIONS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

