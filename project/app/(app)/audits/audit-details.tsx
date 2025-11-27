"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Lightbulb,
  AlertCircle
} from "lucide-react";

type Issue = {
  type: "error" | "warning" | "info";
  category: string;
  message: string;
};

type Recommendation = {
  priority: "high" | "medium" | "low";
  category: string;
  action: string;
  impact: string;
};

type AuditDetailsProps = {
  audit: {
    id: string;
    url: string;
    overallScore: number | null;
    performanceScore: number | null;
    seoScore: number | null;
    accessibilityScore: number | null;
    bestPracticesScore: number | null;
    mobileFriendly: boolean | null;
    loadTime: number | null;
    title: string | null;
    metaDescription: string | null;
    h1Count: number | null;
    wordCount: number | null;
    issuesJson: string | null;
    createdAt: string;
  };
};

export function AuditDetails({ audit }: AuditDetailsProps) {
  const [expanded, setExpanded] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(true);

  let parsedData: { issues?: Issue[]; recommendations?: string | Recommendation[] } = {};
  try {
    if (audit.issuesJson) {
      parsedData = JSON.parse(audit.issuesJson);
    }
  } catch (error) {
    console.error("Failed to parse issues JSON:", error);
  }

  const issues = parsedData.issues || [];
  const recommendations = typeof parsedData.recommendations === 'string'
    ? parsedData.recommendations
    : null;

  const errorCount = issues.filter(i => i.type === "error").length;
  const warningCount = issues.filter(i => i.type === "warning").length;
  const infoCount = issues.filter(i => i.type === "info").length;

  const getIssueIcon = (type: string) => {
    switch (type) {
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "info":
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getIssueColor = (type: string) => {
    switch (type) {
      case "error":
        return "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800";
      case "info":
        return "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800";
      default:
        return "";
    }
  };

  const handleExport = async () => {
    const reportData = {
      url: audit.url,
      date: new Date(audit.createdAt).toLocaleDateString(),
      overallScore: audit.overallScore,
      performanceScore: audit.performanceScore,
      seoScore: audit.seoScore,
      accessibilityScore: audit.accessibilityScore,
      bestPracticesScore: audit.bestPracticesScore,
      mobileFriendly: audit.mobileFriendly,
      loadTime: audit.loadTime,
      title: audit.title,
      metaDescription: audit.metaDescription,
      h1Count: audit.h1Count,
      wordCount: audit.wordCount,
      issues,
      recommendations,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-report-${audit.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="gap-2"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {expanded ? "Hide Details" : "View Details"}
          </Button>
          {issues.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              {errorCount > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  {errorCount} errors
                </Badge>
              )}
              {warningCount > 0 && (
                <Badge variant="outline" className="gap-1 border-yellow-600 text-yellow-700 dark:text-yellow-500">
                  <AlertTriangle className="h-3 w-3" />
                  {warningCount} warnings
                </Badge>
              )}
              {infoCount > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {infoCount} suggestions
                </Badge>
              )}
            </div>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {expanded && (
        <div className="space-y-4">
          {audit.title && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Page Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <span className="text-muted-foreground">Title:</span>
                    <p className="font-medium mt-1">{audit.title}</p>
                    {audit.title.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {audit.title.length} characters
                        {audit.title.length < 30 && " (too short)"}
                        {audit.title.length > 60 && " (too long)"}
                      </p>
                    )}
                  </div>
                  {audit.metaDescription && (
                    <div>
                      <span className="text-muted-foreground">Meta Description:</span>
                      <p className="font-medium mt-1">{audit.metaDescription}</p>
                      <p className="text-xs text-muted-foreground">
                        {audit.metaDescription.length} characters
                        {audit.metaDescription.length < 120 && " (too short)"}
                        {audit.metaDescription.length > 160 && " (too long)"}
                      </p>
                    </div>
                  )}
                  {audit.h1Count !== null && (
                    <div>
                      <span className="text-muted-foreground">H1 Count:</span>
                      <p className="font-medium">{audit.h1Count}</p>
                      {audit.h1Count !== 1 && (
                        <p className="text-xs text-yellow-600">Best practice: Use exactly 1 H1</p>
                      )}
                    </div>
                  )}
                  {audit.wordCount !== null && (
                    <div>
                      <span className="text-muted-foreground">Word Count:</span>
                      <p className="font-medium">{audit.wordCount.toLocaleString()}</p>
                      {audit.wordCount < 300 && (
                        <p className="text-xs text-yellow-600">Consider adding more content</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {recommendations && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    <CardTitle className="text-base">AI-Powered Recommendations</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRecommendations(!showRecommendations)}
                  >
                    {showRecommendations ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
                <CardDescription>
                  Prioritized actions to improve your SEO score
                </CardDescription>
              </CardHeader>
              {showRecommendations && (
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-sm">{recommendations}</div>
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {issues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Issues Found</CardTitle>
                <CardDescription>
                  Detailed breakdown of all SEO issues detected
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {issues.map((issue, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${getIssueColor(issue.type)}`}
                  >
                    <div className="mt-0.5">
                      {getIssueIcon(issue.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{issue.category}</span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {issue.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{issue.message}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
