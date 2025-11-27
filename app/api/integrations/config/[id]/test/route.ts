export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { requireWorkspaceAdmin } from "@/lib/rbac";
import { db } from "@/lib/db";
import { decryptCredentials } from "@/lib/crypto";
import { IntegrationType } from "@prisma/client";

async function testGA4Integration(credentials: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
  return { success: true, message: "GA4 validation not implemented yet" };
}

async function testGSCIntegration(credentials: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
  return { success: true, message: "GSC validation not implemented yet" };
}

async function testSERPAPIIntegration(credentials: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
  const apiKey = credentials.apiKey as string;
  if (!apiKey) {
    return { success: false, message: "API key is required" };
  }

  try {
    const response = await fetch(`https://serpapi.com/account.json?api_key=${apiKey}`);
    const data = await response.json();

    if (response.ok && data.account_id) {
      return { success: true, message: "SERP API connection successful" };
    }

    return { success: false, message: data.error || "Invalid API key" };
  } catch (error) {
    return { success: false, message: "Failed to connect to SERP API" };
  }
}

async function testOpenAIIntegration(credentials: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
  const apiKey = credentials.apiKey as string;
  if (!apiKey) {
    return { success: false, message: "API key is required" };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      return { success: true, message: "OpenAI connection successful" };
    }

    return { success: false, message: "Invalid API key" };
  } catch (error) {
    return { success: false, message: "Failed to connect to OpenAI" };
  }
}

async function testStripeIntegration(credentials: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
  return { success: true, message: "Stripe validation not implemented yet" };
}

async function testPageSpeedIntegration(credentials: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
  const apiKey = credentials.apiKey as string;
  if (!apiKey) {
    return { success: false, message: "API key is required" };
  }

  try {
    const testUrl = "https://example.com";
    const response = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(testUrl)}&key=${apiKey}`
    );

    if (response.ok) {
      return { success: true, message: "PageSpeed Insights connection successful" };
    }

    const data = await response.json();
    return { success: false, message: data.error?.message || "Invalid API key" };
  } catch (error) {
    return { success: false, message: "Failed to connect to PageSpeed Insights" };
  }
}

export async function POST(
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

    let testResult: { success: boolean; message: string };

    switch (config.type) {
      case IntegrationType.GA4:
        testResult = await testGA4Integration(credentials);
        break;
      case IntegrationType.GSC:
        testResult = await testGSCIntegration(credentials);
        break;
      case IntegrationType.SERP_API:
        testResult = await testSERPAPIIntegration(credentials);
        break;
      case IntegrationType.OPENAI:
        testResult = await testOpenAIIntegration(credentials);
        break;
      case IntegrationType.STRIPE:
        testResult = await testStripeIntegration(credentials);
        break;
      case IntegrationType.PAGESPEED:
        testResult = await testPageSpeedIntegration(credentials);
        break;
      default:
        return NextResponse.json(
          { error: "Unknown integration type" },
          { status: 400 }
        );
    }

    await db.integrationConfig.update({
      where: { id },
      data: {
        lastTestedAt: new Date(),
        lastTestStatus: testResult.success ? "success" : "error",
        lastTestError: testResult.success ? null : testResult.message,
      },
    });

    return NextResponse.json({
      success: testResult.success,
      message: testResult.message,
    });
  } catch (error) {
    console.error("Error testing integration config:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: error instanceof Error && error.message.includes("Forbidden") ? 403 : 500 }
    );
  }
}
