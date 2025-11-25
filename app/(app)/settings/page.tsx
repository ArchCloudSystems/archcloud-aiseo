import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserWorkspace } from "@/lib/workspace";
import { db } from "@/lib/db";
import { Users } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();
  const workspace = await getUserWorkspace(session!.user.id);

  const members = await db.workspaceUser.findMany({
    where: { workspaceId: workspace.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  const isOwner = workspace.ownerId === session!.user.id;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="brand">Brand & Links</TabsTrigger>
          <TabsTrigger value="privacy">Privacy & Data</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue={session?.user?.name || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={session?.user?.email || ""} />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage workspace members and invitations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      {session?.user?.name?.charAt(0) || "O"}
                    </div>
                    <div>
                      <p className="font-medium">{session?.user?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {session?.user?.email}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">Owner</span>
                </div>

                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between border-t pt-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        {member.user.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="font-medium">{member.user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground capitalize">
                        {member.role}
                      </span>
                      {isOwner && (
                        <Button variant="ghost" size="sm">
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {isOwner && (
                <div className="border-t pt-4">
                  <p className="mb-2 text-sm font-medium">Invite Team Member</p>
                  <div className="flex gap-2">
                    <Input placeholder="colleague@example.com" type="email" />
                    <Button>Invite</Button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    The user must have an account before you can invite them.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brand" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Brand Information</CardTitle>
              <CardDescription>
                Configure your workspace brand and identity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workspace-name">Workspace Name</Label>
                <Input
                  id="workspace-name"
                  defaultValue={workspace.name}
                  placeholder="My Company"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-logo">Logo URL (Optional)</Label>
                <Input
                  id="company-logo"
                  type="url"
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-xs text-muted-foreground">
                  Provide a URL to your company logo
                </p>
              </div>
              <Button>Save Brand Settings</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>
                Configure your social media presence (optional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="twitter-url">Twitter/X</Label>
                <Input
                  id="twitter-url"
                  type="url"
                  placeholder="https://twitter.com/yourcompany"
                  defaultValue={
                    process.env.NEXT_PUBLIC_SOCIAL_TWITTER_URL || ""
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin-url">LinkedIn</Label>
                <Input
                  id="linkedin-url"
                  type="url"
                  placeholder="https://linkedin.com/company/yourcompany"
                  defaultValue={
                    process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN_URL || ""
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram-url">Instagram</Label>
                <Input
                  id="instagram-url"
                  type="url"
                  placeholder="https://instagram.com/yourcompany"
                  defaultValue={
                    process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL || ""
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook-url">Facebook</Label>
                <Input
                  id="facebook-url"
                  type="url"
                  placeholder="https://facebook.com/yourcompany"
                  defaultValue={
                    process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK_URL || ""
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube-url">YouTube</Label>
                <Input
                  id="youtube-url"
                  type="url"
                  placeholder="https://youtube.com/c/yourcompany"
                  defaultValue={
                    process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE_URL || ""
                  }
                />
              </div>
              <Button>Save Social Links</Button>
              <p className="text-xs text-muted-foreground">
                Note: These links are currently configured via environment
                variables. Per-workspace configuration coming soon.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your account details and provider</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <p className="text-sm text-muted-foreground">
                  {session?.user?.email}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Authentication Provider</Label>
                <p className="text-sm text-muted-foreground">
                  {session?.user?.image ? "Google" : "Email/Password"}
                </p>
              </div>
              <Button variant="outline">Sign Out</Button>
            </CardContent>
          </Card>

          {isOwner && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions that affect your entire workspace
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive">Delete Workspace</Button>
                <p className="text-xs text-muted-foreground mt-2">
                  This will permanently delete your workspace and all associated
                  data. This action cannot be undone.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Manage your workspace data and privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-semibold">Export Your Data</h3>
                <p className="text-sm text-muted-foreground">
                  Download a copy of all your workspace data including projects, keywords, audits, and documents.
                </p>
                <Button variant="outline">Export All Data</Button>
              </div>

              <div className="space-y-3 border-t pt-6">
                <h3 className="font-semibold">Data Retention</h3>
                <p className="text-sm text-muted-foreground">
                  We retain your data for as long as your account is active. Rate limit logs are automatically deleted after 7 days.
                </p>
              </div>

              <div className="space-y-3 border-t pt-6">
                <h3 className="font-semibold">Cookie Preferences</h3>
                <p className="text-sm text-muted-foreground">
                  We use essential cookies to provide core functionality. Analytics and marketing cookies can be managed below.
                </p>
                <Button variant="outline">Manage Cookie Preferences</Button>
              </div>

              {isOwner && (
                <div className="space-y-3 border-t border-destructive pt-6">
                  <h3 className="font-semibold text-destructive">Delete All Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete all workspace data. This action cannot be undone and will remove all projects, keywords, audits, documents, and team member associations.
                  </p>
                  <Button variant="destructive">Delete All Workspace Data</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control how your data is used</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Analytics</p>
                  <p className="text-sm text-muted-foreground">
                    Help us improve by sharing anonymous usage data
                  </p>
                </div>
                <input type="checkbox" className="h-4 w-4" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Product Updates</p>
                  <p className="text-sm text-muted-foreground">
                    Receive emails about new features and improvements
                  </p>
                </div>
                <input type="checkbox" className="h-4 w-4" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Marketing Communications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive promotional emails and special offers
                  </p>
                </div>
                <input type="checkbox" className="h-4 w-4" />
              </div>

              <Button>Save Privacy Preferences</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Legal & Compliance</CardTitle>
              <CardDescription>Review our policies and agreements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm">Privacy Policy</span>
                <Button variant="ghost" size="sm">View</Button>
              </div>
              <div className="flex items-center justify-between py-2 border-t">
                <span className="text-sm">Terms of Service</span>
                <Button variant="ghost" size="sm">View</Button>
              </div>
              <div className="flex items-center justify-between py-2 border-t">
                <span className="text-sm">Cookie Policy</span>
                <Button variant="ghost" size="sm">View</Button>
              </div>
              <div className="flex items-center justify-between py-2 border-t">
                <span className="text-sm">Data Processing Agreement</span>
                <Button variant="ghost" size="sm">View</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <Button>Update Password</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize your app experience</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Theme preference is managed via the toggle in the top navigation bar.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
