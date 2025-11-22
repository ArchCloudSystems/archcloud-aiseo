import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { getUserPlan } from "@/lib/plan-helper";
import { getLimitsForPlan, checkLimit } from "@/lib/limits";
import { analyzeSEO } from "@/lib/seo-analyzer";
import { enhanceSEORecommendations } from "@/lib/openai";

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

    const where: any = {
      userId: session.user.id,
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

    const plan = await getUserPlan(session.user.id);
    const limits = getLimitsForPlan(plan);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentAuditCount = await db.seoAudit.count({
      where: {
        userId: session.user.id,
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

    const analysis = await analyzeSEO(validatedData.url);

    const recommendations = await enhanceSEORecommendations({
      url: validatedData.url,
      issues: analysis.issues,
      score: analysis.score,
      model: limits.openAIModel,
    });

    const audit = await db.seoAudit.create({
      data: {
        userId: session.user.id,
        projectId: validatedData.projectId,
        url: validatedData.url,
        keyword: validatedData.keyword,
        score: analysis.score,
        statusCode: analysis.statusCode,
        title: analysis.title,
        metaDescription: analysis.metaDescription,
        h1Count: analysis.h1Count,
        wordCount: analysis.wordCount,
        issuesJson: JSON.stringify(analysis.issues),
        recommendationsJson: JSON.stringify(recommendations),
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
