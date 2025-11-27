export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { getUserPlan } from "@/lib/plan-helper";
import { getLimitsForPlan, checkLimit } from "@/lib/limits";
import { fetchKeywordMetrics } from "@/lib/serp-api";
import { checkRateLimit } from "@/lib/rate-limit";
import { getUserWorkspace } from "@/lib/workspace";
import { getOrFallbackSERPAPIKey } from "@/lib/integration-helper";

const createKeywordSchema = z.object({
  projectId: z.string().min(1),
  terms: z.array(z.string().min(1).max(200)).min(1).max(20),
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

    const keywords = await db.keyword.findMany({
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
    });

    return NextResponse.json({ keywords });
  } catch (error) {
    console.error("[KEYWORDS_GET]", error);
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

    const rateLimit = checkRateLimit(session.user.id, "keywords", {
      maxRequests: 10,
      windowMs: 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validatedData = createKeywordSchema.parse(body);

    const workspace = await getUserWorkspace(session.user.id);

    const project = await db.project.findFirst({
      where: {
        id: validatedData.projectId,
        workspaceId: workspace.id,
      },
      include: {
        _count: {
          select: { keywords: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const plan = await getUserPlan(session.user.id);
    const limits = getLimitsForPlan(plan);

    const newTotalCount = project._count.keywords + validatedData.terms.length;
    const limitCheck = checkLimit(
      newTotalCount - 1,
      limits.maxKeywordsPerProject,
      "keywords per project"
    );

    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: limitCheck.reason,
          current: project._count.keywords,
          limit: limitCheck.limit,
        },
        { status: 403 }
      );
    }

    const serpApiKey = await getOrFallbackSERPAPIKey(workspace.id);

    if (!serpApiKey) {
      return NextResponse.json(
        { error: "SERP API not configured. Please add your SERP API key in Integrations." },
        { status: 400 }
      );
    }

    const metrics = await fetchKeywordMetrics(validatedData.terms, serpApiKey);

    const keywords = await Promise.all(
      metrics.map((metric) =>
        db.keyword.create({
          data: {
            projectId: validatedData.projectId,
            term: metric.term,
            volume: metric.searchVolume,
            difficulty: metric.difficulty,
            cpc: metric.cpc,
            serpFeatureSummary: metric.intent,
          },
          include: {
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        })
      )
    );

    return NextResponse.json({ keywords }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", issues: error.issues },
        { status: 400 }
      );
    }

    console.error("[KEYWORDS_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
