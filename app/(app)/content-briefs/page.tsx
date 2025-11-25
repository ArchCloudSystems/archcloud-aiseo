"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Loader2, Plus } from "lucide-react";

type Project = {
  id: string;
  name: string;
};

type ContentBrief = {
  id: string;
  targetKeyword: string;
  searchIntent: string | null;
  outline: string | null;
  questions: string | null;
  wordCountTarget: number | null;
  notes: string | null;
  createdAt: string;
  project: { id: string; name: string } | null;
};

export default function ContentBriefsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [briefs, setBriefs] = useState<ContentBrief[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadProjects();
    loadBriefs();
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

  const loadBriefs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/content-briefs");
      if (res.ok) {
        const data = await res.json();
        setBriefs(data.briefs);
      }
    } catch (error) {
      console.error("Failed to load briefs:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateBrief = async () => {
    if (!targetKeyword || !selectedProject) return;

    try {
      setGenerating(true);
      const res = await fetch("/api/content-briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject,
          targetKeyword,
          notes,
        }),
      });

      if (res.ok) {
        setTargetKeyword("");
        setNotes("");
        loadBriefs();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to generate brief");
      }
    } catch (error) {
      console.error("Failed to generate brief:", error);
      alert("An error occurred");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Content Briefs</h1>
        <p className="text-muted-foreground">
          Generate AI-powered content briefs with outlines, keywords, and suggested topics.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate New Content Brief</CardTitle>
          <CardDescription>
            Enter a target keyword to generate a comprehensive content brief
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
            <Label htmlFor="keyword">Target Keyword</Label>
            <Input
              id="keyword"
              value={targetKeyword}
              onChange={(e) => setTargetKeyword(e.target.value)}
              placeholder="e.g., best seo tools 2024"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific requirements or competitor URLs..."
              rows={3}
            />
          </div>

          <Button
            onClick={generateBrief}
            disabled={!targetKeyword || !selectedProject || generating}
            className="w-full"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Brief...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Generate Content Brief
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Content Briefs</CardTitle>
          <CardDescription>Previously generated content briefs</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : briefs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No content briefs yet. Generate your first one above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {briefs.map((brief) => {
                const outline = brief.outline ? JSON.parse(brief.outline) : [];
                const questions = brief.questions ? JSON.parse(brief.questions) : [];

                return (
                  <Card key={brief.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{brief.targetKeyword}</CardTitle>
                      <CardDescription>
                        {brief.project?.name} • {new Date(brief.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {brief.searchIntent && (
                          <div>
                            <p className="text-sm font-medium">Search Intent: {brief.searchIntent}</p>
                          </div>
                        )}
                        {brief.wordCountTarget && (
                          <div>
                            <p className="text-sm font-medium">Target Word Count: {brief.wordCountTarget}</p>
                          </div>
                        )}
                        {outline.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Outline:</p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                              {outline.slice(0, 5).map((item: any, i: number) => (
                                <li key={i}>{item.heading || item}</li>
                              ))}
                              {outline.length > 5 && <li className="text-muted-foreground">+{outline.length - 5} more...</li>}
                            </ul>
                          </div>
                        )}
                        {questions.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Key Points:</p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                              {questions.slice(0, 3).map((q: string, i: number) => (
                                <li key={i}>{q}</li>
                              ))}
                              {questions.length > 3 && <li className="text-muted-foreground">+{questions.length - 3} more...</li>}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
