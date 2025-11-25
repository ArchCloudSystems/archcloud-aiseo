import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AuditsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">SEO Audits</h1>
        <p className="text-muted-foreground">
          Run comprehensive on-page SEO audits with AI-powered recommendations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Run New Audit</CardTitle>
          <CardDescription>Enter a URL to analyze its SEO performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Page URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com/page"
            />
          </div>
          <Button>Run Audit</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit History</CardTitle>
          <CardDescription>Your previous SEO audits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>No audits yet. Run your first audit above.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
