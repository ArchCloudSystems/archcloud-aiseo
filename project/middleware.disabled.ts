import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/projects",
  "/keywords",
  "/audits",
  "/billing",
  "/settings",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect the routes we care about
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // Use NextAuth JWT, no Prisma in middleware
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/keywords/:path*",
    "/audits/:path*",
    "/billing/:path*",
    "/settings/:path*",
  ],
};

