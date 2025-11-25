"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Plus,
  Trash2,
  Edit,
  Download,
  Filter,
  FileCheck,
  Shield,
  ScrollText,
  FileBarChart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Document = {
  id: string;
  title: string;
  type: string;
  content: string | null;
  url: string | null;
  tags: string | null;
  createdAt: Date;
  updatedAt: Date;
  project: { id: string; name: string } | null;
  client: { id: string; name: string } | null;
};

type Project = {
  id: string;
  name: string;
};

type Props = {
  initialDocuments: Document[];
  projects: Project[];
  workspaceName: string;
};

const DOCUMENT_TYPES = [
  { value: "NOTE", label: "Note", icon: FileText },
  { value: "LEGAL", label: "Legal Document", icon: Shield },
  { value: "REPORT", label: "SEO Report", icon: FileBarChart },
  { value: "STRATEGY", label: "Strategy Document", icon: ScrollText },
  { value: "RESEARCH", label: "Research", icon: FileCheck },
  { value: "UPLOAD", label: "Upload", icon: FileText },
];

const LEGAL_TEMPLATES = [
  { value: "privacy-policy", label: "Privacy Policy" },
  { value: "dpa", label: "Data Processing Agreement (DPA)" },
  { value: "terms", label: "Terms of Service" },
  { value: "cookie-policy", label: "Cookie Policy" },
  { value: "seo-audit-report", label: "SEO Audit Report Template" },
];

export function DocumentsClient({
  initialDocuments,
  projects,
  workspaceName,
}: Props) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [filterType, setFilterType] = useState<string>("all");
  const [filterProject, setFilterProject] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    type: "NOTE" as string,
    content: "",
    url: "",
    tags: "",
    projectId: "",
    template: "",
  });

  const filteredDocuments = documents.filter((doc) => {
    if (filterType !== "all" && doc.type !== filterType) return false;
    if (filterProject !== "all" && doc.project?.id !== filterProject)
      return false;
    return true;
  });

  async function handleGenerateTemplate() {
    if (!formData.template) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/documents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template: formData.template,
          workspaceName,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate template");

      const data = await response.json();
      setFormData((prev) => ({
        ...prev,
        content: data.content,
        title: data.title,
        type: "LEGAL",
      }));
    } catch (error) {
      console.error("Template generation error:", error);
      alert("Failed to generate template. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateDocument() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          type: formData.type,
          content: formData.content || undefined,
          url: formData.url || undefined,
          tags: formData.tags || undefined,
          projectId: formData.projectId || undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to create document");

      const data = await response.json();
      setDocuments((prev) => [data.document, ...prev]);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Document creation error:", error);
      alert("Failed to create document. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdateDocument() {
    if (!selectedDocument) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/documents/${selectedDocument.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          type: formData.type,
          content: formData.content || undefined,
          url: formData.url || undefined,
          tags: formData.tags || undefined,
          projectId: formData.projectId || undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to update document");

      const data = await response.json();
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === data.document.id ? data.document : doc))
      );
      setIsViewDialogOpen(false);
      setSelectedDocument(null);
      resetForm();
    } catch (error) {
      console.error("Document update error:", error);
      alert("Failed to update document. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteDocument() {
    if (!selectedDocument) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/documents/${selectedDocument.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete document");

      setDocuments((prev) => prev.filter((doc) => doc.id !== selectedDocument.id));
      setIsDeleteDialogOpen(false);
      setSelectedDocument(null);
    } catch (error) {
      console.error("Document deletion error:", error);
      alert("Failed to delete document. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      title: "",
      type: "NOTE",
      content: "",
      url: "",
      tags: "",
      projectId: "",
      template: "",
    });
  }

  function openViewDialog(document: Document) {
    setSelectedDocument(document);
    setFormData({
      title: document.title,
      type: document.type,
      content: document.content || "",
      url: document.url || "",
      tags: document.tags || "",
      projectId: document.project?.id || "",
      template: "",
    });
    setIsViewDialogOpen(true);
  }

  function openDeleteDialog(document: Document) {
    setSelectedDocument(document);
    setIsDeleteDialogOpen(true);
  }

  function getTypeIcon(type: string) {
    const docType = DOCUMENT_TYPES.find((t) => t.value === type);
    const Icon = docType?.icon || FileText;
    return <Icon className="h-4 w-4" />;
  }

  function getTypeBadgeColor(type: string) {
    switch (type) {
      case "LEGAL":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "REPORT":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "STRATEGY":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "RESEARCH":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Document Library</CardTitle>
              <CardDescription>
                {filteredDocuments.length} document
                {filteredDocuments.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Document
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={filterProject} onValueChange={setFilterProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No documents found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first document to get started
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Document
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocuments.map((document) => (
                <div
                  key={document.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-3"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-1">{getTypeIcon(document.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium truncate">
                          {document.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className={getTypeBadgeColor(document.type)}
                        >
                          {DOCUMENT_TYPES.find((t) => t.value === document.type)
                            ?.label || document.type}
                        </Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-muted-foreground mt-1">
                        {document.project && (
                          <span>Project: {document.project.name}</span>
                        )}
                        {document.project && (
                          <span className="hidden sm:inline">•</span>
                        )}
                        <span>
                          {new Date(document.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openViewDialog(document)}
                      className="flex-1 sm:flex-none"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteDialog(document)}
                      className="flex-1 sm:flex-none"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Document</DialogTitle>
            <DialogDescription>
              Create a document from scratch or use a template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Template (Optional)</Label>
              <div className="flex gap-2 mt-2">
                <Select
                  value={formData.template}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, template: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEGAL_TEMPLATES.map((template) => (
                      <SelectItem key={template.value} value={template.value}>
                        {template.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleGenerateTemplate}
                  disabled={!formData.template || isLoading}
                >
                  {isLoading ? "Generating..." : "Generate"}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Document title"
              />
            </div>

            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="project">Project (Optional)</Label>
              <Select
                value={formData.projectId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, projectId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder="Document content"
                rows={10}
                className="font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="url">URL (Optional)</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, url: e.target.value }))
                }
                placeholder="https://example.com/document.pdf"
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags (Optional)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, tags: e.target.value }))
                }
                placeholder="legal, gdpr, privacy"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateDocument} disabled={isLoading || !formData.title}>
              {isLoading ? "Creating..." : "Create Document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
            <DialogDescription>Update document details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            <div>
              <Label htmlFor="edit-type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-project">Project</Label>
              <Select
                value={formData.projectId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, projectId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                rows={10}
                className="font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="edit-url">URL</Label>
              <Input
                id="edit-url"
                type="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, url: e.target.value }))
                }
              />
            </div>

            <div>
              <Label htmlFor="edit-tags">Tags</Label>
              <Input
                id="edit-tags"
                value={formData.tags}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, tags: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsViewDialogOpen(false);
                setSelectedDocument(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateDocument} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedDocument?.title}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedDocument(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteDocument}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
