import { PlanTier } from "@prisma/client";
import { db } from "@/lib/db";

export async function getUserPlan(userId: string): Promise<PlanTier> {
  const subscription = await db.subscription.findFirst({
    where: {
      userId,
      status: "active",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return subscription?.plan || "FREE";
}

export async function getUserWithPlan(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      subscriptions: {
        where: {
          status: "active",
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const plan = user.subscriptions[0]?.plan || "FREE";

  return {
    user,
    plan,
  };
}
