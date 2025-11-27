export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUserWorkspace } from "@/lib/workspace";
import { stripe } from "@/lib/stripe";
import { openai } from "@/lib/openai";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = checkRateLimit(session.user.id, "integration-test", {
      maxRequests: 5,
      windowMs: 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const { id } = await params;
    const workspace = await getUserWorkspace(session.user.id);

    const integration = await db.integration.findUnique({
      where: { id },
    });

    if (!integration || integration.workspaceId !== workspace.id) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    let testResult = { success: false, message: "Unknown integration type" };

    switch (integration.type) {
      case "STRIPE": {
        if (!stripe) {
          testResult = {
            success: false,
            message: "Stripe is not configured. Add STRIPE_SECRET_KEY to your environment.",
          };
        } else {
          try {
            await stripe.balance.retrieve();
            testResult = {
              success: true,
              message: "Stripe connection successful",
            };
          } catch (error) {
            testResult = {
              success: false,
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to connect to Stripe",
            };
          }
        }
        break;
      }

      case "OPENAI": {
        if (!openai) {
          testResult = {
            success: false,
            message: "OpenAI is not configured. Add OPENAI_API_KEY to your environment.",
          };
        } else {
          try {
            const response = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [{ role: "user", content: "Say 'test successful'" }],
              max_tokens: 10,
            });

            if (response.choices[0]?.message?.content) {
              testResult = {
                success: true,
                message: "OpenAI connection successful",
              };
            } else {
              testResult = {
                success: false,
                message: "OpenAI returned an unexpected response",
              };
            }
          } catch (error) {
            testResult = {
              success: false,
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to connect to OpenAI",
            };
          }
        }
        break;
      }

      case "SERPAPI": {
        if (!process.env.SERP_API_KEY) {
          testResult = {
            success: false,
            message: "SERP API is not configured. Add SERP_API_KEY to your environment.",
          };
        } else {
          try {
            const url = new URL("https://serpapi.com/search");
            url.searchParams.set("engine", "google");
            url.searchParams.set("q", "test");
            url.searchParams.set("api_key", process.env.SERP_API_KEY);

            const response = await fetch(url.toString());

            if (response.ok) {
              testResult = {
                success: true,
                message: "SERP API connection successful",
              };
            } else {
              testResult = {
                success: false,
                message: `SERP API error: ${response.statusText}`,
              };
            }
          } catch (error) {
            testResult = {
              success: false,
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to connect to SERP API",
            };
          }
        }
        break;
      }

      case "GA4": {
        if (!process.env.GA4_API_KEY) {
          testResult = {
            success: false,
            message: "Google Analytics 4 is not configured. Add GA4_API_KEY to your environment.",
          };
        } else {
          testResult = {
            success: true,
            message: "GA4 configuration found",
          };
        }
        break;
      }

      case "GSC": {
        if (!process.env.GSC_API_KEY) {
          testResult = {
            success: false,
            message: "Google Search Console is not configured. Add GSC_API_KEY to your environment.",
          };
        } else {
          testResult = {
            success: true,
            message: "GSC configuration found",
          };
        }
        break;
      }
    }

    await db.integration.update({
      where: { id },
      data: {
        status: testResult.success ? "CONNECTED" : "ERROR",
        lastCheckedAt: new Date(),
      },
    });

    return NextResponse.json(testResult);
  } catch (error) {
    console.error("[INTEGRATION_TEST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
