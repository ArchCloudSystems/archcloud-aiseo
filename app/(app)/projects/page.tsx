import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUserWorkspace } from "@/lib/workspace";
import { ProjectsClient } from "./projects-client";

export default async function ProjectsPage() {
  const session = await auth();
  const userId = session!.user.id;
  const workspace = await getUserWorkspace(userId);

  const projects = await db.project.findMany({
    where: { workspaceId: workspace.id },
    include: {
      _count: {
        select: {
          keywords: true,
          audits: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return <ProjectsClient initialProjects={projects} />;
}
