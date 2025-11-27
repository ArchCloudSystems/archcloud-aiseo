export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateUserWorkspace } from "@/lib/workspace";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { workspaceName, website } = body;

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { hasCompletedOnboarding: true },
    });

    if (user?.hasCompletedOnboarding) {
      return NextResponse.json(
        { error: "Onboarding already completed" },
        { status: 400 }
      );
    }

    const workspace = await getOrCreateUserWorkspace(session.user.id);

    if (workspaceName) {
      await db.workspace.update({
        where: { id: workspace.id },
        data: {
          name: workspaceName,
          website: website || null,
        },
      });
    }

    await db.user.update({
      where: { id: session.user.id },
      data: {
        hasCompletedOnboarding: true,
      },
    });

    return NextResponse.json({
      success: true,
      workspace: {
        id: workspace.id,
        name: workspaceName || workspace.name,
      },
    });
  } catch (error) {
    console.error("Error completing onboarding:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
