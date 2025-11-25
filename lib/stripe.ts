import { PlanTier } from "@prisma/client";
import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-10-29.clover" as any,
      typescript: true,
    })
  : null;

export const STRIPE_PLANS = {
  STARTER: {
    priceId: process.env.STRIPE_PRICE_STARTER!,
    name: "Starter",
    description: "Perfect for individuals and small projects.",
  },
  PRO: {
    priceId: process.env.STRIPE_PRICE_PRO!,
    name: "Pro",
    description: "For professionals and growing teams.",
  },
  AGENCY: {
    priceId: process.env.STRIPE_PRICE_AGENCY!,
    name: "Agency",
    description: "For agencies managing many clients.",
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
  STARTER: {
    tier: "STARTER",
    name: "Starter",
    description: "Perfect for individuals and small projects",
    monthlyPriceDisplay: 49,
    stripePriceId: process.env.STRIPE_PRICE_STARTER,
    features: [
      "3 projects",
      "500 keyword searches/month",
      "50 AI content briefs",
      "50 SEO audits/month",
      "Basic reporting",
    ],
    limits: {
      projects: 3,
      keywordsPerProject: 500,
      briefs: 50,
      auditsPerWeek: 50,
      integrations: false,
    },
  },
  PRO: {
    tier: "PRO",
    name: "Pro",
    description: "For professionals and growing teams",
    monthlyPriceDisplay: 149,
    stripePriceId: process.env.STRIPE_PRICE_PRO,
    features: [
      "10 projects",
      "2,000 keyword searches/month",
      "200 AI content briefs",
      "200 SEO audits/month",
      "Advanced reporting",
      "API integrations",
      "Priority support",
    ],
    limits: {
      projects: 10,
      keywordsPerProject: 2000,
      briefs: 200,
      auditsPerWeek: 200,
      integrations: true,
    },
  },
  AGENCY: {
    tier: "AGENCY",
    name: "Agency",
    description: "For agencies managing multiple clients",
    monthlyPriceDisplay: 399,
    stripePriceId: process.env.STRIPE_PRICE_AGENCY,
    features: [
      "Unlimited projects",
      "Unlimited keyword searches",
      "Unlimited AI content briefs",
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
  if (!priceId) return "STARTER";

  if (priceId === process.env.STRIPE_PRICE_STARTER) {
    return "STARTER";
  }

  if (priceId === process.env.STRIPE_PRICE_PRO) {
    return "PRO";
  }

  if (priceId === process.env.STRIPE_PRICE_AGENCY) {
    return "AGENCY";
  }

  return "STARTER";
}

export function getPlanDefinition(tier: PlanTier): PlanDefinition {
  return planDefinitions[tier];
}
