import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, FileText, Search, Sparkles, Check, TrendingUp, Zap, Target, Twitter, Linkedin, Instagram, Facebook, Youtube, Github } from "lucide-react";
import { siteConfig } from "@/lib/site";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Sparkles className="h-6 w-6" />
            <span className="text-xl font-bold">{siteConfig.name}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {siteConfig.nav.public.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
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
        <section className="container flex flex-col items-center gap-8 py-24 md:py-32">
          <div className="flex max-w-4xl flex-col items-center gap-6 text-center">
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm">
              <Sparkles className="mr-2 h-4 w-4" />
              AI-Powered SEO Intelligence
            </div>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              {siteConfig.tagline}
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
              {siteConfig.description} Everything you need to dominate search rankings in one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto">Start Free Trial</Button>
              </Link>
                <Link href="/contact">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">Contact Sales</Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              No credit card required. Start optimizing in minutes.
            </p>
          </div>
        </section>

        <section id="features" className="border-t bg-muted/50 py-24">
          <div className="container">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Everything You Need for SEO Success
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Powerful tools to research, optimize, and track your SEO performance
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <Link href="/features/keyword-research">
                <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <Search className="h-10 w-10 mb-2 text-primary" />
                    <CardTitle>Keyword Research</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Discover high-value keywords with volume, difficulty, and relevancy scores
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/features/content-briefs">
                <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <FileText className="h-10 w-10 mb-2 text-primary" />
                    <CardTitle>Content Briefs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      AI-generated content outlines with talking points and internal link suggestions
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/features/seo-audits">
                <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <BarChart3 className="h-10 w-10 mb-2 text-primary" />
                    <CardTitle>On-Page Audits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Comprehensive SEO audits with AI-powered recommendations for improvement
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/features/integrations">
                <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <Sparkles className="h-10 w-10 mb-2 text-primary" />
                    <CardTitle>Integrations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Connect with Google Analytics, Search Console, and more
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t py-24">
          <div className="container">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                How It Works
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Get started with SEO optimization in three simple steps
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                  <Target className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">1. Create Your Project</h3>
                <p className="text-muted-foreground">
                  Add your website and define your SEO goals. Set up tracking for the keywords that matter most to your business.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">2. Research & Analyze</h3>
                <p className="text-muted-foreground">
                  Use our AI-powered keyword research tools to discover opportunities and run comprehensive SEO audits on your pages.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                  <TrendingUp className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">3. Optimize & Grow</h3>
                <p className="text-muted-foreground">
                  Implement AI-generated recommendations, create optimized content briefs, and watch your rankings improve.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/50 py-24">
          <div className="container">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Who It&apos;s For
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Built for teams and professionals who take SEO seriously
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Digital Agencies</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Manage multiple client websites efficiently with project-based organization and comprehensive reporting tools.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content Marketers</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Create data-driven content strategies with AI-powered briefs and keyword insights that drive organic traffic.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SaaS Companies</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Scale your organic growth with automated audits, competitive analysis, and optimization recommendations.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="pricing" className="border-t py-24">
          <div className="container">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Simple, Transparent Pricing
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Choose the plan that fits your needs
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Starter</CardTitle>
                  <CardDescription className="text-3xl font-bold mt-4">$49<span className="text-lg font-normal">/mo</span></CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span className="text-sm">Up to 3 projects</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span className="text-sm">500 keyword searches/mo</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span className="text-sm">50 AI content briefs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span className="text-sm">Basic reporting</span>
                    </li>
                  </ul>
                  <Link href="/auth/signup" className="w-full">
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-primary">
                <CardHeader>
                  <CardTitle>Pro</CardTitle>
                  <CardDescription className="text-3xl font-bold mt-4">$149<span className="text-lg font-normal">/mo</span></CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span className="text-sm">Up to 10 projects</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span className="text-sm">2,000 keyword searches/mo</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span className="text-sm">200 AI content briefs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span className="text-sm">Advanced reporting</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span className="text-sm">Priority support</span>
                    </li>
                  </ul>
                  <Link href="/auth/signup" className="w-full">
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Enterprise</CardTitle>
                  <CardDescription className="text-3xl font-bold mt-4">$399<span className="text-lg font-normal">/mo</span></CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span className="text-sm">Unlimited projects</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span className="text-sm">Unlimited searches</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span className="text-sm">Unlimited AI briefs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span className="text-sm">Custom reporting</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span className="text-sm">Dedicated support</span>
                    </li>
                  </ul>
                  <Link href="/contact" className="w-full">
                    <Button className="w-full">Contact Sales</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-muted/30">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
                <Sparkles className="h-5 w-5" />
                <span className="font-bold">{siteConfig.name}</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                {siteConfig.description}
              </p>
            </div>

            {siteConfig.footer.sections.map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2 text-sm">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} {siteConfig.companyName}. All rights reserved.</p>
            <div className="flex items-center gap-3">
              {siteConfig.social.twitter && (
                <Link
                  href={siteConfig.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-md border bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </Link>
              )}
              {siteConfig.social.linkedin && (
                <Link
                  href={siteConfig.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-md border bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </Link>
              )}
              {siteConfig.social.instagram && (
                <Link
                  href={siteConfig.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-md border bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </Link>
              )}
              {siteConfig.social.facebook && (
                <Link
                  href={siteConfig.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-md border bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </Link>
              )}
              {siteConfig.social.youtube && (
                <Link
                  href={siteConfig.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-md border bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="h-4 w-4" />
                </Link>
              )}
              {siteConfig.social.github && (
                <Link
                  href={siteConfig.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-md border bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
