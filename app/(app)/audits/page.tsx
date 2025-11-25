"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, BarChart3, CheckCircle, AlertTriangle, XCircle, Zap } from "lucide-react";

type Project = {
  id: string;
  name: string;
};

type Audit = {
  id: string;
  url: string;
  overallScore: number | null;
  performanceScore: number | null;
  seoScore: number | null;
  accessibilityScore: number | null;
  bestPracticesScore: number | null;
  mobileFriendly: boolean | null;
  loadTime: number | null;
  createdAt: string;
  project: { id: string; name: string };
};

export default function AuditsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(false);
  const [auditing, setAuditing] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [urlInput, setUrlInput] = useState("");

  useEffect(() => {
    loadProjects();
    loadAudits();
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

  const loadAudits = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/audits");
      if (res.ok) {
        const data = await res.json();
        setAudits(data.audits);
      }
    } catch (error) {
      console.error("Failed to load audits:", error);
    } finally {
      setLoading(false);
    }
  };

  const runAudit = async () => {
    if (!urlInput.trim() || !selectedProject) return;

    try {
      setAuditing(true);
      const res = await fetch("/api/audits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject,
          url: urlInput.trim(),
        }),
      });

      if (res.ok) {
        setUrlInput("");
        loadAudits();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to run audit");
      }
    } catch (error) {
      console.error("Failed to run audit:", error);
      alert("An error occurred");
    } finally {
      setAuditing(false);
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-muted-foreground";
    if (score >= 90) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number | null, label: string) => {
    if (score === null) return null;

    let variant: "default" | "secondary" | "destructive" = "secondary";
    let icon = <AlertTriangle className="h-3 w-3" />;

    if (score >= 90) {
      variant = "default";
      icon = <CheckCircle className="h-3 w-3" />;
    } else if (score < 50) {
      variant = "destructive";
      icon = <XCircle className="h-3 w-3" />;
    }

    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Badge variant={variant} className="gap-1">
          {icon}
          {score}
        </Badge>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">SEO Audits</h1>
        <p className="text-muted-foreground">
          Run comprehensive on-page SEO audits powered by PageSpeed Insights
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Run New Audit</CardTitle>
          <CardDescription>
            Enter a URL to analyze its SEO and performance
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
            <Label htmlFor="url">Page URL</Label>
            <Input
              id="url"
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/page"
            />
          </div>

          <Button
            onClick={runAudit}
            disabled={!urlInput.trim() || !selectedProject || auditing}
            className="w-full"
          >
            {auditing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Audit...
              </>
            ) : (
              <>
                <BarChart3 className="mr-2 h-4 w-4" />
                Run SEO Audit
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit History</CardTitle>
          <CardDescription>
            {audits.length} audit{audits.length !== 1 ? "s" : ""} completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : audits.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No audits yet. Run your first audit above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {audits.map((audit) => (
                <Card key={audit.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base break-all">
                          {audit.url}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {audit.project.name} • {new Date(audit.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      {audit.overallScore !== null && (
                        <div className="flex items-center gap-2 ml-4">
                          <span className={`text-3xl font-bold ${getScoreColor(audit.overallScore)}`}>
                            {audit.overallScore}
                          </span>
                          <span className="text-sm text-muted-foreground">/100</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {getScoreBadge(audit.performanceScore, "Performance")}
                      {getScoreBadge(audit.seoScore, "SEO")}
                      {getScoreBadge(audit.accessibilityScore, "Accessibility")}
                      {getScoreBadge(audit.bestPracticesScore, "Best Practices")}

                      {audit.loadTime !== null && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Load Time</span>
                          <Badge variant="outline" className="gap-1">
                            <Zap className="h-3 w-3" />
                            {audit.loadTime}s
                          </Badge>
                        </div>
                      )}
                    </div>

                    {audit.mobileFriendly !== null && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2">
                          {audit.mobileFriendly ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm">Mobile Friendly</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-red-600" />
                              <span className="text-sm">Not Mobile Friendly</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
