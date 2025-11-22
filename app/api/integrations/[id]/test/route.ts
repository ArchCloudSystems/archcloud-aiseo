import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const integration = await db.integration.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!integration) {
      return NextResponse.json(
        { error: "Integration not found" },
        { status: 404 }
      );
    }

    try {
      const testUrl = integration.baseUrl || "https://api.example.com/health";

      const response = await fetch(testUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${integration.apiKey}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(10000),
      });

      const isSuccess = response.ok;

      await db.integration.update({
        where: { id },
        data: {
          status: isSuccess ? "connected" : "error",
          lastCheckedAt: new Date(),
          lastError: isSuccess
            ? null
            : `HTTP ${response.status}: ${response.statusText}`,
        },
      });

      return NextResponse.json({
        success: isSuccess,
        status: response.status,
        message: isSuccess
          ? "Connection successful"
          : `Failed with status ${response.status}`,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Connection test failed";

      await db.integration.update({
        where: { id },
        data: {
          status: "error",
          lastCheckedAt: new Date(),
          lastError: errorMessage,
        },
      });

      return NextResponse.json(
        {
          success: false,
          message: errorMessage,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("[INTEGRATION_TEST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
