export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireWorkspaceAdmin } from "@/lib/rbac";
import { db } from "@/lib/db";
import { encryptCredentials, decryptCredentials } from "@/lib/crypto";
import { IntegrationType } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const context = await requireAuth();

    const configs = await db.integrationConfig.findMany({
      where: {
        workspaceId: context.workspaceId,
      },
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

    return NextResponse.json(configs);
  } catch (error) {
    console.error("Error fetching integration configs:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: error instanceof Error && error.message.includes("Forbidden") ? 403 : 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const context = await requireWorkspaceAdmin();
    const body = await req.json();

    const { type, displayName, credentials } = body;

    if (!type || !Object.values(IntegrationType).includes(type)) {
      return NextResponse.json(
        { error: "Invalid integration type" },
        { status: 400 }
      );
    }

    if (!credentials || typeof credentials !== "object") {
      return NextResponse.json(
        { error: "Credentials are required" },
        { status: 400 }
      );
    }

    const existing = await db.integrationConfig.findUnique({
      where: {
        workspaceId_type: {
          workspaceId: context.workspaceId,
          type,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Integration already exists. Use PUT to update." },
        { status: 409 }
      );
    }

    let encryptedCredentials: string;
    try {
      encryptedCredentials = encryptCredentials(credentials);
    } catch (encryptError) {
      return NextResponse.json(
        { error: "Failed to encrypt credentials" },
        { status: 500 }
      );
    }

    const config = await db.integrationConfig.create({
      data: {
        workspaceId: context.workspaceId,
        type,
        displayName: displayName || null,
        encryptedCredentials,
        isEnabled: true,
      },
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

    return NextResponse.json(config, { status: 201 });
  } catch (error) {
    console.error("Error creating integration config:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: error instanceof Error && error.message.includes("Forbidden") ? 403 : 500 }
    );
  }
}
