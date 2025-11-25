import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUserWorkspace } from "@/lib/workspace";
import { DocumentsClient } from "./documents-client";

export default async function DocumentsPage() {
  const session = await auth();
  const workspace = await getUserWorkspace(session!.user.id);

  const documents = await db.document.findMany({
    where: { workspaceId: workspace.id },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
      client: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const projects = await db.project.findMany({
    where: { workspaceId: workspace.id },
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Documents</h1>
        <p className="text-muted-foreground">
          Manage legal documents, reports, and project files
        </p>
      </div>

      <DocumentsClient
        initialDocuments={documents}
        projects={projects}
        workspaceName={workspace.name}
      />
    </div>
  );
}
