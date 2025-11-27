import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plug, BarChart, Search, DollarSign, Zap, Globe } from "lucide-react";
import { siteConfig } from "@/lib/site";

export const metadata = {
  title: "Integrations - ArchCloud SEO",
  description: "Connect with Google Analytics, Search Console, Stripe, and more. Centralize your SEO data and workflows.",
};

export default function IntegrationsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Plug className="h-6 w-6" />
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
              <Plug className="mr-2 h-4 w-4" />
              Integrations
            </div>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Connect Your Entire SEO Stack
            </h1>
            <p className="text-lg text-muted-foreground">
              Integrate with the tools you already use. Centralize your SEO data, automate workflows, and make better decisions with unified insights.
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
                Available Integrations
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Connect with your favorite tools and services
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <Search className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Google Search Console</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Import search performance data, track rankings, and identify indexing issues directly in your dashboard.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <BarChart className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Google Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Connect GA4 to track organic traffic, user behavior, and conversion metrics alongside SEO data.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <DollarSign className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Stripe</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Manage billing, subscriptions, and payments seamlessly within the platform.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Zap className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>OpenAI</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Power AI content briefs, recommendations, and insights with advanced language models.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Search className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>SERP API</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Access real-time search engine results, keyword data, and competitive intelligence.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Globe className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Custom APIs</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Connect your own tools and workflows using our flexible API and webhooks.
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
                  <CardTitle className="text-2xl">Why Integrate?</CardTitle>
                  <CardDescription>Unlock the full power of your SEO data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Centralized Dashboard</h3>
                      <p className="text-sm text-muted-foreground">
                        View all your SEO metrics in one place instead of switching between multiple tools.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Automated Workflows</h3>
                      <p className="text-sm text-muted-foreground">
                        Set up automatic reports, alerts, and data syncing to save time and reduce manual work.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Better Insights</h3>
                      <p className="text-sm text-muted-foreground">
                        Combine data from multiple sources to uncover insights you couldn't see before.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Faster Decisions</h3>
                      <p className="text-sm text-muted-foreground">
                        Make data-driven decisions faster with real-time data and unified reporting.
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
            <div className="mx-auto max-w-3xl space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
                  Easy Setup
                </h2>
                <p className="text-lg text-muted-foreground">
                  Connect your tools in minutes with our simple OAuth flow and API key management.
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Security First</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>All integrations use secure OAuth 2.0 authentication or encrypted API keys.</p>
                  <p>Your credentials are encrypted at rest and never exposed to other users.</p>
                  <p>You maintain full control and can disconnect integrations at any time.</p>
                  <p>We follow industry best practices and regularly audit our security.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-t py-24">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center space-y-6">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Ready to Connect Your Tools?
              </h2>
              <p className="text-lg text-muted-foreground">
                Start integrating your SEO stack and unlock powerful unified insights today.
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
