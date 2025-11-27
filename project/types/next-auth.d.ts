import { DefaultSession } from "next-auth";
import { UserRole, PlatformRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      platformRole?: PlatformRole;
      hasCompletedOnboarding?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    platformRole?: PlatformRole;
    hasCompletedOnboarding?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    platformRole?: PlatformRole;
    hasCompletedOnboarding?: boolean;
  }
}
