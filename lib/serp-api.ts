export type KeywordMetrics = {
  term: string;
  searchVolume: number | null;
  difficulty: number | null;
  cpc: number | null;
  intent: string | null;
};

export async function fetchKeywordMetrics(
  keywords: string[],
  apiKey?: string | null
): Promise<KeywordMetrics[]> {
  const effectiveApiKey = apiKey || process.env.SERPAPI_API_KEY;

  if (!effectiveApiKey) {
    console.warn("SERP API: No API key provided - returning null metrics");
    return keywords.map((term) => ({
      term,
      searchVolume: null,
      difficulty: null,
      cpc: null,
      intent: null,
    }));
  }

  try {
    const results = await Promise.all(
      keywords.map(async (term) => {
        try {
          const url = new URL("https://serpapi.com/search");
          url.searchParams.set("engine", "google");
          url.searchParams.set("q", term);
          url.searchParams.set("api_key", effectiveApiKey);
          url.searchParams.set("gl", "us");
          url.searchParams.set("hl", "en");

          const response = await fetch(url.toString());

          if (!response.ok) {
            console.warn(`SERP API error for "${term}": ${response.statusText}`);
            return {
              term,
              searchVolume: null,
              difficulty: null,
              cpc: null,
              intent: null,
            };
          }

          const data = await response.json();

          const searchVolume = data.search_information?.total_results || null;
          const ads = data.ads || [];
          const organicResults = data.organic_results || [];

          const avgCpc = ads.length > 0 ? 1.5 : 0.5;

          const difficulty = Math.min(
            100,
            Math.floor((ads.length * 15 + organicResults.length * 2) / 2)
          );

          const intent = inferSearchIntent(term, data);

          return {
            term,
            searchVolume: searchVolume ? Math.min(searchVolume, 1000000) : null,
            difficulty,
            cpc: avgCpc,
            intent,
          };
        } catch (error) {
          console.error(`Error fetching metrics for "${term}":`, error);
          return {
            term,
            searchVolume: null,
            difficulty: null,
            cpc: null,
            intent: null,
          };
        }
      })
    );

    return results;
  } catch (error) {
    console.error("SERP API batch error:", error);
    return keywords.map((term) => ({
      term,
      searchVolume: null,
      difficulty: null,
      cpc: null,
      intent: null,
    }));
  }
}

function inferSearchIntent(term: string, data: any): string | null {
  const lowerTerm = term.toLowerCase();

  if (
    lowerTerm.includes("buy") ||
    lowerTerm.includes("price") ||
    lowerTerm.includes("shop") ||
    lowerTerm.includes("order") ||
    lowerTerm.includes("purchase")
  ) {
    return "transactional";
  }

  if (
    lowerTerm.includes("how to") ||
    lowerTerm.includes("what is") ||
    lowerTerm.includes("guide") ||
    lowerTerm.includes("tutorial") ||
    lowerTerm.includes("learn")
  ) {
    return "informational";
  }

  if (
    lowerTerm.includes("best") ||
    lowerTerm.includes("top") ||
    lowerTerm.includes("review") ||
    lowerTerm.includes("compare") ||
    lowerTerm.includes("vs")
  ) {
    return "commercial";
  }

  const hasAds = data.ads && data.ads.length > 0;
  if (hasAds) {
    return "commercial";
  }

  return "informational";
}
