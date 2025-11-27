import { NextRequest, NextResponse } from "next/server";
import { requireWorkspaceAdmin } from "@/lib/rbac";
import { db } from "@/lib/db";
import { encryptCredentials, decryptCredentials } from "@/lib/crypto";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireWorkspaceAdmin();
    const { id } = await params;

    const config = await db.integrationConfig.findUnique({
      where: { id },
    });

    if (!config) {
      return NextResponse.json(
        { error: "Integration config not found" },
        { status: 404 }
      );
    }

    if (config.workspaceId !== context.workspaceId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const credentials = decryptCredentials(config.encryptedCredentials);

    return NextResponse.json({
      id: config.id,
      type: config.type,
      displayName: config.displayName,
      isEnabled: config.isEnabled,
      credentials,
      lastTestedAt: config.lastTestedAt,
      lastTestStatus: config.lastTestStatus,
      lastTestError: config.lastTestError,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching integration config:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: error instanceof Error && error.message.includes("Forbidden") ? 403 : 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireWorkspaceAdmin();
    const { id } = await params;
    const body = await req.json();

    const existing = await db.integrationConfig.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Integration config not found" },
        { status: 404 }
      );
    }

    if (existing.workspaceId !== context.workspaceId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { displayName, credentials, isEnabled } = body;

    const updateData: {
      displayName?: string | null;
      encryptedCredentials?: string;
      isEnabled?: boolean;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (displayName !== undefined) {
      updateData.displayName = displayName;
    }

    if (credentials) {
      updateData.encryptedCredentials = encryptCredentials(credentials);
    }

    if (isEnabled !== undefined) {
      updateData.isEnabled = isEnabled;
    }

    const config = await db.integrationConfig.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        type: true,
        displayName: true,
        isEnabled: true,
        lastTestedAt: true,
        lastTestStatus: true,
        lastTestError: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error updating integration config:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: error instanceof Error && error.message.includes("Forbidden") ? 403 : 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireWorkspaceAdmin();
    const { id } = await params;

    const existing = await db.integrationConfig.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Integration config not found" },
        { status: 404 }
      );
    }

    if (existing.workspaceId !== context.workspaceId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    await db.integrationConfig.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting integration config:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: error instanceof Error && error.message.includes("Forbidden") ? 403 : 500 }
    );
  }
}
