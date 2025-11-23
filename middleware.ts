import type { NextRequest } from "next/server";

export function middleware(_req: NextRequest) {
  // Temporarily disable auth – allow all requests through
  return;
}

export const config = {
  matcher: [], // no protected routes for now
};

