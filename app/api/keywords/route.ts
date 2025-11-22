import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { getUserPlan } from "@/lib/plan-helper";
import { getLimitsForPlan, checkLimit } from "@/lib/limits";

const createKeywordSchema = z.object({
  projectId: z.string().min(1),
  term: z.string().min(1).max(200),
  searchVolume: z.number().int().positive().optional(),
  difficulty: z.number().int().min(0).max(100).optional(),
  intent: z.string().optional(),
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
      project: {
        ownerId: session.user.id,
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

    const body = await request.json();
    const validatedData = createKeywordSchema.parse(body);

    const project = await db.project.findFirst({
      where: {
        id: validatedData.projectId,
        ownerId: session.user.id,
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

    const limitCheck = checkLimit(
      project._count.keywords,
      limits.maxKeywordsPerProject,
      "keywords per project"
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

    const keyword = await db.keyword.create({
      data: {
        projectId: validatedData.projectId,
        term: validatedData.term,
        searchVolume: validatedData.searchVolume,
        difficulty: validatedData.difficulty,
        intent: validatedData.intent,
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

    return NextResponse.json({ keyword }, { status: 201 });
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
