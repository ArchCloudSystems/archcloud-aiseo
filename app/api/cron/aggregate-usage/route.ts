export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { headers } from "next/headers";

export async function POST() {
  try {
    const headersList = await headers();
    const authHeader = headersList.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("CRON_SECRET not configured");
      return NextResponse.json(
        { error: "Cron secret not configured" },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date(yesterday);
    today.setDate(today.getDate() + 1);

    const workspaces = await db.workspace.findMany({
      select: { id: true },
    });

    const results = [];

    for (const workspace of workspaces) {
      const events = await db.telemetryEvent.findMany({
        where: {
          workspaceId: workspace.id,
          createdAt: {
            gte: yesterday,
            lt: today,
          },
        },
      });

      const loginCount = events.filter((e) => e.type === "USER_LOGIN").length;
      const projectCount = events.filter(
        (e) =>
          e.type === "PROJECT_CREATED" ||
          e.type === "PROJECT_UPDATED" ||
          e.type === "PROJECT_DELETED"
      ).length;
      const keywordSearchCount = events.filter(
        (e) => e.type === "KEYWORD_SEARCH"
      ).length;
      const auditRunCount = events.filter((e) => e.type === "AUDIT_RUN").length;
      const contentBriefCount = events.filter(
        (e) => e.type === "CONTENT_BRIEF_GENERATED"
      ).length;
      const documentCount = events.filter(
        (e) => e.type === "DOCUMENT_CREATED"
      ).length;
      const apiCallCount = events.filter((e) => e.type === "API_CALL").length;
      const errorCount = events.filter(
        (e) => e.type === "ERROR_OCCURRED"
      ).length;

      const snapshot = await db.dailyUsageSnapshot.upsert({
        where: {
          workspaceId_date: {
            workspaceId: workspace.id,
            date: yesterday,
          },
        },
        create: {
          workspaceId: workspace.id,
          date: yesterday,
          loginCount,
          projectCount,
          keywordSearchCount,
          auditRunCount,
          contentBriefCount,
          documentCount,
          apiCallCount,
          errorCount,
        },
        update: {
          loginCount,
          projectCount,
          keywordSearchCount,
          auditRunCount,
          contentBriefCount,
          documentCount,
          apiCallCount,
          errorCount,
          updatedAt: new Date(),
        },
      });

      results.push({
        workspaceId: workspace.id,
        date: yesterday.toISOString().split("T")[0],
        snapshot: snapshot.id,
      });
    }

    return NextResponse.json({
      success: true,
      date: yesterday.toISOString().split("T")[0],
      workspacesProcessed: results.length,
      results,
    });
  } catch (error) {
    console.error("[CRON_AGGREGATE_USAGE]", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Aggregation failed",
      },
      { status: 500 }
    );
  }
}
