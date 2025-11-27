"use client";

import { AuditTrends } from "./audit-trends";

type Audit = {
  id: string;
  url: string;
  overallScore: number | null;
  performanceScore: number | null;
  seoScore: number | null;
  accessibilityScore: number | null;
  bestPracticesScore: number | null;
  createdAt: string;
  project: { id: string; name: string };
};

type DashboardClientProps = {
  audits: Audit[];
};

export function DashboardClient({ audits }: DashboardClientProps) {
  if (audits.length < 2) return null;

  return <AuditTrends audits={audits} />;
}
