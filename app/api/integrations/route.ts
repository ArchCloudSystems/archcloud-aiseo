import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

type IntegrationStatus = {
  id: string;
  name: string;
  description: string;
  status: "connected" | "missing" | "error";
  configKey: string;
};

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const integrations: IntegrationStatus[] = [
      {
        id: "stripe",
        name: "Stripe",
        description: "Payment processing and subscription management",
        status: process.env.STRIPE_SECRET_KEY ? "connected" : "missing",
        configKey: "STRIPE_SECRET_KEY",
      },
      {
        id: "openai",
        name: "OpenAI",
        description: "AI-powered content brief generation",
        status: process.env.OPENAI_API_KEY ? "connected" : "missing",
        configKey: "OPENAI_API_KEY",
      },
      {
        id: "serp_api",
        name: "SERP API",
        description: "Keyword research and search volume data",
        status: process.env.SERP_API_KEY ? "connected" : "missing",
        configKey: "SERP_API_KEY",
      },
      {
        id: "ga4",
        name: "Google Analytics 4",
        description: "Website analytics and tracking",
        status:
          process.env.GA4_PROPERTY_ID &&
          process.env.GA4_MEASUREMENT_ID &&
          process.env.GA4_API_SECRET
            ? "connected"
            : "missing",
        configKey: "GA4_PROPERTY_ID, GA4_MEASUREMENT_ID, GA4_API_SECRET",
      },
    ];

    return NextResponse.json({ integrations });
  } catch (error) {
    console.error("[INTEGRATIONS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

