"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

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

type AuditTrendsProps = {
  audits: Audit[];
};

export function AuditTrends({ audits }: AuditTrendsProps) {
  const [selectedUrl, setSelectedUrl] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d");

  const uniqueUrls = useMemo(() => {
    const urls = new Set(audits.map(a => a.url));
    return Array.from(urls);
  }, [audits]);

  const filteredAudits = useMemo(() => {
    let filtered = audits;

    if (selectedUrl !== "all") {
      filtered = filtered.filter(a => a.url === selectedUrl);
    }

    const now = new Date();
    const cutoffDate = new Date();
    switch (timeRange) {
      case "7d":
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        cutoffDate.setDate(now.getDate() - 90);
        break;
      default:
        cutoffDate.setFullYear(2000);
    }

    filtered = filtered.filter(a => new Date(a.createdAt) >= cutoffDate);

    return filtered.sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [audits, selectedUrl, timeRange]);

  const chartData = useMemo(() => {
    return filteredAudits.map(audit => ({
      date: new Date(audit.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      overall: audit.overallScore || 0,
      performance: audit.performanceScore || 0,
      seo: audit.seoScore || 0,
      accessibility: audit.accessibilityScore || 0,
      bestPractices: audit.bestPracticesScore || 0,
    }));
  }, [filteredAudits]);

  const calculateTrend = () => {
    if (filteredAudits.length < 2) return { direction: "stable", change: 0 };

    const firstScore = filteredAudits[0].overallScore || 0;
    const lastScore = filteredAudits[filteredAudits.length - 1].overallScore || 0;
    const change = lastScore - firstScore;

    return {
      direction: change > 2 ? "up" : change < -2 ? "down" : "stable",
      change: Math.abs(change),
    };
  };

  const trend = calculateTrend();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-md p-3 shadow-lg">
          <p className="text-sm font-medium mb-2">{payload[0].payload.date}</p>
          {payload.map((entry: any) => (
            <p key={entry.dataKey} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Audit Score Trends</CardTitle>
            <CardDescription>
              Track how your SEO scores improve over time
            </CardDescription>
          </div>
          {filteredAudits.length >= 2 && (
            <div className="flex items-center gap-2">
              {trend.direction === "up" && (
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">+{trend.change.toFixed(0)} points</span>
                </div>
              )}
              {trend.direction === "down" && (
                <div className="flex items-center gap-1 text-red-600">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-sm font-medium">-{trend.change.toFixed(0)} points</span>
                </div>
              )}
              {trend.direction === "stable" && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Minus className="h-4 w-4" />
                  <span className="text-sm font-medium">Stable</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <Select value={selectedUrl} onValueChange={setSelectedUrl}>
              <SelectTrigger>
                <SelectValue placeholder="Select URL" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All URLs</SelectItem>
                {uniqueUrls.map((url) => (
                  <SelectItem key={url} value={url}>
                    {url.length > 50 ? url.substring(0, 50) + "..." : url}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <p>No audit data available for the selected filters</p>
          </div>
        ) : chartData.length === 1 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <p>Run at least 2 audits to see trends</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'currentColor' }}
                className="text-muted-foreground"
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: 'currentColor' }}
                className="text-muted-foreground"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '12px' }}
                iconType="line"
              />
              <Line
                type="monotone"
                dataKey="overall"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Overall"
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="performance"
                stroke="#10b981"
                strokeWidth={2}
                name="Performance"
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="seo"
                stroke="#f59e0b"
                strokeWidth={2}
                name="SEO"
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="accessibility"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="Accessibility"
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="bestPractices"
                stroke="#ec4899"
                strokeWidth={2}
                name="Best Practices"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
