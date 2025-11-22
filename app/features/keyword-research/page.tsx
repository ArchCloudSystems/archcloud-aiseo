import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, TrendingUp, Target, BarChart, CheckCircle2, ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/site";

export const metadata = {
  title: "Keyword Research - ArchCloud SEO",
  description: "Discover high-value keywords with volume, difficulty, and relevancy scores. Powered by advanced SEO data providers.",
};

export default function KeywordResearchPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Search className="h-6 w-6" />
            <span className="text-xl font-bold">{siteConfig.name}</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="container py-24">
          <div className="mx-auto max-w-4xl text-center space-y-6">
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm">
              <Search className="mr-2 h-4 w-4" />
              Keyword Research
            </div>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Discover Keywords That Drive Traffic
            </h1>
            <p className="text-lg text-muted-foreground">
              Find high-value keyword opportunities with real search volume data, difficulty scores, and competitive analysis. Make data-driven decisions for your SEO strategy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg">Start Free Trial</Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline">Request Demo</Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/50 py-24">
          <div className="container">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Powerful Keyword Research Features
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Everything you need to find and analyze keywords
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <TrendingUp className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Search Volume Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Get accurate monthly search volume estimates from real search data. Understand the potential traffic for each keyword.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Target className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Difficulty Scores</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Know exactly how hard it will be to rank for each keyword with our proprietary difficulty algorithm.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <BarChart className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Search Intent Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Understand user intent behind each keyword - informational, transactional, navigational, or commercial.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CheckCircle2 className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Competitor Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    See what keywords your competitors rank for and identify gaps in your content strategy.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Search className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Related Keywords</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Discover related keywords and long-tail variations to expand your content opportunities.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <ArrowRight className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Trend Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Track keyword trends over time to identify seasonal patterns and emerging opportunities.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-t py-24">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">How It Works</CardTitle>
                  <CardDescription>Start finding profitable keywords in minutes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Enter Your Seed Keywords</h3>
                      <p className="text-sm text-muted-foreground">
                        Start with a few keywords related to your business or content topic.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Analyze Results</h3>
                      <p className="text-sm text-muted-foreground">
                        Review search volume, difficulty, and intent for hundreds of related keywords.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Save to Projects</h3>
                      <p className="text-sm text-muted-foreground">
                        Organize keywords into projects and track your rankings over time.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Create Content</h3>
                      <p className="text-sm text-muted-foreground">
                        Generate AI-powered content briefs for your target keywords and start ranking.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/50 py-24">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center space-y-6">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Ready to Find Your Next Opportunity?
              </h2>
              <p className="text-lg text-muted-foreground">
                Join thousands of marketers using ArchCloud SEO to discover profitable keywords and grow their organic traffic.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <Button size="lg">Start Free Trial</Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline">Contact Sales</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 bg-muted/30">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {siteConfig.companyName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
