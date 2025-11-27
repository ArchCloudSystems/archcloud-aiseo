import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUserWorkspace } from "@/lib/workspace";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShareButtons } from "@/components/share-buttons";
import { ArrowLeft, BarChart3, FileText, Search } from "lucide-react";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userId = session!.user.id;
  const workspace = await getUserWorkspace(userId);

  const { id } = await params;

  const project = await db.project.findFirst({
    where: {
      id: id,
      workspaceId: workspace.id,
    },
    include: {
      _count: {
        select: {
          keywords: true,
          audits: true,
          contentBriefs: true,
        },
      },
      keywords: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
      audits: {
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },
      contentBriefs: {
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/projects">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">{project.domain || "No domain set"}</p>
        </div>
        <ShareButtons title={`Check out my SEO project: ${project.name}`} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Keywords</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project._count.keywords}</div>
            <p className="text-xs text-muted-foreground">Tracked keywords</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audits</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project._count.audits}</div>
            <p className="text-xs text-muted-foreground">Completed audits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Briefs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project._count.contentBriefs}</div>
            <p className="text-xs text-muted-foreground">Generated briefs</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="audits">Audits</TabsTrigger>
          <TabsTrigger value="briefs">Content Briefs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
              <CardDescription>Summary of your SEO project performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Quick Stats</p>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Keywords tracked:</span>
                    <span className="font-medium">{project._count.keywords}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SEO audits completed:</span>
                    <span className="font-medium">{project._count.audits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Content briefs generated:</span>
                    <span className="font-medium">{project._count.contentBriefs}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Keywords</CardTitle>
              <CardDescription>Keywords being tracked for this project</CardDescription>
            </CardHeader>
            <CardContent>
              {project.keywords.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-4">No keywords added yet</p>
                  <Link href="/keywords">
                    <Button>Add Keywords</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {project.keywords.map((keyword: any) => (
                    <div key={keyword.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div>
                        <p className="font-medium">{keyword.term}</p>
                        {keyword.serpFeatureSummary && (
                          <p className="text-sm text-muted-foreground">{keyword.serpFeatureSummary}</p>
                        )}
                      </div>
                      <div className="text-right">
                        {keyword.volume !== null && (
                          <p className="text-sm font-medium">{keyword.volume} vol</p>
                        )}
                        {keyword.difficulty !== null && (
                          <p className="text-xs text-muted-foreground">Difficulty: {keyword.difficulty}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Audits</CardTitle>
              <CardDescription>SEO audit results for this project</CardDescription>
            </CardHeader>
            <CardContent>
              {project.audits.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-4">No audits completed yet</p>
                  <Link href="/audits">
                    <Button>Run Audit</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {project.audits.map((audit: any) => (
                    <div key={audit.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div>
                        <p className="font-medium">{audit.url}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(audit.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {audit.overallScore !== null && (
                          <p className="text-lg font-bold">{audit.overallScore}/100</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="briefs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Briefs</CardTitle>
              <CardDescription>AI-generated content briefs for this project</CardDescription>
            </CardHeader>
            <CardContent>
              {project.contentBriefs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-4">No content briefs created yet</p>
                  <Link href="/content-briefs">
                    <Button>Create Brief</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {project.contentBriefs.map((brief: any) => (
                    <div key={brief.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div>
                        <p className="font-medium">{brief.targetKeyword}</p>
                        {brief.searchIntent && (
                          <p className="text-sm text-muted-foreground">{brief.searchIntent}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {new Date(brief.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
