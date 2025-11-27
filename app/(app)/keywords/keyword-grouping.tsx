"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, DollarSign, Target, Download, Filter, FolderOpen } from "lucide-react";

type Keyword = {
  id: string;
  term: string;
  volume: number | null;
  difficulty: number | null;
  cpc: number | null;
  serpFeatureSummary: string | null;
  project: { id: string; name: string };
};

type KeywordGroupingProps = {
  keywords: Keyword[];
};

type GroupedKeywords = {
  [group: string]: Keyword[];
};

export function KeywordGrouping({ keywords }: KeywordGroupingProps) {
  const [groupBy, setGroupBy] = useState<"intent" | "difficulty" | "volume">("intent");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const groupedKeywords = useMemo(() => {
    const groups: GroupedKeywords = {};

    keywords.forEach((keyword) => {
      let groupKey = "Ungrouped";

      if (groupBy === "intent") {
        groupKey = inferIntent(keyword.term);
      } else if (groupBy === "difficulty") {
        if (keyword.difficulty === null) groupKey = "Unknown";
        else if (keyword.difficulty < 30) groupKey = "Easy";
        else if (keyword.difficulty < 70) groupKey = "Medium";
        else groupKey = "Hard";
      } else if (groupBy === "volume") {
        if (keyword.volume === null) groupKey = "Unknown";
        else if (keyword.volume < 100) groupKey = "Low (< 100)";
        else if (keyword.volume < 1000) groupKey = "Medium (100-1k)";
        else if (keyword.volume < 10000) groupKey = "High (1k-10k)";
        else groupKey = "Very High (10k+)";
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(keyword);
    });

    return groups;
  }, [keywords, groupBy]);

  const inferIntent = (term: string): string => {
    const lower = term.toLowerCase();

    if (lower.match(/\b(how|what|why|when|where|guide|tutorial|learn)\b/)) {
      return "Informational";
    }
    if (lower.match(/\b(buy|shop|purchase|order|price|cost|cheap|best|review|compare)\b/)) {
      return "Commercial";
    }
    if (lower.match(/\b(near me|location|directions|hours|contact|address)\b/)) {
      return "Local";
    }
    if (lower.match(/\b(login|signup|download|register|subscribe)\b/)) {
      return "Navigational";
    }

    return "Informational";
  };

  const exportToCSV = (group?: string) => {
    const dataToExport = group ? groupedKeywords[group] : keywords;
    const headers = ["Keyword", "Volume", "Difficulty", "CPC", "Intent", "Project"];
    const rows = dataToExport.map(kw => [
      kw.term,
      kw.volume?.toString() || "N/A",
      kw.difficulty?.toString() || "N/A",
      kw.cpc?.toFixed(2) || "N/A",
      kw.serpFeatureSummary || inferIntent(kw.term),
      kw.project.name
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = group ? `keywords-${group.toLowerCase().replace(/\s+/g, "-")}.csv` : "keywords-all.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getGroupColor = (group: string) => {
    switch (group) {
      case "Informational":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200";
      case "Commercial":
        return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200";
      case "Local":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200";
      case "Navigational":
        return "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200";
      case "Easy":
        return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200";
      case "Hard":
        return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const groupEntries = Object.entries(groupedKeywords);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Keyword Groups</CardTitle>
            <CardDescription>
              {keywords.length} keywords in {groupEntries.length} groups
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={groupBy} onValueChange={(v) => setGroupBy(v as any)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="intent">Group by Intent</SelectItem>
                <SelectItem value="difficulty">Group by Difficulty</SelectItem>
                <SelectItem value="volume">Group by Volume</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => exportToCSV()} className="gap-2">
              <Download className="h-4 w-4" />
              Export All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {groupEntries.map(([group, groupKeywords]) => (
          <Card key={group} className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FolderOpen className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{group}</CardTitle>
                      <Badge className={getGroupColor(group)}>
                        {groupKeywords.length} keywords
                      </Badge>
                    </div>
                    <CardDescription className="text-xs mt-1">
                      Avg Volume: {Math.round(groupKeywords.reduce((sum, kw) => sum + (kw.volume || 0), 0) / groupKeywords.length).toLocaleString()} •
                      Avg Difficulty: {Math.round(groupKeywords.reduce((sum, kw) => sum + (kw.difficulty || 0), 0) / groupKeywords.length)}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedGroup(selectedGroup === group ? null : group)}
                  >
                    {selectedGroup === group ? "Hide" : "Show"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToCSV(group)}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {selectedGroup === group && (
              <CardContent>
                <div className="space-y-2">
                  {groupKeywords.map((keyword) => (
                    <div
                      key={keyword.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{keyword.term}</p>
                        <p className="text-xs text-muted-foreground">{keyword.project.name}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        {keyword.volume !== null && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-muted-foreground" />
                            <span>{keyword.volume.toLocaleString()}</span>
                          </div>
                        )}
                        {keyword.difficulty !== null && (
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3 text-muted-foreground" />
                            <span>{keyword.difficulty}</span>
                          </div>
                        )}
                        {keyword.cpc !== null && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <span>${keyword.cpc.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
