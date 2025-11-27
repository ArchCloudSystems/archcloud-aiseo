"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Project = {
  id: string;
  name: string;
};

type BatchImportProps = {
  projects: Project[];
  onComplete: () => void;
};

export function BatchImport({ projects, onComplete }: BatchImportProps) {
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [keywordInput, setKeywordInput] = useState("");
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<{ success: number; failed: number } | null>(null);

  const handleImport = async () => {
    if (!keywordInput.trim() || !selectedProject) return;

    const terms = keywordInput
      .split(/[\n,]/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .slice(0, 100);

    if (terms.length === 0) return;

    setImporting(true);
    setResults(null);

    try {
      const res = await fetch("/api/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject,
          terms,
        }),
      });

      if (res.ok) {
        setResults({ success: terms.length, failed: 0 });
        setKeywordInput("");
        setTimeout(() => {
          onComplete();
        }, 1500);
      } else {
        const data = await res.json();
        setResults({ success: 0, failed: terms.length });
      }
    } catch (error) {
      setResults({ success: 0, failed: terms.length });
    } finally {
      setImporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setKeywordInput(text);
    };
    reader.readAsText(file);
  };

  const keywordCount = keywordInput
    .split(/[\n,]/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Import Keywords</CardTitle>
        <CardDescription>
          Import up to 100 keywords at once via paste or CSV upload
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="batch-project">Project</Label>
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
          <div className="flex items-center justify-between">
            <Label htmlFor="batch-keywords">Keywords</Label>
            <div className="flex items-center gap-2">
              <label htmlFor="csv-upload">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("csv-upload")?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload CSV
                </Button>
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {keywordCount > 0 && (
                <Badge variant="secondary">{keywordCount} keywords</Badge>
              )}
            </div>
          </div>
          <Textarea
            id="batch-keywords"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            placeholder="Enter keywords (one per line or comma-separated)&#10;&#10;Example:&#10;seo tools&#10;keyword research&#10;content optimization"
            rows={10}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Paste keywords or upload a CSV file. One keyword per line or comma-separated. Max 100 keywords.
          </p>
        </div>

        {results && (
          <div className="p-4 border rounded-lg">
            {results.success > 0 ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">
                  Successfully imported {results.success} keyword{results.success !== 1 ? "s" : ""}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">
                  Failed to import {results.failed} keyword{results.failed !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        )}

        <Button
          onClick={handleImport}
          disabled={!keywordInput.trim() || !selectedProject || importing || keywordCount === 0}
          className="w-full"
        >
          {importing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing {keywordCount} Keywords...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Import {keywordCount > 0 ? keywordCount : ""} Keywords
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
