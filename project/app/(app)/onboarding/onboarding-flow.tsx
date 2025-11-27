"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ArrowRight, ArrowLeft, Globe, Link2, BarChart3 } from "lucide-react";

type OnboardingStep = "welcome" | "domain" | "integrations" | "audit" | "complete";

export function OnboardingFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [projectName, setProjectName] = useState("");
  const [domain, setDomain] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const steps: OnboardingStep[] = ["welcome", "domain", "integrations", "audit", "complete"];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep === "welcome") {
      setCurrentStep("domain");
    } else if (currentStep === "domain") {
      setCurrentStep("integrations");
    } else if (currentStep === "integrations") {
      setCurrentStep("audit");
    } else if (currentStep === "audit") {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const handleBack = () => {
    if (currentStep === "domain") {
      setCurrentStep("welcome");
    } else if (currentStep === "integrations") {
      setCurrentStep("domain");
    } else if (currentStep === "audit") {
      setCurrentStep("integrations");
    }
  };

  const completeOnboarding = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectName: projectName || "My First Project",
          domain,
        }),
      });

      if (response.ok) {
        setCurrentStep("complete");
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 2000);
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-2xl">
        {currentStep !== "welcome" && currentStep !== "complete" && (
          <div className="w-full bg-secondary h-2">
            <div
              className="bg-primary h-2 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {currentStep === "welcome" && (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-3xl">Welcome to ArchCloud SEO</CardTitle>
              <CardDescription className="text-lg">
                Let&apos;s get you set up in just 4 simple steps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Globe className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Add Your Domain</h3>
                    <p className="text-sm text-muted-foreground">
                      Create your first project and add your website
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Link2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Connect Integrations</h3>
                    <p className="text-sm text-muted-foreground">
                      Optionally connect GA4, Search Console, and your API keys
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <BarChart3 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Run Your First Audit</h3>
                    <p className="text-sm text-muted-foreground">
                      Get instant insights into your site&apos;s SEO performance
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleSkip}>
                  Skip Setup
                </Button>
                <Button onClick={handleNext} size="lg">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {currentStep === "domain" && (
          <>
            <CardHeader>
              <CardTitle>Add Your Domain</CardTitle>
              <CardDescription>
                Create your first project by adding your website domain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  placeholder="My Website"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">Domain (Optional)</Label>
                <Input
                  id="domain"
                  type="url"
                  placeholder="https://example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  You can add or change this later in project settings
                </p>
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={handleSkip}>
                    Skip
                  </Button>
                  <Button onClick={handleNext} disabled={!projectName.trim()}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        )}

        {currentStep === "integrations" && (
          <>
            <CardHeader>
              <CardTitle>Connect Integrations</CardTitle>
              <CardDescription>
                Bring your own API keys for enhanced functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-2xl">📊</div>
                    <div>
                      <h4 className="font-semibold">Google Analytics 4</h4>
                      <p className="text-sm text-muted-foreground">Track website traffic</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push("/integrations")}>
                    Configure
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-2xl">🔍</div>
                    <div>
                      <h4 className="font-semibold">Google Search Console</h4>
                      <p className="text-sm text-muted-foreground">Monitor search performance</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push("/integrations")}>
                    Configure
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-2xl">🤖</div>
                    <div>
                      <h4 className="font-semibold">AI Services</h4>
                      <p className="text-sm text-muted-foreground">OpenAI, Claude, or Gemini</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push("/integrations")}>
                    Configure
                  </Button>
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Optional:</strong> You can connect these integrations now or skip and set them up later from the Integrations page.
                </p>
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={handleSkip}>
                    Skip
                  </Button>
                  <Button onClick={handleNext}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        )}

        {currentStep === "audit" && (
          <>
            <CardHeader>
              <CardTitle>Run Your First Audit</CardTitle>
              <CardDescription>
                Get instant insights into your site&apos;s SEO performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-6 border-2 border-dashed rounded-lg text-center space-y-3">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Ready to Audit</h3>
                  <p className="text-sm text-muted-foreground">
                    Once setup is complete, you&apos;ll be able to run comprehensive SEO audits from your dashboard
                  </p>
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-900 dark:text-green-100">
                  <strong>What you&apos;ll get:</strong> On-page SEO analysis, performance scores, keyword optimization recommendations, and actionable improvements.
                </p>
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleNext} disabled={isLoading}>
                  {isLoading ? "Setting up..." : "Complete Setup"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {currentStep === "complete" && (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <CardTitle className="text-3xl">All Set!</CardTitle>
              <CardDescription className="text-lg">
                Your account has been set up successfully
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                Redirecting you to your dashboard...
              </p>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
