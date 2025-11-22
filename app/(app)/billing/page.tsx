import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and billing information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>You are currently on the Free plan</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Upgrade to unlock more features and higher limits
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Starter</CardTitle>
            <div className="mt-4">
              <span className="text-3xl font-bold">$49</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">3 projects</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">500 keywords/mo</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">50 content briefs</span>
              </li>
            </ul>
            <Button className="w-full">Upgrade to Starter</Button>
          </CardContent>
        </Card>

        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Pro</CardTitle>
            <div className="mt-4">
              <span className="text-3xl font-bold">$149</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">10 projects</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">2,000 keywords/mo</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">200 content briefs</span>
              </li>
            </ul>
            <Button className="w-full">Upgrade to Pro</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enterprise</CardTitle>
            <div className="mt-4">
              <span className="text-3xl font-bold">$399</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Unlimited projects</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Unlimited keywords</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Unlimited briefs</span>
              </li>
            </ul>
            <Button className="w-full">Contact Sales</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Your invoices and payment history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>No billing history yet</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
