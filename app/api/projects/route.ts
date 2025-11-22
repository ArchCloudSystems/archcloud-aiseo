import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { getUserPlan } from "@/lib/plan-helper";
import { getLimitsForPlan, checkLimit } from "@/lib/limits";

const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100),
  domain: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await db.project.findMany({
      where: {
        ownerId: session.user.id,
      },
      include: {
        _count: {
          select: {
            keywords: true,
            audits: true,
            contentBriefs: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("[PROJECTS_GET]", error);
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
    const validatedData = createProjectSchema.parse(body);

    const plan = await getUserPlan(session.user.id);
    const limits = getLimitsForPlan(plan);

    const currentProjectCount = await db.project.count({
      where: { ownerId: session.user.id },
    });

    const limitCheck = checkLimit(
      currentProjectCount,
      limits.maxProjects,
      "projects"
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

    const project = await db.project.create({
      data: {
        name: validatedData.name,
        domain: validatedData.domain || null,
        ownerId: session.user.id,
        plan,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", issues: error.issues },
        { status: 400 }
      );
    }

    console.error("[PROJECTS_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
