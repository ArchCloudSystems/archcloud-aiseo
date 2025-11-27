export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { getUserPlan } from "@/lib/plan-helper";
import { getLimitsForPlan, checkLimit } from "@/lib/limits";
import { analyzeSEO } from "@/lib/seo-analyzer";
import { enhanceSEORecommendations } from "@/lib/openai";
import { getUserWorkspace } from "@/lib/workspace";
import { runPageSpeedAudit } from "@/lib/pagespeed-api";
import { getOrFallbackPageSpeedKey, getOrFallbackOpenAIKey } from "@/lib/integration-helper";

const createAuditSchema = z.object({
  projectId: z.string().min(1),
  url: z.string().url("Must be a valid URL"),
  keyword: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const workspace = await getUserWorkspace(session.user.id);

    const where: any = {
      project: {
        workspaceId: workspace.id,
      },
    };

    if (projectId) {
      where.projectId = projectId;
    }

    const audits = await db.seoAudit.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return NextResponse.json({ audits });
  } catch (error) {
    console.error("[AUDITS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createAuditSchema.parse(body);

    const workspace = await getUserWorkspace(session.user.id);
    const plan = await getUserPlan(session.user.id);
    const limits = getLimitsForPlan(plan);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentAuditCount = await db.seoAudit.count({
      where: {
        project: {
          workspaceId: workspace.id,
        },
        createdAt: {
          gte: oneWeekAgo,
        },
      },
    });

    const limitCheck = checkLimit(
      recentAuditCount,
      limits.maxAuditsPerWeek,
      "audits per week"
    );

    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: limitCheck.reason,
          current: limitCheck.current,
          limit: limitCheck.limit,
        },
        { status: 403 }
      );
    }

    const pageSpeedKey = await getOrFallbackPageSpeedKey(workspace.id);
    const openaiKey = await getOrFallbackOpenAIKey(workspace.id);

    const [analysis, pageSpeedResult] = await Promise.all([
      analyzeSEO(validatedData.url),
      runPageSpeedAudit(validatedData.url, pageSpeedKey),
    ]);

    const recommendations = await enhanceSEORecommendations({
      url: validatedData.url,
      issues: analysis.issues,
      score: analysis.score,
      model: limits.openAIModel,
      apiKey: openaiKey,
    });

    const combinedIssues = [...analysis.issues, ...pageSpeedResult.issues];
    const avgScore = Math.round((analysis.score + (pageSpeedResult.performanceScore || 0)) / 2);

    const audit = await db.seoAudit.create({
      data: {
        projectId: validatedData.projectId,
        url: validatedData.url,
        overallScore: avgScore,
        seoScore: pageSpeedResult.seoScore,
        performanceScore: pageSpeedResult.performanceScore,
        accessibilityScore: pageSpeedResult.accessibilityScore,
        bestPracticesScore: pageSpeedResult.bestPracticesScore,
        mobileFriendly: pageSpeedResult.mobileFriendly,
        title: analysis.title,
        metaDescription: analysis.metaDescription,
        h1Count: analysis.h1Count,
        h2Count: 0,
        wordCount: analysis.wordCount,
        loadTime: pageSpeedResult.loadTime,
        issuesJson: JSON.stringify({ issues: combinedIssues, recommendations }),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        audit: {
          ...audit,
          issues: analysis.issues,
          recommendations,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", issues: error.issues },
        { status: 400 }
      );
    }

    console.error("[AUDITS_POST]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
