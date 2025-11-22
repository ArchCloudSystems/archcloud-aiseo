import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, AlertCircle, CheckCircle2, FileSearch, Globe, Zap } from "lucide-react";
import { siteConfig } from "@/lib/site";

export const metadata = {
  title: "SEO Audits - ArchCloud SEO",
  description: "Comprehensive on-page SEO audits with AI-powered recommendations. Identify and fix technical SEO issues instantly.",
};

export default function SEOAuditsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <BarChart3 className="h-6 w-6" />
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
              <BarChart3 className="mr-2 h-4 w-4" />
              SEO Audits
            </div>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Comprehensive On-Page SEO Audits
            </h1>
            <p className="text-lg text-muted-foreground">
              Identify technical SEO issues, optimize your content, and improve your search rankings with detailed audits powered by advanced analysis algorithms.
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
                What We Analyze
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Complete technical and content SEO analysis
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <FileSearch className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Meta Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Analyze title tags, meta descriptions, and other meta elements for optimal length and keyword usage.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CheckCircle2 className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Content Structure</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Review heading hierarchy, content length, keyword density, and readability scores.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Globe className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Technical SEO</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Check robots.txt, XML sitemaps, canonical tags, and mobile responsiveness.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <AlertCircle className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Broken Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Detect internal and external broken links that harm user experience and SEO.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Zap className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Page Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Analyze page load speed, Core Web Vitals, and performance optimization opportunities.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <BarChart3 className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Overall Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Get a comprehensive SEO score out of 100 with prioritized recommendations.
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
                  <CardTitle className="text-2xl">Audit Report Includes</CardTitle>
                  <CardDescription>Everything you need to optimize your pages</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Critical Issues</p>
                        <p className="text-sm text-muted-foreground">
                          High-priority problems that significantly impact your rankings
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Warnings & Recommendations</p>
                        <p className="text-sm text-muted-foreground">
                          Optimization opportunities to improve your SEO performance
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Competitive Analysis</p>
                        <p className="text-sm text-muted-foreground">
                          See how your page compares to top-ranking competitors
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">AI-Powered Insights</p>
                        <p className="text-sm text-muted-foreground">
                          Get intelligent recommendations tailored to your specific content
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Historical Tracking</p>
                        <p className="text-sm text-muted-foreground">
                          Monitor improvements over time with audit history and trends
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Actionable Steps</p>
                        <p className="text-sm text-muted-foreground">
                          Step-by-step instructions to fix each issue and improve your score
                        </p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/50 py-24">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center space-y-6">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Start Auditing Your Pages Today
              </h2>
              <p className="text-lg text-muted-foreground">
                Get detailed SEO audits in seconds and start improving your search rankings with data-driven insights.
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
