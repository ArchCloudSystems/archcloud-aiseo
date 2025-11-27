// lib/db.ts

// Temporary TS ignore because Prisma 6 typing is inconsistent across turbopack
// @ts-ignore
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// ⚠️ IMPORTANT: EXPORT `db` FOR BACKWARD COMPATIBILITY
// The old app expects: import { db } from "@/lib/db"
export const db = prisma;

export default prisma;

