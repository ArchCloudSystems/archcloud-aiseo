import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
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

    switch (id) {
      case "stripe": {
        if (!stripe) {
          return NextResponse.json(
            {
              success: false,
              message: "Stripe is not configured. Add STRIPE_SECRET_KEY to your environment.",
            },
            { status: 200 }
          );
        }

        try {
          await stripe.balance.retrieve();
          return NextResponse.json({
            success: true,
            message: "Stripe connection successful",
          });
        } catch (error) {
          return NextResponse.json({
            success: false,
            message:
              error instanceof Error
                ? error.message
                : "Failed to connect to Stripe",
          });
        }
      }

      case "openai": {
        if (!openai) {
          return NextResponse.json(
            {
              success: false,
              message: "OpenAI is not configured. Add OPENAI_API_KEY to your environment.",
            },
            { status: 200 }
          );
        }

        try {
          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: "Say 'test successful'" }],
            max_tokens: 10,
          });

          if (response.choices[0]?.message?.content) {
            return NextResponse.json({
              success: true,
              message: "OpenAI connection successful",
            });
          }

          return NextResponse.json({
            success: false,
            message: "OpenAI returned an unexpected response",
          });
        } catch (error) {
          return NextResponse.json({
            success: false,
            message:
              error instanceof Error
                ? error.message
                : "Failed to connect to OpenAI",
          });
        }
      }

      case "serp_api": {
        if (!process.env.SERP_API_KEY) {
          return NextResponse.json(
            {
              success: false,
              message: "SERP API is not configured. Add SERP_API_KEY to your environment.",
            },
            { status: 200 }
          );
        }

        try {
          const url = new URL("https://serpapi.com/search");
          url.searchParams.set("engine", "google");
          url.searchParams.set("q", "test");
          url.searchParams.set("api_key", process.env.SERP_API_KEY);

          const response = await fetch(url.toString());

          if (response.ok) {
            return NextResponse.json({
              success: true,
              message: "SERP API connection successful",
            });
          }

          return NextResponse.json({
            success: false,
            message: `SERP API error: ${response.statusText}`,
          });
        } catch (error) {
          return NextResponse.json({
            success: false,
            message:
              error instanceof Error
                ? error.message
                : "Failed to connect to SERP API",
          });
        }
      }

      case "ga4": {
        if (
          !process.env.GA4_PROPERTY_ID ||
          !process.env.GA4_MEASUREMENT_ID ||
          !process.env.GA4_API_SECRET
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Google Analytics 4 is not configured. Add GA4_PROPERTY_ID, GA4_MEASUREMENT_ID, and GA4_API_SECRET to your environment.",
            },
            { status: 200 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "GA4 configuration found (test event not sent)",
        });
      }

      default:
        return NextResponse.json(
          { error: "Unknown integration" },
          { status: 404 }
        );
    }
  } catch (error) {
    console.error("[INTEGRATION_TEST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
