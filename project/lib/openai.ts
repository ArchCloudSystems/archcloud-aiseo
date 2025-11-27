import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY is not set. Content brief generation will not work.");
}

export const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

export type ContentBriefData = {
  title: string;
  metaDescription: string;
  h1: string;
  outline: Array<{
    level: number;
    heading: string;
    description: string;
  }>;
  talkingPoints: string[];
  targetWordCount: number;
  keywords: string[];
};

export async function generateContentBrief(params: {
  targetKeyword: string;
  targetUrl?: string;
  notes?: string;
  model?: string;
  apiKey?: string | null;
}): Promise<ContentBriefData> {
  const effectiveApiKey = params.apiKey || process.env.OPENAI_API_KEY;

  if (!effectiveApiKey) {
    throw new Error(
      "OpenAI API not configured. Please add your OpenAI API key in Integrations."
    );
  }

  const client = new OpenAI({ apiKey: effectiveApiKey });
  const {targetKeyword, targetUrl, notes, model = "gpt-4o-mini" } = params;

  const prompt = `You are an expert SEO content strategist. Create a detailed content brief for the following:

Target Keyword: "${targetKeyword}"
${targetUrl ? `Target URL/Topic: ${targetUrl}` : ""}
${notes ? `Additional Notes: ${notes}` : ""}

Generate a comprehensive content brief in JSON format with the following structure:
{
  "title": "Compelling, SEO-optimized title (60-70 characters)",
  "metaDescription": "Engaging meta description (150-160 characters)",
  "h1": "Main H1 heading",
  "outline": [
    {
      "level": 2,
      "heading": "H2 heading text",
      "description": "Brief description of what this section should cover"
    }
  ],
  "talkingPoints": ["Key point 1", "Key point 2", ...],
  "targetWordCount": 1500,
  "keywords": ["primary keyword", "secondary keyword 1", ...]
}

Focus on:
1. Search intent alignment
2. Comprehensive topic coverage
3. Clear structure with H2 and H3 headings
4. Actionable talking points
5. Related keywords and semantic variations

Return ONLY valid JSON, no additional text.`;

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content:
          "You are an expert SEO content strategist. Always respond with valid JSON only.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  try {
    const briefData = JSON.parse(content) as ContentBriefData;
    return briefData;
  } catch (error) {
    console.error("Failed to parse OpenAI response:", content);
    throw new Error("Failed to parse content brief from OpenAI response");
  }
}

export async function generateText(
  prompt: string,
  model: string = "gpt-4o-mini",
  apiKey?: string | null
): Promise<string> {
  const effectiveApiKey = apiKey || process.env.OPENAI_API_KEY;

  if (!effectiveApiKey) {
    throw new Error(
      "OpenAI API not configured. Please add your OpenAI API key in Integrations."
    );
  }

  const client = new OpenAI({ apiKey: effectiveApiKey });

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that generates professional, clear, and comprehensive text content.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 3000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  return content;
}

export async function enhanceSEORecommendations(params: {
  url: string;
  issues: Array<{ type: string; message: string }>;
  score: number;
  model?: string;
  apiKey?: string | null;
}): Promise<string[]> {
  const effectiveApiKey = params.apiKey || process.env.OPENAI_API_KEY;

  if (!effectiveApiKey) {
    return params.issues.map(
      (issue) => `Fix: ${issue.message}`
    );
  }

  const client = new OpenAI({ apiKey: effectiveApiKey });
  const { url, issues, score, model = "gpt-4o-mini" } = params;

  const prompt = `As an SEO expert, provide 3-5 specific, actionable recommendations to improve this page:

URL: ${url}
Current SEO Score: ${score}/100

Issues Found:
${issues.map((issue, i) => `${i + 1}. ${issue.type}: ${issue.message}`).join("\n")}

Provide recommendations as a JSON array of strings. Each recommendation should be:
- Specific and actionable
- Prioritized by impact
- Include "why" it matters

Return ONLY a JSON array of recommendation strings, no additional text.`;

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: "You are an SEO expert. Always respond with valid JSON only.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 800,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    return params.issues.map((issue) => `Address: ${issue.message}`);
  }

  try {
    const recommendations = JSON.parse(content) as string[];
    return recommendations;
  } catch (error) {
    console.error("Failed to parse OpenAI recommendations:", content);
    return params.issues.map((issue) => `Fix: ${issue.message}`);
  }
}
