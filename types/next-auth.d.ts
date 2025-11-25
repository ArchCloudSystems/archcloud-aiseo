import { DefaultSession } from "next-auth";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      hasCompletedOnboarding?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    hasCompletedOnboarding?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    hasCompletedOnboarding?: boolean;
  }
}
