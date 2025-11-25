import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { getUserWorkspace } from "@/lib/workspace";

const createDocumentSchema = z.object({
  title: z.string().min(1).max(200),
  type: z.enum(["NOTE", "REPORT", "UPLOAD", "LEGAL", "STRATEGY", "RESEARCH"]),
  content: z.string().optional(),
  url: z.string().url().optional().or(z.literal("")),
  tags: z.string().optional(),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const projectId = searchParams.get("projectId");
    const workspace = await getUserWorkspace(session.user.id);

    const where: any = {
      workspaceId: workspace.id,
    };

    if (clientId) {
      where.clientId = clientId;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    const documents = await db.document.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("[DOCUMENTS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createDocumentSchema.parse(body);
    const workspace = await getUserWorkspace(session.user.id);

    const document = await db.document.create({
      data: {
        workspaceId: workspace.id,
        title: validatedData.title,
        type: validatedData.type,
        content: validatedData.content || null,
        url: validatedData.url || null,
        tags: validatedData.tags || null,
        clientId: validatedData.clientId || null,
        projectId: validatedData.projectId || null,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", issues: error.issues }, { status: 400 });
    }
    console.error("[DOCUMENTS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
