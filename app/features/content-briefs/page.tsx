import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Sparkles, List, Target, BookOpen, Lightbulb } from "lucide-react";
import { siteConfig } from "@/lib/site";

export const metadata = {
  title: "Content Briefs - ArchCloud SEO",
  description: "AI-generated content briefs with outlines, talking points, and SEO recommendations. Create search-optimized content faster.",
};

export default function ContentBriefsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <FileText className="h-6 w-6" />
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
              <Sparkles className="mr-2 h-4 w-4" />
              AI Content Briefs
            </div>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              AI-Powered Content Briefs That Rank
            </h1>
            <p className="text-lg text-muted-foreground">
              Generate comprehensive content outlines, talking points, and SEO recommendations in seconds. Create content that ranks higher and converts better.
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
                Everything You Need to Create Great Content
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                AI-powered content planning backed by real SEO data
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <Target className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Target Keywords</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Get optimal primary and secondary keywords to target based on search volume and difficulty.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <List className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Content Outlines</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Receive structured outlines with H2 and H3 headings optimized for search intent and user experience.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Lightbulb className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Talking Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Get key points and angles to cover for comprehensive, authoritative content.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <BookOpen className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Competitor Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Understand what top-ranking pages cover and identify content gaps to exploit.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Sparkles className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>SEO Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Receive specific recommendations for title tags, meta descriptions, and content structure.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <FileText className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Internal Linking</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Get suggestions for relevant internal links to boost your site architecture and page authority.
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
                  <CardDescription>From keyword to publish-ready brief in minutes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Enter Your Target Keyword</h3>
                      <p className="text-sm text-muted-foreground">
                        Start with the keyword you want to rank for or let our AI suggest topics.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">AI Analyzes Top Results</h3>
                      <p className="text-sm text-muted-foreground">
                        Our AI analyzes the top-ranking content to understand what makes them successful.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Generate Your Brief</h3>
                      <p className="text-sm text-muted-foreground">
                        Receive a comprehensive content brief with outline, talking points, and SEO tips.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Create & Optimize</h3>
                      <p className="text-sm text-muted-foreground">
                        Use the brief to create content that ranks or hand it off to your writers.
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
            <div className="mx-auto max-w-3xl space-y-12">
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
                  Perfect for Content Teams
                </h2>
                <p className="text-lg text-muted-foreground">
                  Whether you're a solo blogger or managing a team of writers, our content briefs ensure consistency and quality.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>For Writers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>Clear structure to follow</li>
                      <li>Key points to cover</li>
                      <li>SEO guidelines included</li>
                      <li>Reduce research time by 70%</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>For Managers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>Scale content production</li>
                      <li>Maintain quality standards</li>
                      <li>Track brief performance</li>
                      <li>Align with SEO strategy</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t py-24">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center space-y-6">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Start Creating Better Content Today
              </h2>
              <p className="text-lg text-muted-foreground">
                Join content creators who use ArchCloud SEO to plan, create, and optimize content that ranks.
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
