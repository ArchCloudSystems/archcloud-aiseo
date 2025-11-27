import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUserWorkspace } from "@/lib/workspace";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, FileText, FolderOpen, Search, Plus, ArrowRight, CheckCircle2, TrendingUp } from "lucide-react";
import Link from "next/link";
import { AuditChart } from "@/components/audit-chart";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;
  const workspace = await getUserWorkspace(userId);

  const [projectCount, keywordCount, auditCount, briefCount, integrationCount] = await Promise.all([
    db.project.count({ where: { workspaceId: workspace.id } }),
    db.keyword.count({
      where: {
        project: {
          workspaceId: workspace.id,
        },
      },
    }),
    db.seoAudit.count({
      where: {
        project: {
          workspaceId: workspace.id,
        },
      },
    }),
    db.contentBrief.count({
      where: {
        project: {
          workspaceId: workspace.id,
        },
      },
    }),
    db.integrationConfig.count({
      where: {
        workspaceId: workspace.id,
        isEnabled: true,
      },
    }),
  ]);

  const recentProjects = await db.project.findMany({
    where: {
      workspaceId: workspace.id,
    },
    include: {
      _count: {
        select: {
          keywords: true,
          audits: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 5,
  });

  const recentAudits = await db.seoAudit.findMany({
    where: {
      project: {
        workspaceId: workspace.id,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 30,
    select: {
      id: true,
      url: true,
      overallScore: true,
      performanceScore: true,
      seoScore: true,
      accessibilityScore: true,
      bestPracticesScore: true,
      createdAt: true,
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const auditChartData = recentAudits
    .reverse()
    .map((audit, i) => ({
      name: `Audit ${i + 1}`,
      score: audit.overallScore || 0,
      date: new Date(audit.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));

  const hasStarted = projectCount > 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back to {workspace.name}!
          </p>
        </div>
        <Link href="/projects">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {!hasStarted && (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <CardTitle>Get Started with ArchCloud SEO</CardTitle>
            <CardDescription>Follow these steps to start optimizing your website</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${integrationCount > 0 ? 'bg-green-500' : 'bg-primary'} text-white`}>
                  {integrationCount > 0 ? <CheckCircle2 className="h-5 w-5" /> : "1"}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Connect Your Tools</h3>
                  <p className="text-sm text-muted-foreground">
                    Add your API keys for SERP API, OpenAI, and other services
                  </p>
                  <Link href="/integrations">
                    <Button variant="link" className="h-auto p-0 text-primary">
                      Go to Integrations <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${projectCount > 0 ? 'bg-green-500' : 'bg-primary'} text-white`}>
                  {projectCount > 0 ? <CheckCircle2 className="h-5 w-5" /> : "2"}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Create Your First Project</h3>
                  <p className="text-sm text-muted-foreground">
                    Set up a project to organize your SEO work
                  </p>
                  <Link href="/projects">
                    <Button variant="link" className="h-auto p-0 text-primary">
                      Create Project <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Start Analyzing</h3>
                  <p className="text-sm text-muted-foreground">
                    Research keywords, run audits, and generate content briefs
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectCount}</div>
            <p className="text-xs text-muted-foreground">Active SEO projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Keywords</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{keywordCount}</div>
            <p className="text-xs text-muted-foreground">Total tracked keywords</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audits</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditCount}</div>
            <p className="text-xs text-muted-foreground">SEO audits completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Briefs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{briefCount}</div>
            <p className="text-xs text-muted-foreground">Content briefs created</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {recentAudits.length >= 2 && (
          <div className="col-span-2">
            <DashboardClient audits={recentAudits.map(a => ({ ...a, createdAt: a.createdAt.toISOString() }))} />
          </div>
        )}

        {auditChartData.length > 0 && recentAudits.length < 2 && (
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Audit Score Trend</CardTitle>
              <CardDescription>SEO audit performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <AuditChart data={auditChartData} />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Your latest SEO projects</CardDescription>
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-4">No projects yet</p>
                <Link href="/projects">
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Project
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 hover:bg-muted/50 -mx-4 px-4 rounded transition-colors"
                  >
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {project.domain || "No domain set"}
                      </p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>{project._count.keywords} keywords</div>
                      <div>{project._count.audits} audits</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common SEO tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/keywords">
              <Button variant="outline" className="w-full justify-start">
                <Search className="mr-2 h-4 w-4" />
                Research Keywords
              </Button>
            </Link>
            <Link href="/audits">
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="mr-2 h-4 w-4" />
                Run SEO Audit
              </Button>
            </Link>
            <Link href="/content-briefs">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Generate Content Brief
              </Button>
            </Link>
            <Link href="/integrations">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Manage Integrations
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
