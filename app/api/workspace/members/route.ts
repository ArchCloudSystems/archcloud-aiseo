export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, requireWorkspaceAdmin } from "@/lib/rbac";
import { z } from "zod";
import { OrgMemberRole } from "@prisma/client";

const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(OrgMemberRole).default(OrgMemberRole.MEMBER),
});

export async function GET() {
  try {
    const context = await requireAuth();

    const members = await db.workspaceUser.findMany({
      where: {
        workspaceId: context.workspaceId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const workspace = await db.workspace.findUnique({
      where: { id: context.workspaceId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({
      members,
      owner: workspace?.owner,
      workspace: workspace
        ? {
            id: workspace.id,
            name: workspace.name,
            slug: workspace.slug,
          }
        : null,
    });
  } catch (error) {
    console.error("[WORKSPACE_MEMBERS_GET]", error);

    if (error instanceof Error) {
      if (error.message.includes("Unauthorized")) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      if (error.message.includes("Forbidden")) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireWorkspaceAdmin();

    const body = await request.json();
    const validatedData = inviteMemberSchema.parse(body);

    const invitedUser = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!invitedUser) {
      return NextResponse.json(
        { error: "User not found. They must create an account first." },
        { status: 404 }
      );
    }

    const existingMember = await db.workspaceUser.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: context.workspaceId,
          userId: invitedUser.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this workspace" },
        { status: 400 }
      );
    }

    const member = await db.workspaceUser.create({
      data: {
        workspaceId: context.workspaceId,
        userId: invitedUser.id,
        role: validatedData.role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", issues: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      if (error.message.includes("Unauthorized")) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      if (error.message.includes("Forbidden")) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }

    console.error("[WORKSPACE_MEMBERS_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
