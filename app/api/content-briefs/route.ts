import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { getUserPlan } from "@/lib/plan-helper";
import { getLimitsForPlan, checkLimit } from "@/lib/limits";
import { generateContentBrief } from "@/lib/openai";

const createBriefSchema = z.object({
  projectId: z.string().min(1),
  targetKeyword: z.string().min(1).max(200),
  targetUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional(),
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

    const briefs = await db.contentBrief.findMany({
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

    return NextResponse.json({ briefs });
  } catch (error) {
    console.error("[CONTENT_BRIEFS_GET]", error);
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
    const validatedData = createBriefSchema.parse(body);

    const plan = await getUserPlan(session.user.id);
    const limits = getLimitsForPlan(plan);

    const briefCount = await db.contentBrief.count({
      where: {
        userId: session.user.id,
        projectId: validatedData.projectId,
      },
    });

    const limitCheck = checkLimit(
      briefCount,
      limits.maxBriefsPerProject,
      "content briefs per project"
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

    const briefData = await generateContentBrief({
      targetKeyword: validatedData.targetKeyword,
      targetUrl: validatedData.targetUrl,
      notes: validatedData.notes,
      model: limits.openAIModel,
    });

    const brief = await db.contentBrief.create({
      data: {
        userId: session.user.id,
        projectId: validatedData.projectId,
        targetKeyword: validatedData.targetKeyword,
        targetUrl: validatedData.targetUrl || null,
        title: briefData.title,
        metaDescription: briefData.metaDescription,
        outline: JSON.stringify(briefData.outline),
        talkingPoints: JSON.stringify(briefData.talkingPoints),
        notes: validatedData.notes,
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
        brief: {
          ...brief,
          outline: briefData.outline,
          talkingPoints: briefData.talkingPoints,
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

    console.error("[CONTENT_BRIEFS_POST]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
