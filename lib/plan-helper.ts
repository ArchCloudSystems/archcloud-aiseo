import { PlanTier } from "@prisma/client";
import { db } from "@/lib/db";
import { getUserWorkspace } from "@/lib/workspace";

export async function getUserPlan(userId: string): Promise<PlanTier> {
  const workspace = await getUserWorkspace(userId);

  const subscription = await db.subscription.findFirst({
    where: {
      workspaceId: workspace.id,
      status: "active",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return subscription?.plan || "STARTER";
}

export async function getUserWithPlan(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const workspace = await getUserWorkspace(userId);
  const subscription = await db.subscription.findFirst({
    where: {
      workspaceId: workspace.id,
      status: "active",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const plan = subscription?.plan || "STARTER";

  return {
    user,
    plan,
  };
}

export const PLAN_LIMITS = {
  STARTER: {
    projects: 3,
    keywords: 500,
    audits: 50,
    contentBriefs: 50,
  },
  PRO: {
    projects: 10,
    keywords: 2000,
    audits: 200,
    contentBriefs: 200,
  },
  AGENCY: {
    projects: Infinity,
    keywords: Infinity,
    audits: Infinity,
    contentBriefs: Infinity,
  },
};
