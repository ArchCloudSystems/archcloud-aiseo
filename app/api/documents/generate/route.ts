export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateText } from "@/lib/openai";
import { z } from "zod";

const generateSchema = z.object({
  template: z.string(),
  workspaceName: z.string(),
  domain: z.string().optional(),
});

const TEMPLATE_PROMPTS: Record<string, { title: string; prompt: string }> = {
  "privacy-policy": {
    title: "Privacy Policy",
    prompt: `Generate a professional and GDPR-compliant Privacy Policy for a company called "{{workspaceName}}".

The policy should include:
- Introduction explaining data collection practices
- Types of data collected (personal info, usage data, cookies)
- How data is used (service provision, analytics, communications)
- Data retention and security measures
- User rights (access, deletion, portability)
- Third-party services and processors
- International data transfers
- Contact information for privacy inquiries
- Updates to the policy

Make it comprehensive but readable, using clear sections. Use generic language that doesn't make specific legal claims. Include placeholder text where company-specific details would go.`,
  },
  dpa: {
    title: "Data Processing Agreement",
    prompt: `Generate a Data Processing Agreement (DPA) for "{{workspaceName}}" that complies with GDPR requirements.

Include sections for:
- Definitions of key terms (Controller, Processor, Data Subject, Personal Data)
- Subject matter and duration of processing
- Nature and purpose of processing
- Types of personal data processed
- Categories of data subjects
- Processor obligations (security, confidentiality, subprocessing)
- Controller obligations
- Security measures and breach notification
- Data subject rights support
- Audit and compliance provisions
- Liability and indemnification
- Termination and data return/deletion

Use standard DPA language appropriate for SaaS businesses. Keep it professional and legally sound without making specific legal claims.`,
  },
  terms: {
    title: "Terms of Service",
    prompt: `Generate Terms of Service for "{{workspaceName}}", a SaaS SEO platform.

Include sections for:
- Acceptance of terms
- Service description
- Account registration and security
- Acceptable use policy
- Intellectual property rights
- Payment terms and billing
- Cancellation and refunds
- Service availability and modifications
- Limitation of liability
- Indemnification
- Dispute resolution
- Governing law
- Changes to terms
- Contact information

Make it professional and comprehensive while using generic language that doesn't make specific legal claims. Include standard SaaS terms clauses.`,
  },
  "cookie-policy": {
    title: "Cookie Policy",
    prompt: `Generate a Cookie Policy for "{{workspaceName}}" that explains cookie usage in compliance with GDPR and ePrivacy Directive.

Include:
- What cookies are and how they work
- Types of cookies used:
  - Essential cookies (authentication, security)
  - Functional cookies (preferences, settings)
  - Analytics cookies (Google Analytics, usage tracking)
  - Marketing cookies (if applicable)
- How users can manage cookie preferences
- Third-party cookies and services
- Cookie duration and expiration
- Updates to the cookie policy
- Contact information

Make it user-friendly and informative while being legally compliant. Use clear, non-technical language where possible.`,
  },
  "seo-audit-report": {
    title: "SEO Audit Report Template",
    prompt: `Generate a professional SEO Audit Report template for "{{workspaceName}}".

Structure the report with these sections:
- Executive Summary (overview of findings)
- Technical SEO Analysis
  - Site speed and performance
  - Mobile-friendliness
  - Crawlability and indexation
  - Site structure and navigation
- On-Page SEO
  - Title tags and meta descriptions
  - Header tags (H1-H6)
  - Content quality and keyword usage
  - Internal linking
- Off-Page SEO
  - Backlink profile
  - Domain authority
  - Social signals
- Content Analysis
  - Content gaps
  - Keyword opportunities
  - Competitive analysis
- Recommendations
  - High-priority actions
  - Medium-priority improvements
  - Long-term strategies
- Conclusion and next steps

Use professional language with placeholder sections for actual data and findings. Include guidance on what should be filled in for each section.`,
  },
};

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { template, workspaceName, domain } = generateSchema.parse(body);

    const templateConfig = TEMPLATE_PROMPTS[template];
    if (!templateConfig) {
      return NextResponse.json(
        { error: "Invalid template type" },
        { status: 400 }
      );
    }

    const prompt = templateConfig.prompt
      .replace(/{{workspaceName}}/g, workspaceName)
      .replace(/{{domain}}/g, domain || "[Your Website URL]");

    const content = await generateText(prompt);

    return NextResponse.json({
      title: templateConfig.title,
      content,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", issues: error.issues },
        { status: 400 }
      );
    }

    console.error("[DOCUMENTS_GENERATE]", error);

    if (error instanceof Error && error.message.includes("OPENAI_API_KEY")) {
      return NextResponse.json(
        {
          error:
            "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate document template" },
      { status: 500 }
    );
  }
}
