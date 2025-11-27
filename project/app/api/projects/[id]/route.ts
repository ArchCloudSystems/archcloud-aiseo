import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { getUserWorkspace } from "@/lib/workspace";

const updateProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100).optional(),
  domain: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const workspace = await getUserWorkspace(session.user.id);

    const project = await db.project.findFirst({
      where: {
        id: id,
        workspaceId: workspace.id,
      },
      include: {
        _count: {
          select: {
            keywords: true,
            audits: true,
            contentBriefs: true,
          },
        },
        keywords: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        audits: {
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("[PROJECT_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const workspace = await getUserWorkspace(session.user.id);

    const existingProject = await db.project.findFirst({
      where: {
        id: id,
        workspaceId: workspace.id,
      },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = updateProjectSchema.parse(body);

    const project = await db.project.update({
      where: { id: id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.domain !== undefined && { domain: validatedData.domain || null }),
      },
    });

    return NextResponse.json({ project });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", issues: error.issues },
        { status: 400 }
      );
    }

    console.error("[PROJECT_PATCH]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const workspace = await getUserWorkspace(session.user.id);

    const existingProject = await db.project.findFirst({
      where: {
        id: id,
        workspaceId: workspace.id,
      },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await db.project.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PROJECT_DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
