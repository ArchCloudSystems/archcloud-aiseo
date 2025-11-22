import { PlanTier } from "@prisma/client";
import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-10-29.clover" as any,
      typescript: true,
    })
  : null;

export const STRIPE_PLANS = {
  PRO: {
    priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
    name: "Pro",
    description: "For solo founders and small teams running multiple sites.",
  },
  AGENCY: {
    priceId: process.env.STRIPE_AGENCY_MONTHLY_PRICE_ID!,
    name: "Agency",
    description: "For agencies managing many clients with higher limits.",
  },
} as const;

export type PlanKey = keyof typeof STRIPE_PLANS;


export type PlanDefinition = {
  tier: PlanTier;
  name: string;
  description: string;
  monthlyPriceDisplay: number;
  stripePriceId?: string;
  features: string[];
  limits: {
    projects: number | string;
    keywordsPerProject: number | string;
    briefs: number | string;
    auditsPerWeek: number | string;
    integrations: boolean;
  };
};

export const planDefinitions: Record<PlanTier, PlanDefinition> = {
  FREE: {
    tier: "FREE",
    name: "Free",
    description: "Perfect for testing and small projects",
    monthlyPriceDisplay: 0,
    features: [
      "2 projects",
      "10 keywords per project",
      "3 content briefs per project",
      "3 SEO audits per week",
      "Basic reporting",
    ],
    limits: {
      projects: 2,
      keywordsPerProject: 10,
      briefs: "3 per project",
      auditsPerWeek: 3,
      integrations: false,
    },
  },
  PRO: {
    tier: "PRO",
    name: "Pro",
    description: "For serious SEO professionals",
    monthlyPriceDisplay: 39,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      "10 projects",
      "100 keywords per project",
      "20 content briefs per project",
      "10 SEO audits per week",
      "Advanced reporting",
      "API integrations",
      "Priority support",
    ],
    limits: {
      projects: 10,
      keywordsPerProject: 100,
      briefs: "20 per project",
      auditsPerWeek: 10,
      integrations: true,
    },
  },
  AGENCY: {
    tier: "AGENCY",
    name: "Agency",
    description: "For agencies managing multiple clients",
    monthlyPriceDisplay: 149,
    stripePriceId: process.env.STRIPE_AGENCY_PRICE_ID,
    features: [
      "Unlimited projects",
      "Unlimited keywords",
      "Unlimited content briefs",
      "Unlimited SEO audits",
      "Custom reporting",
      "Multiple integrations",
      "Dedicated support",
      "White-label options",
    ],
    limits: {
      projects: "Unlimited",
      keywordsPerProject: "Unlimited",
      briefs: "Unlimited",
      auditsPerWeek: "Unlimited",
      integrations: true,
    },
  },
};

export function getPlanFromPriceId(
  priceId: string | null | undefined
): PlanTier {
  if (!priceId) return "FREE";

  if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
    return "PRO";
  }

  if (priceId === process.env.STRIPE_AGENCY_PRICE_ID) {
    return "AGENCY";
  }

  return "FREE";
}

export function getPlanDefinition(tier: PlanTier): PlanDefinition {
  return planDefinitions[tier];
}
