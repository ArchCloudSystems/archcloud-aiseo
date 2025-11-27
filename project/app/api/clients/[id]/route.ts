import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { getUserWorkspace } from "@/lib/workspace";

const updateClientSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  primaryDomain: z.string().url().optional().or(z.literal("")),
  contactEmail: z.string().email().optional().or(z.literal("")),
  notes: z.string().optional(),
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

    const client = await db.client.findFirst({
      where: {
        id,
        workspaceId: workspace.id,
      },
      include: {
        projects: {
          include: {
            _count: {
              select: {
                keywords: true,
                audits: true,
                contentBriefs: true,
              },
            },
          },
        },
        _count: {
          select: {
            projects: true,
            documents: true,
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const stats = {
      totalKeywords: client.projects.reduce((sum, p) => sum + p._count.keywords, 0),
      totalAudits: client.projects.reduce((sum, p) => sum + p._count.audits, 0),
      totalContentBriefs: client.projects.reduce((sum, p) => sum + p._count.contentBriefs, 0),
    };

    return NextResponse.json({ client, stats });
  } catch (error) {
    console.error("[CLIENT_GET]", error);
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
    const validatedData = updateClientSchema.parse(body);
    const workspace = await getUserWorkspace(session.user.id);

    const existingClient = await db.client.findFirst({
      where: {
        id,
        workspaceId: workspace.id,
      },
    });

    if (!existingClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const client = await db.client.update({
      where: { id },
      data: {
        ...validatedData,
        primaryDomain: validatedData.primaryDomain || null,
        contactEmail: validatedData.contactEmail || null,
      },
    });

    return NextResponse.json({ client });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", issues: error.issues }, { status: 400 });
    }
    console.error("[CLIENT_PATCH]", error);
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

    const existingClient = await db.client.findFirst({
      where: {
        id,
        workspaceId: workspace.id,
      },
    });

    if (!existingClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    await db.client.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CLIENT_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
