import { auth } from "./auth";
import { db } from "./db";
import { getUserWorkspace } from "./workspace";
import { UserRole, PlatformRole, OrgMemberRole } from "@prisma/client";

export type WorkspaceRole = "owner" | "admin" | "member" | "viewer";

export type PermissionContext = {
  userId: string;
  userRole: UserRole;
  platformRole: PlatformRole;
  workspaceId: string;
  workspaceRole: WorkspaceRole;
  isOwner: boolean;
  isSuperAdmin: boolean;
};

export async function getPermissionContext(
  userId: string
): Promise<PermissionContext | null> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true, platformRole: true },
    });

    if (!user) return null;

    const workspace = await getUserWorkspace(userId);

    const isOwner = workspace.ownerId === userId;
    const isSuperAdmin = user.platformRole === PlatformRole.SUPERADMIN;
    let workspaceRole: WorkspaceRole = "member";

    if (isOwner) {
      workspaceRole = "owner";
    } else {
      const workspaceUser = await db.workspaceUser.findFirst({
        where: {
          userId,
          workspaceId: workspace.id,
        },
        select: { role: true },
      });

      if (workspaceUser) {
        workspaceRole = workspaceUser.role.toLowerCase() as WorkspaceRole;
      }
    }

    return {
      userId,
      userRole: user.role,
      platformRole: user.platformRole,
      workspaceId: workspace.id,
      workspaceRole,
      isOwner,
      isSuperAdmin,
    };
  } catch (error) {
    console.error("Error getting permission context:", error);
    return null;
  }
}

export async function requireAuth(): Promise<PermissionContext> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized - No session");
  }

  const context = await getPermissionContext(session.user.id);

  if (!context) {
    throw new Error("Unauthorized - Invalid user");
  }

  return context;
}

export async function requireWorkspaceOwner(): Promise<PermissionContext> {
  const context = await requireAuth();

  if (!context.isOwner) {
    throw new Error("Forbidden - Workspace owner access required");
  }

  return context;
}

export async function requireWorkspaceAdmin(): Promise<PermissionContext> {
  const context = await requireAuth();

  if (!context.isOwner && context.workspaceRole !== "admin") {
    throw new Error("Forbidden - Workspace admin access required");
  }

  return context;
}

export async function requireSystemAdmin(): Promise<PermissionContext> {
  const context = await requireAuth();

  if (context.userRole !== UserRole.ADMIN) {
    throw new Error("Forbidden - System admin access required");
  }

  return context;
}

export async function requireSuperAdmin(): Promise<PermissionContext> {
  const context = await requireAuth();

  if (!context.isSuperAdmin) {
    throw new Error("Forbidden - Platform superadmin access required");
  }

  return context;
}

export function canManageWorkspace(context: PermissionContext): boolean {
  return context.isOwner || context.workspaceRole === "admin";
}

export function canInviteMembers(context: PermissionContext): boolean {
  return context.isOwner || context.workspaceRole === "admin";
}

export function canRemoveMembers(context: PermissionContext): boolean {
  return context.isOwner;
}

export function canManageProjects(context: PermissionContext): boolean {
  return true;
}

export function canDeleteProjects(context: PermissionContext): boolean {
  return context.isOwner || context.workspaceRole === "admin";
}

export function canManageBilling(context: PermissionContext): boolean {
  return context.isOwner;
}

export function canManageIntegrations(context: PermissionContext): boolean {
  return context.isOwner || context.workspaceRole === "admin";
}

export function canViewAnalytics(context: PermissionContext): boolean {
  return context.isOwner || context.workspaceRole === "admin";
}
