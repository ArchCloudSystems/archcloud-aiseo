"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, CheckCircle2, XCircle, AlertCircle, Settings } from "lucide-react";

type IntegrationConfig = {
  id: string;
  type: string;
  displayName: string | null;
  isEnabled: boolean;
  lastTestedAt: string | null;
  lastTestStatus: string | null;
  lastTestError: string | null;
};

const INTEGRATION_INFO = {
  GA4: {
    name: "Google Analytics 4",
    description: "Connect your GA4 property to track website traffic and user behavior.",
    icon: "📊",
    fields: [
      { name: "propertyId", label: "Property ID", type: "text", placeholder: "123456789" },
      { name: "credentials", label: "Service Account JSON", type: "textarea", placeholder: '{"type": "service_account", ...}' },
    ],
  },
  GSC: {
    name: "Google Search Console",
    description: "Monitor your site's search performance and discover indexing issues.",
    icon: "🔍",
    fields: [
      { name: "siteUrl", label: "Site URL", type: "text", placeholder: "https://example.com" },
      { name: "credentials", label: "Service Account JSON", type: "textarea", placeholder: '{"type": "service_account", ...}' },
    ],
  },
  SERP_API: {
    name: "SERP API",
    description: "Real-time search engine results for keyword research.",
    icon: "🌐",
    fields: [
      { name: "apiKey", label: "API Key", type: "password", placeholder: "Your SERP API key" },
    ],
  },
  OPENAI: {
    name: "OpenAI",
    description: "AI-powered content briefs and SEO recommendations.",
    icon: "🤖",
    fields: [
      { name: "apiKey", label: "API Key", type: "password", placeholder: "sk-..." },
    ],
  },
  ANTHROPIC: {
    name: "Anthropic Claude",
    description: "Advanced AI for content generation and analysis.",
    icon: "🧠",
    fields: [
      { name: "apiKey", label: "API Key", type: "password", placeholder: "sk-ant-..." },
    ],
  },
  GEMINI: {
    name: "Google Gemini",
    description: "Google's multimodal AI for content and analysis.",
    icon: "✨",
    fields: [
      { name: "apiKey", label: "API Key", type: "password", placeholder: "Your Gemini API key" },
    ],
  },
  PAGESPEED: {
    name: "PageSpeed Insights",
    description: "Google PageSpeed Insights for performance audits.",
    icon: "⚡",
    fields: [
      { name: "apiKey", label: "API Key", type: "password", placeholder: "Your Google API key" },
    ],
  },
};

export default function IntegrationsPage() {
  const [configs, setConfigs] = useState<IntegrationConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);
  const [editingConfig, setEditingConfig] = useState<IntegrationConfig | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/integrations/config");
      if (res.ok) {
        const data = await res.json();
        setConfigs(data);
      }
    } catch (error) {
      console.error("Failed to load integration configs:", error);
    } finally {
      setLoading(false);
    }
  };

  const testIntegration = async (id: string) => {
    try {
      setTesting(id);
      const res = await fetch(`/api/integrations/config/${id}/test`, {
        method: "POST",
      });

      const data = await res.json();
      if (data.success) {
        alert("Connection successful!");
      } else {
        alert(`Connection failed: ${data.message}`);
      }
      loadConfigs();
    } catch (error) {
      console.error("Failed to test integration:", error);
      alert("An error occurred");
    } finally {
      setTesting(null);
    }
  };

  const openConfigDialog = async (config: IntegrationConfig | null, type: string) => {
    if (config) {
      setEditingConfig(config);
      try {
        const res = await fetch(`/api/integrations/config/${config.id}`);
        if (res.ok) {
          const data = await res.json();
          setFormData(data.credentials || {});
        }
      } catch (error) {
        console.error("Failed to load config:", error);
      }
    } else {
      setEditingConfig({ type, displayName: null, isEnabled: true } as any);
      setFormData({});
    }
    setIsDialogOpen(true);
  };

  const saveConfig = async () => {
    try {
      setSaving(true);
      const url = editingConfig
        ? `/api/integrations/config/${editingConfig.id}`
        : "/api/integrations/config";
      const method = editingConfig ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: editingConfig?.type,
          credentials: formData,
        }),
      });

      if (res.ok) {
        setIsDialogOpen(false);
        loadConfigs();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save configuration");
      }
    } catch (error) {
      console.error("Failed to save config:", error);
      alert("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (config: IntegrationConfig) => {
    if (!config.isEnabled) {
      return (
        <Badge variant="secondary">
          <AlertCircle className="mr-1 h-3 w-3" />
          Disabled
        </Badge>
      );
    }
    if (config.lastTestStatus === "success") {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Connected
        </Badge>
      );
    }
    if (config.lastTestStatus === "error") {
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" />
          Error
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <AlertCircle className="mr-1 h-3 w-3" />
        Not Tested
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const configuredTypes = configs.map((c) => c.type);
  const availableTypes = Object.keys(INTEGRATION_INFO).filter(
    (type) => !configuredTypes.includes(type)
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="text-muted-foreground">
            Connect your own API keys for each service. Your credentials are encrypted at rest.
          </p>
        </div>
      </div>

      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="text-blue-600 dark:text-blue-400">ℹ️</div>
            <div className="text-sm">
              <p className="font-semibold text-blue-900 dark:text-blue-100">Bring Your Own Keys (BYOK)</p>
              <p className="text-blue-800 dark:text-blue-200 mt-1">
                Each workspace uses its own API keys for complete isolation. If no workspace key is configured,
                the system will fall back to platform-level keys for testing purposes (if available).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {configs.map((config) => {
          const info = INTEGRATION_INFO[config.type as keyof typeof INTEGRATION_INFO];
          if (!info) return null;

          return (
            <Card key={config.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{info.icon}</div>
                    <div>
                      <CardTitle>{info.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {info.description}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(config)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {config.lastTestedAt && (
                    <p className="text-sm text-muted-foreground">
                      Last tested: {new Date(config.lastTestedAt).toLocaleString()}
                    </p>
                  )}
                  {config.lastTestError && (
                    <p className="text-sm text-destructive">
                      Error: {config.lastTestError}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => openConfigDialog(config, config.type)}
                      variant="outline"
                      className="flex-1"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Configure
                    </Button>
                    <Button
                      onClick={() => testIntegration(config.id)}
                      disabled={testing === config.id || !config.isEnabled}
                      variant="default"
                      className="flex-1"
                    >
                      {testing === config.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        "Test Connection"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {availableTypes.map((type) => {
          const info = INTEGRATION_INFO[type as keyof typeof INTEGRATION_INFO];
          return (
            <Card key={type} className="border-dashed">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="text-3xl opacity-50">{info.icon}</div>
                  <div>
                    <CardTitle className="text-muted-foreground">{info.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {info.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => openConfigDialog(null, type)}
                  variant="outline"
                  className="w-full"
                >
                  Configure
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingConfig ? "Edit" : "Add"} Integration
            </DialogTitle>
            <DialogDescription>
              Enter your API credentials below. They will be encrypted and stored securely.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {editingConfig && INTEGRATION_INFO[editingConfig.type as keyof typeof INTEGRATION_INFO]?.fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>{field.label}</Label>
                {field.type === "textarea" ? (
                  <textarea
                    id={field.name}
                    className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                    placeholder={field.placeholder}
                    value={formData[field.name] || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.name]: e.target.value })
                    }
                  />
                ) : (
                  <Input
                    id={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.name]: e.target.value })
                    }
                  />
                )}
              </div>
            ))}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button onClick={saveConfig} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
