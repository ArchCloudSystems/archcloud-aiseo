"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, TrendingUp, DollarSign, Target } from "lucide-react";

type Project = {
  id: string;
  name: string;
};

type Keyword = {
  id: string;
  term: string;
  volume: number | null;
  difficulty: number | null;
  cpc: number | null;
  serpFeatureSummary: string | null;
  project: { id: string; name: string };
};

export default function KeywordsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [researching, setResearching] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [keywordInput, setKeywordInput] = useState("");

  useEffect(() => {
    loadProjects();
    loadKeywords();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects);
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
    }
  };

  const loadKeywords = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/keywords");
      if (res.ok) {
        const data = await res.json();
        setKeywords(data.keywords);
      }
    } catch (error) {
      console.error("Failed to load keywords:", error);
    } finally {
      setLoading(false);
    }
  };

  const researchKeywords = async () => {
    if (!keywordInput.trim() || !selectedProject) return;

    const terms = keywordInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .slice(0, 20);

    if (terms.length === 0) return;

    try {
      setResearching(true);
      const res = await fetch("/api/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject,
          terms,
        }),
      });

      if (res.ok) {
        setKeywordInput("");
        loadKeywords();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to research keywords");
      }
    } catch (error) {
      console.error("Failed to research keywords:", error);
      alert("An error occurred");
    } finally {
      setResearching(false);
    }
  };

  const getDifficultyColor = (difficulty: number | null) => {
    if (difficulty === null) return "secondary";
    if (difficulty < 30) return "default";
    if (difficulty < 70) return "default";
    return "destructive";
  };

  const getDifficultyLabel = (difficulty: number | null) => {
    if (difficulty === null) return "Unknown";
    if (difficulty < 30) return "Easy";
    if (difficulty < 70) return "Medium";
    return "Hard";
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Keyword Research</h1>
        <p className="text-muted-foreground">
          Discover high-value keywords with volume, difficulty, and CPC data powered by SERP API
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Research Keywords</CardTitle>
          <CardDescription>
            Enter keywords separated by commas (up to 20 at a time)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">Keywords</Label>
            <Input
              id="keywords"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              placeholder="e.g., seo tools, keyword research, best seo software"
            />
            <p className="text-xs text-muted-foreground">
              Separate multiple keywords with commas
            </p>
          </div>

          <Button
            onClick={researchKeywords}
            disabled={!keywordInput.trim() || !selectedProject || researching}
            className="w-full"
          >
            {researching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Researching Keywords...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Research Keywords
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Keyword Results</CardTitle>
          <CardDescription>
            {keywords.length} keyword{keywords.length !== 1 ? "s" : ""} tracked
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : keywords.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No keywords yet. Research your first keywords above.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground border-b">
                <div className="col-span-4">Keyword</div>
                <div className="col-span-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Volume
                </div>
                <div className="col-span-2 flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Difficulty
                </div>
                <div className="col-span-2 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  CPC
                </div>
                <div className="col-span-2">Intent</div>
              </div>

              {keywords.map((keyword) => (
                <div
                  key={keyword.id}
                  className="grid grid-cols-12 gap-4 px-4 py-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="col-span-4">
                    <p className="font-medium">{keyword.term}</p>
                    <p className="text-xs text-muted-foreground">
                      {keyword.project.name}
                    </p>
                  </div>
                  <div className="col-span-2 flex items-center">
                    {keyword.volume !== null ? (
                      <span className="text-sm">
                        {keyword.volume.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">N/A</span>
                    )}
                  </div>
                  <div className="col-span-2 flex items-center">
                    {keyword.difficulty !== null ? (
                      <Badge variant={getDifficultyColor(keyword.difficulty)}>
                        {getDifficultyLabel(keyword.difficulty)}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">N/A</span>
                    )}
                  </div>
                  <div className="col-span-2 flex items-center">
                    {keyword.cpc !== null ? (
                      <span className="text-sm">${keyword.cpc.toFixed(2)}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">N/A</span>
                    )}
                  </div>
                  <div className="col-span-2 flex items-center">
                    {keyword.serpFeatureSummary ? (
                      <Badge variant="outline" className="capitalize">
                        {keyword.serpFeatureSummary}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">N/A</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
