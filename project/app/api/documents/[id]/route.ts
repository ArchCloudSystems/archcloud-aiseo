import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { getUserWorkspace } from "@/lib/workspace";

const updateDocumentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  type: z.enum(["NOTE", "REPORT", "UPLOAD", "LEGAL", "STRATEGY", "RESEARCH"]).optional(),
  content: z.string().optional(),
  url: z.string().url().optional().or(z.literal("")),
  tags: z.string().optional(),
  clientId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
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

    const document = await db.document.findFirst({
      where: {
        id,
        workspaceId: workspace.id,
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

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error("[DOCUMENT_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
    const body = await request.json();
    const validatedData = updateDocumentSchema.parse(body);
    const workspace = await getUserWorkspace(session.user.id);

    const existingDocument = await db.document.findFirst({
      where: {
        id,
        workspaceId: workspace.id,
      },
    });

    if (!existingDocument) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const document = await db.document.update({
      where: { id },
      data: {
        ...validatedData,
        url: validatedData.url || null,
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

    return NextResponse.json({ document });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", issues: error.issues }, { status: 400 });
    }
    console.error("[DOCUMENT_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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

    const existingDocument = await db.document.findFirst({
      where: {
        id,
        workspaceId: workspace.id,
      },
    });

    if (!existingDocument) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    await db.document.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DOCUMENT_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
