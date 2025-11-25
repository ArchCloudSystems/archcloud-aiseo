import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple middleware that just lets requests through.
// We are intentionally NOT using Auth.js or Prisma here
// because Edge runtime cannot use Prisma Client.
export function middleware(_req: NextRequest) {
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

