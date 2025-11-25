import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/rbac";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminPage() {
  try {
    await requireSuperAdmin();
  } catch {
    redirect("/dashboard");
  }

  const [workspaceCount, userCount, projectCount, recentWorkspaces] = await Promise.all([
    db.workspace.count(),
    db.user.count(),
    db.project.count(),
    db.workspace.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        owner: {
          select: { name: true, email: true },
        },
        _count: {
          select: { users: true, projects: true },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Administration</h1>
        <p className="text-muted-foreground">Manage the entire platform</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Workspaces</CardTitle>
            <CardDescription>Total organizations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{workspaceCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Total platform users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{userCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>Total SEO projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{projectCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Workspaces</CardTitle>
          <CardDescription>Latest organizations created</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentWorkspaces.map((workspace) => (
              <div key={workspace.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                <div>
                  <div className="font-semibold">{workspace.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Owner: {workspace.owner.name || workspace.owner.email}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Created: {new Date(workspace.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">
                    {workspace._count.users} {workspace._count.users === 1 ? "member" : "members"}
                  </Badge>
                  <Badge variant="outline">
                    {workspace._count.projects} {workspace._count.projects === 1 ? "project" : "projects"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
