import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { getUserPlan } from "@/lib/plan-helper";
import { getLimitsForPlan } from "@/lib/limits";

const createIntegrationSchema = z.object({
  provider: z.string().min(1).max(100),
  name: z.string().min(1).max(200).optional(),
  baseUrl: z.string().url().optional().or(z.literal("")),
  apiKey: z.string().min(1).max(500),
});

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const integrations = await db.integration.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        provider: true,
        name: true,
        baseUrl: true,
        status: true,
        lastCheckedAt: true,
        lastError: true,
        createdAt: true,
        updatedAt: true,
        apiKey: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ integrations });
  } catch (error) {
    console.error("[INTEGRATIONS_GET]", error);
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
    const validatedData = createIntegrationSchema.parse(body);

    const plan = await getUserPlan(session.user.id);
    const limits = getLimitsForPlan(plan);

    if (!limits.integrationsAllowed) {
      return NextResponse.json(
        {
          error: "Integrations are not available on your current plan. Please upgrade to Pro or Agency.",
        },
        { status: 403 }
      );
    }

    const existing = await db.integration.findUnique({
      where: {
        userId_provider: {
          userId: session.user.id,
          provider: validatedData.provider,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Integration with this provider already exists" },
        { status: 409 }
      );
    }

    const integration = await db.integration.create({
      data: {
        userId: session.user.id,
        provider: validatedData.provider,
        name: validatedData.name,
        baseUrl: validatedData.baseUrl,
        apiKey: validatedData.apiKey,
        status: "pending",
      },
      select: {
        id: true,
        provider: true,
        name: true,
        baseUrl: true,
        status: true,
        lastCheckedAt: true,
        lastError: true,
        createdAt: true,
        updatedAt: true,
        apiKey: false,
      },
    });

    return NextResponse.json({ integration }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", issues: error.issues },
        { status: 400 }
      );
    }

    console.error("[INTEGRATIONS_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
