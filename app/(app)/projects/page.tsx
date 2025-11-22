import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProjectsClient } from "./projects-client";

export default async function ProjectsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const projects = await db.project.findMany({
    where: { ownerId: userId },
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
