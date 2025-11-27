"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BarChart3, FolderOpen, LayoutDashboard, Search, Settings, Sparkles, CreditCard, X, FileText, Link2, Files, Shield, HelpCircle } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Projects",
    icon: FolderOpen,
    href: "/projects",
  },
  {
    label: "Keywords",
    icon: Search,
    href: "/keywords",
  },
  {
    label: "Audits",
    icon: BarChart3,
    href: "/audits",
  },
  {
    label: "Content Briefs",
    icon: FileText,
    href: "/content-briefs",
  },
  {
    label: "Documents",
    icon: Files,
    href: "/documents",
  },
  {
    label: "Integrations",
    icon: Link2,
    href: "/integrations",
  },
  {
    label: "Help",
    icon: HelpCircle,
    href: "/help",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();

  const userRole = session?.user?.role;
  const platformRole = (session?.user as any)?.platformRole;
  const isAdmin = userRole === "ADMIN" || platformRole === "SUPERADMIN";

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-3 left-3 z-50"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <LayoutDashboard className="h-5 w-5" />}
      </Button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-full w-64 flex-col border-r bg-slate-950 transition-transform duration-200 md:relative md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Sparkles className="h-6 w-6" />
          <span className="text-lg font-bold">{siteConfig.name}</span>
        </div>
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === route.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              <route.icon className="h-5 w-5" />
              {route.label}
            </Link>
          ))}

          {isAdmin && (
            <>
              <div className="my-4 border-t pt-4">
                <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Admin
                </p>
              </div>
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  pathname === "/admin"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                <Shield className="h-5 w-5" />
                System Admin
              </Link>
            </>
          )}
        </nav>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
