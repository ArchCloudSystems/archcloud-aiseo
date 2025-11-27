import { db } from "./db";
import { OrgMemberRole } from "@prisma/client";

export async function getOrCreateUserWorkspace(userId: string) {
  const existingWorkspace = await db.workspace.findFirst({
    where: {
      ownerId: userId,
    },
  });

  if (existingWorkspace) {
    return existingWorkspace;
  }

  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const slug = `${user.name?.toLowerCase().replace(/\s+/g, "-") || "user"}-${userId.slice(0, 8)}`;

  const workspace = await db.workspace.create({
    data: {
      name: `${user.name || "My"} Workspace`,
      slug,
      ownerId: userId,
      users: {
        create: {
          userId,
          role: OrgMemberRole.OWNER,
        },
      },
    },
  });

  return workspace;
}

export async function getUserWorkspace(userId: string) {
  const workspace = await db.workspace.findFirst({
    where: {
      OR: [
        { ownerId: userId },
        {
          users: {
            some: {
              userId: userId,
            },
          },
        },
      ],
    },
  });

  if (!workspace) {
    return getOrCreateUserWorkspace(userId);
  }

  return workspace;
}

export async function checkWorkspaceAccess(workspaceId: string, userId: string): Promise<boolean> {
  const workspace = await db.workspace.findFirst({
    where: {
      id: workspaceId,
      OR: [
        { ownerId: userId },
        {
          users: {
            some: {
              userId: userId,
            },
          },
        },
      ],
    },
  });

  return !!workspace;
}

export async function getWorkspaceByOwnerId(userId: string) {
  return db.workspace.findFirst({
    where: {
      ownerId: userId,
    },
  });
}

export async function getUserWorkspaceRole(
  workspaceId: string,
  userId: string
): Promise<OrgMemberRole | null> {
  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    select: { ownerId: true },
  });

  if (workspace?.ownerId === userId) {
    return OrgMemberRole.OWNER;
  }

  const workspaceUser = await db.workspaceUser.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  return workspaceUser?.role || null;
}

export async function isWorkspaceAdmin(
  workspaceId: string,
  userId: string
): Promise<boolean> {
  const role = await getUserWorkspaceRole(workspaceId, userId);
  return role === OrgMemberRole.OWNER || role === OrgMemberRole.ADMIN;
}

export async function isWorkspaceOwner(
  workspaceId: string,
  userId: string
): Promise<boolean> {
  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    select: { ownerId: true },
  });

  return workspace?.ownerId === userId;
}

export async function getAllUserWorkspaces(userId: string) {
  return db.workspace.findMany({
    where: {
      OR: [
        { ownerId: userId },
        {
          users: {
            some: {
              userId: userId,
            },
          },
        },
      ],
    },
    include: {
      users: {
        where: { userId },
        select: { role: true },
      },
    },
  });
}
