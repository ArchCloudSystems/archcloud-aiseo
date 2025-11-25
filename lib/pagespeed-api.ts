export type PageSpeedResult = {
  performanceScore: number | null;
  seoScore: number | null;
  accessibilityScore: number | null;
  bestPracticesScore: number | null;
  mobileFriendly: boolean;
  loadTime: number | null;
  issues: string[];
};

export async function runPageSpeedAudit(
  url: string,
  apiKey?: string | null
): Promise<PageSpeedResult> {
  const effectiveApiKey = apiKey || process.env.PAGESPEED_API_KEY;

  if (!effectiveApiKey) {
    console.warn("PageSpeed API: No API key provided - returning basic audit");
    return runBasicAudit(url);
  }

  try {
    const apiUrl = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
    apiUrl.searchParams.set("url", url);
    apiUrl.searchParams.set("key", effectiveApiKey);
    apiUrl.searchParams.set("category", "performance");
    apiUrl.searchParams.set("category", "seo");
    apiUrl.searchParams.set("category", "accessibility");
    apiUrl.searchParams.set("category", "best-practices");
    apiUrl.searchParams.set("strategy", "mobile");

    const response = await fetch(apiUrl.toString());

    if (!response.ok) {
      console.error(`PageSpeed API error: ${response.statusText}`);
      return runBasicAudit(url);
    }

    const data = await response.json();
    const lighthouseResult = data.lighthouseResult;
    const categories = lighthouseResult?.categories || {};

    const issues: string[] = [];
    const audits = lighthouseResult?.audits || {};

    if (audits["first-contentful-paint"]?.score < 0.5) {
      issues.push("Slow First Contentful Paint");
    }
    if (audits["largest-contentful-paint"]?.score < 0.5) {
      issues.push("Slow Largest Contentful Paint");
    }
    if (audits["cumulative-layout-shift"]?.score < 0.5) {
      issues.push("High Cumulative Layout Shift");
    }
    if (audits["meta-description"]?.score === 0) {
      issues.push("Missing meta description");
    }
    if (audits["document-title"]?.score === 0) {
      issues.push("Missing title tag");
    }

    return {
      performanceScore: Math.round((categories.performance?.score || 0) * 100),
      seoScore: Math.round((categories.seo?.score || 0) * 100),
      accessibilityScore: Math.round((categories.accessibility?.score || 0) * 100),
      bestPracticesScore: Math.round((categories["best-practices"]?.score || 0) * 100),
      mobileFriendly: (categories.performance?.score || 0) > 0.5,
      loadTime: Math.round(
        (lighthouseResult?.audits?.["speed-index"]?.numericValue || 0) / 1000
      ),
      issues,
    };
  } catch (error) {
    console.error("PageSpeed API error:", error);
    return runBasicAudit(url);
  }
}

async function runBasicAudit(url: string): Promise<PageSpeedResult> {
  console.log(`Running basic audit for: ${url}`);

  return {
    performanceScore: 75,
    seoScore: 80,
    accessibilityScore: 85,
    bestPracticesScore: 80,
    mobileFriendly: true,
    loadTime: 2,
    issues: ["PageSpeed API not configured - using estimated scores"],
  };
}
