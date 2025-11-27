import { JSDOM } from "jsdom";

export type SEOIssue = {
  type: "error" | "warning" | "info";
  category: string;
  message: string;
};

export type SEOAnalysisResult = {
  url: string;
  statusCode: number;
  title: string | null;
  titleLength: number;
  metaDescription: string | null;
  metaDescriptionLength: number;
  h1Tags: string[];
  h1Count: number;
  wordCount: number;
  issues: SEOIssue[];
  score: number;
};

export async function analyzeSEO(url: string): Promise<SEOAnalysisResult> {
  const issues: SEOIssue[] = [];
  let score = 100;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ArchCloudSEO/1.0; +https://archcloudsystems.com)",
      },
      redirect: "follow",
    });

    const statusCode = response.status;
    const html = await response.text();

    if (statusCode !== 200) {
      issues.push({
        type: "error",
        category: "HTTP Status",
        message: `Page returned status code ${statusCode}. Expected 200.`,
      });
      score -= 30;
    }

    const dom = new JSDOM(html);
    const document = dom.window.document;

    const titleEl = document.querySelector("title");
    const title = titleEl?.textContent?.trim() || null;
    const titleLength = title?.length || 0;

    if (!title) {
      issues.push({
        type: "error",
        category: "Title Tag",
        message: "Missing <title> tag. This is critical for SEO.",
      });
      score -= 15;
    } else if (titleLength < 30) {
      issues.push({
        type: "warning",
        category: "Title Tag",
        message: `Title is too short (${titleLength} chars). Aim for 50-60 characters.`,
      });
      score -= 5;
    } else if (titleLength > 70) {
      issues.push({
        type: "warning",
        category: "Title Tag",
        message: `Title is too long (${titleLength} chars). May be truncated in search results.`,
      });
      score -= 5;
    }

    const metaDescEl = document.querySelector('meta[name="description"]');
    const metaDescription = metaDescEl?.getAttribute("content")?.trim() || null;
    const metaDescriptionLength = metaDescription?.length || 0;

    if (!metaDescription) {
      issues.push({
        type: "error",
        category: "Meta Description",
        message: "Missing meta description. This affects click-through rates.",
      });
      score -= 15;
    } else if (metaDescriptionLength < 120) {
      issues.push({
        type: "warning",
        category: "Meta Description",
        message: `Meta description is short (${metaDescriptionLength} chars). Aim for 150-160 characters.`,
      });
      score -= 3;
    } else if (metaDescriptionLength > 160) {
      issues.push({
        type: "info",
        category: "Meta Description",
        message: `Meta description is long (${metaDescriptionLength} chars). May be truncated.`,
      });
      score -= 2;
    }

    const h1Elements = document.querySelectorAll("h1");
    const h1Tags = Array.from(h1Elements).map(
      (el) => el.textContent?.trim() || ""
    );
    const h1Count = h1Tags.length;

    if (h1Count === 0) {
      issues.push({
        type: "error",
        category: "H1 Tag",
        message: "No H1 tag found. Every page should have exactly one H1.",
      });
      score -= 10;
    } else if (h1Count > 1) {
      issues.push({
        type: "warning",
        category: "H1 Tag",
        message: `Multiple H1 tags found (${h1Count}). Best practice is one H1 per page.`,
      });
      score -= 5;
    }

    const bodyText =
      document.body?.textContent?.replace(/\s+/g, " ").trim() || "";
    const words = bodyText.split(/\s+/).filter((word) => word.length > 0);
    const wordCount = words.length;

    if (wordCount < 300) {
      issues.push({
        type: "warning",
        category: "Content Length",
        message: `Low word count (${wordCount} words). Aim for at least 300 words for better rankings.`,
      });
      score -= 10;
    } else if (wordCount < 600) {
      issues.push({
        type: "info",
        category: "Content Length",
        message: `Moderate word count (${wordCount} words). Consider expanding for more comprehensive coverage.`,
      });
      score -= 3;
    }

    const images = document.querySelectorAll("img");
    const imagesWithoutAlt = Array.from(images).filter(
      (img) => !img.getAttribute("alt")
    );
    if (imagesWithoutAlt.length > 0) {
      issues.push({
        type: "warning",
        category: "Images",
        message: `${imagesWithoutAlt.length} image(s) missing alt attributes. Add descriptive alt text.`,
      });
      score -= Math.min(imagesWithoutAlt.length * 2, 10);
    }

    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      issues.push({
        type: "info",
        category: "Canonical Tag",
        message: "No canonical tag found. Consider adding one to prevent duplicate content issues.",
      });
      score -= 2;
    }

    score = Math.max(0, Math.min(100, score));

    return {
      url,
      statusCode,
      title,
      titleLength,
      metaDescription,
      metaDescriptionLength,
      h1Tags,
      h1Count,
      wordCount,
      issues,
      score,
    };
  } catch (error) {
    console.error("SEO analysis error:", error);
    throw new Error(
      `Failed to analyze URL: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
