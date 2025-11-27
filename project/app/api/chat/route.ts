import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { openai } from "@/lib/openai";
import { checkRateLimit } from "@/lib/rate-limit";

const SYSTEM_PROMPT = `You are a helpful assistant for ArchCloud AISEO, an enterprise SEO management platform.

You can help users with:
1. Understanding how to use the platform's features (projects, clients, keywords, audits, content briefs, documents)
2. Explaining SEO concepts and best practices
3. Answering questions about the platform's privacy policy, terms of service, and data processing

Key platform features:
- Clients & Projects: Organize SEO work by client with multiple projects per client
- Keyword Research: Track search volume, difficulty, and trends via SERP API
- SEO Audits: Comprehensive on-page analysis with scores and recommendations
- Content Briefs: AI-generated content outlines optimized for target keywords
- Documents: Store notes, reports, and strategy docs per client/project
- Integrations: Connect Google Analytics, Search Console, and other tools

Privacy & Data:
- All data is encrypted and stored securely
- Users own their data and can export/delete at any time
- We use industry-standard security practices
- Third-party integrations only access what you authorize

Important: Provide general guidance only. Do not provide legal advice or SEO guarantees. Always recommend users consult with professionals for specific legal or strategic decisions.

Be concise, helpful, and professional in your responses.`;

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = checkRateLimit(session.user.id, "chat", {
      maxRequests: 20,
      windowMs: 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    if (!openai) {
      return NextResponse.json(
        { error: "Chat feature is not configured" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request: messages array is required" },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.slice(-10),
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const message = response.choices[0]?.message;

    if (!message) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error("[CHAT_POST]", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
