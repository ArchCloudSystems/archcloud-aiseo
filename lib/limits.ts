import { PlanTier } from "@prisma/client";

export type PlanLimits = {
  maxProjects: number | null;
  maxKeywordsPerProject: number | null;
  maxBriefsPerProject: number | null;
  maxAuditsPerWeek: number | null;
  integrationsAllowed: boolean;
  openAIModel: string;
};

export function getLimitsForPlan(plan: PlanTier): PlanLimits {
  switch (plan) {
    case "FREE":
      return {
        maxProjects: 2,
        maxKeywordsPerProject: 10,
        maxBriefsPerProject: 3,
        maxAuditsPerWeek: 3,
        integrationsAllowed: false,
        openAIModel: "gpt-4o-mini",
      };
    case "PRO":
      return {
        maxProjects: 10,
        maxKeywordsPerProject: 100,
        maxBriefsPerProject: 20,
        maxAuditsPerWeek: 10,
        integrationsAllowed: true,
        openAIModel: "gpt-4o-mini",
      };
    case "AGENCY":
      return {
        maxProjects: null,
        maxKeywordsPerProject: null,
        maxBriefsPerProject: null,
        maxAuditsPerWeek: null,
        integrationsAllowed: true,
        openAIModel: "gpt-4o",
      };
    default:
      return getLimitsForPlan("FREE");
  }
}

export type LimitCheckResult = {
  allowed: boolean;
  reason?: string;
  current?: number;
  limit?: number | null;
};

export function checkLimit(
  current: number,
  limit: number | null,
  resourceName: string
): LimitCheckResult {
  if (limit === null) {
    return { allowed: true };
  }

  if (current >= limit) {
    return {
      allowed: false,
      reason: `You've reached your ${resourceName} limit of ${limit}. Upgrade your plan to create more.`,
      current,
      limit,
    };
  }

  return { allowed: true, current, limit };
}
