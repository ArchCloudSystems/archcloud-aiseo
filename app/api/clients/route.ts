import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { getUserWorkspace } from "@/lib/workspace";

const createClientSchema = z.object({
  name: z.string().min(1).max(200),
  primaryDomain: z.string().url().optional().or(z.literal("")),
  contactEmail: z.string().email().optional().or(z.literal("")),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspace = await getUserWorkspace(session.user.id);

    const clients = await db.client.findMany({
      where: { workspaceId: workspace.id },
      include: {
        _count: {
          select: {
            projects: true,
            documents: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ clients });
  } catch (error) {
    console.error("[CLIENTS_GET]", error);
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
    const validatedData = createClientSchema.parse(body);

    const workspace = await getUserWorkspace(session.user.id);

    const client = await db.client.create({
      data: {
        workspaceId: workspace.id,
        name: validatedData.name,
        primaryDomain: validatedData.primaryDomain || null,
        contactEmail: validatedData.contactEmail || null,
        notes: validatedData.notes || null,
      },
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", issues: error.issues }, { status: 400 });
    }
    console.error("[CLIENTS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
