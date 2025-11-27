import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./lib/auth";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/admin")) {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }

    const userRole = (session.user as any).role;
    const platformRole = (session.user as any).platformRole;

    if (userRole !== "ADMIN" && platformRole !== "SUPERADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  if (pathname.startsWith("/dashboard") ||
      pathname.startsWith("/projects") ||
      pathname.startsWith("/keywords") ||
      pathname.startsWith("/audits") ||
      pathname.startsWith("/content-briefs") ||
      pathname.startsWith("/documents") ||
      pathname.startsWith("/integrations") ||
      pathname.startsWith("/billing") ||
      pathname.startsWith("/settings")) {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/keywords/:path*",
    "/audits/:path*",
    "/content-briefs/:path*",
    "/documents/:path*",
    "/integrations/:path*",
    "/billing/:path*",
    "/settings/:path*",
    "/admin/:path*",
  ],
};
