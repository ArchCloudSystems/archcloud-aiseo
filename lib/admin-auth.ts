import { auth } from "./auth";
import { db } from "./db";
import { NextResponse } from "next/server";

export const SUPER_ADMIN_EMAIL = "archcloudsystems@gmail.com";

export async function requireSuperAdmin() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      platformRole: true,
    },
  });

  if (!user || user.email !== SUPER_ADMIN_EMAIL || user.platformRole !== "SUPERADMIN") {
    return NextResponse.json(
      { error: "Forbidden - Super Admin access required" },
      { status: 403 }
    );
  }

  return { userId: session.user.id, email: user.email };
}

export async function verifySuperAdmin(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      platformRole: true,
    },
  });

  return user?.email === SUPER_ADMIN_EMAIL && user?.platformRole === "SUPERADMIN";
}

export function validateDashAppRequest(req: Request): boolean {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  const allowedOrigins = [
    "https://dash.archcloudsystems.com",
    "http://localhost:3001",
    "http://localhost:3000",
  ];

  if (origin && allowedOrigins.includes(origin)) {
    return true;
  }

  if (referer && allowedOrigins.some(allowed => referer.startsWith(allowed))) {
    return true;
  }

  return false;
}
