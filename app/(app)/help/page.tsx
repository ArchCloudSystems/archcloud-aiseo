import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, BookOpen, Shield, Link2, BarChart3, FileText } from "lucide-react";
import Link from "next/link";

export default function HelpPage() {
  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold">Help & Documentation</h1>
        <p className="text-muted-foreground">
          Everything you need to get the most out of ArchCloud SEO
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Learn the basics of using the platform</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Quick Start Guide</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Create your first project from the Projects page</li>
              <li>Add your website domain and target keywords</li>
              <li>Run an SEO audit to get baseline metrics</li>
              <li>Review recommendations and implement improvements</li>
              <li>Track your progress over time with keyword rankings and audits</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Link2 className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Integrations & BYOK</CardTitle>
              <CardDescription>Connect your tools and API keys</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Bring Your Own Keys (BYOK)</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Connect your own API keys for complete control and cost management. All credentials are encrypted at rest.
            </p>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-sm">Google Analytics 4</h4>
                <p className="text-sm text-muted-foreground">
                  Create a service account in Google Cloud Console, grant it access to your GA4 property, and upload the JSON credentials.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm">Google Search Console</h4>
                <p className="text-sm text-muted-foreground">
                  Use the same service account as GA4. Verify your site in Search Console and grant access to the service account email.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm">AI Services (OpenAI, Claude, Gemini)</h4>
                <p className="text-sm text-muted-foreground">
                  Get API keys from the respective provider dashboards. Each workspace can use different keys for isolation.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm">SERP API</h4>
                <p className="text-sm text-muted-foreground">
                  Sign up at serpapi.com, get your API key, and configure it in the Integrations page for keyword research.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Running SEO Audits</CardTitle>
              <CardDescription>Analyze and optimize your pages</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">How to Run an Audit</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Go to the Audits page, enter a URL from your website, select target keywords, and click Run Audit.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Understanding Audit Scores</h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li><strong>90-100:</strong> Excellent SEO optimization</li>
              <li><strong>70-89:</strong> Good with minor improvements needed</li>
              <li><strong>50-69:</strong> Fair with several issues to address</li>
              <li><strong>Below 50:</strong> Poor, requires significant optimization</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Key Audit Metrics</h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Title tags and meta descriptions</li>
              <li>Heading structure (H1-H6)</li>
              <li>Keyword density and placement</li>
              <li>Image alt text optimization</li>
              <li>Internal and external linking</li>
              <li>Page load speed and Core Web Vitals</li>
              <li>Mobile responsiveness</li>
              <li>Schema markup presence</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Content Briefs & Keywords</CardTitle>
              <CardDescription>Research and plan your content strategy</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Keyword Research</h3>
            <p className="text-sm text-muted-foreground">
              Enter a seed keyword to discover related terms with search volume, difficulty scores, and trend data.
              Save keywords to your project for tracking and content planning.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">AI Content Briefs</h3>
            <p className="text-sm text-muted-foreground">
              Generate detailed content outlines optimized for your target keywords. Each brief includes talking points,
              suggested word count, internal linking opportunities, and competitor insights.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Security & Privacy</CardTitle>
              <CardDescription>How we protect your data</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Data Encryption</h3>
            <p className="text-sm text-muted-foreground">
              All API keys and credentials are encrypted at rest using AES-256-GCM encryption with unique salts and initialization vectors.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Workspace Isolation</h3>
            <p className="text-sm text-muted-foreground">
              Each workspace operates independently with its own encryption keys, ensuring complete data isolation between clients.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Key Management</h3>
            <p className="text-sm text-muted-foreground">
              Your workspace keys take precedence over platform defaults. Keys are never logged or exposed in error messages.
              Platform fallback keys are only used when no workspace key is configured.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <HelpCircle className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Common Questions</CardTitle>
              <CardDescription>Frequently asked questions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1 text-sm">Can I use the platform without connecting my own API keys?</h3>
            <p className="text-sm text-muted-foreground">
              Yes. Platform-level fallback keys are available for testing, but we recommend using your own keys for production use.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1 text-sm">How often should I run audits?</h3>
            <p className="text-sm text-muted-foreground">
              Run audits weekly or after making significant changes to track improvements and catch new issues early.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1 text-sm">What&apos;s the difference between Projects and Clients?</h3>
            <p className="text-sm text-muted-foreground">
              Projects represent individual websites or campaigns. Clients are organizational containers that can hold multiple projects.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1 text-sm">How do I invite team members?</h3>
            <p className="text-sm text-muted-foreground">
              Go to Settings, navigate to Team Members, and send invitations with appropriate role permissions.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>Need More Help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Can&apos;t find what you&apos;re looking for? Our support team is here to help.
          </p>
          <Link href="/contact">
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4">
              Contact Support
            </button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
