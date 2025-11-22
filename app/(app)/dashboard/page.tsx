import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, FileText, FolderOpen, Search } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [projectCount, keywordCount, auditCount, briefCount] = await Promise.all([
    db.project.count({ where: { ownerId: userId } }),
    db.keyword.count({
      where: {
        project: {
          ownerId: userId,
        },
      },
    }),
    db.seoAudit.count({
      where: {
        userId: userId,
      },
    }),
    db.contentBrief.count({
      where: {
        userId: userId,
      },
    }),
  ]);

  const recentAudits = await db.seoAudit.findMany({
    where: {
      project: {
        ownerId: userId,
      },
    },
    include: {
      project: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your SEO performance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectCount}</div>
            <p className="text-xs text-muted-foreground">Active projects tracking SEO</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Keywords Tracked</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{keywordCount}</div>
            <p className="text-xs text-muted-foreground">Across all projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SEO Audits</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditCount}</div>
            <p className="text-xs text-muted-foreground">Total audits completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Briefs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{briefCount}</div>
            <p className="text-xs text-muted-foreground">AI-generated briefs</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Audits</CardTitle>
          <CardDescription>Your latest SEO audit results</CardDescription>
        </CardHeader>
        <CardContent>
          {recentAudits.length === 0 ? (
            <p className="text-sm text-muted-foreground">No audits yet. Create your first project to get started.</p>
          ) : (
            <div className="space-y-4">
              {recentAudits.map((audit: any) => (
                <div key={audit.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">{audit.url}</p>
                    <p className="text-sm text-muted-foreground">{audit.project?.name ?? "Unassigned project"}</p>
                  </div>
                  <div className="text-right">
                    {audit.score && (
                      <p className="text-lg font-bold">{audit.score}/100</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(audit.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Insights</CardTitle>
          <CardDescription>Personalized SEO recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">Focus on long-tail keywords to capture more qualified traffic</p>
            <p className="text-sm">Your average page load time could be improved for better SEO</p>
            <p className="text-sm">Consider adding more internal links to boost page authority</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
