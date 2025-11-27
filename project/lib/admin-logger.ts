import { db } from "./db";

export type AdminLogLevel = "INFO" | "WARN" | "ERROR" | "SECURITY";

export type AdminLogEntry = {
  level: AdminLogLevel;
  action: string;
  userId?: string;
  workspaceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
};

export async function logAdminAction(entry: AdminLogEntry): Promise<void> {
  try {
    await db.adminLog.create({
      data: {
        level: entry.level,
        action: entry.action,
        userId: entry.userId,
        workspaceId: entry.workspaceId,
        metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Failed to write admin log:", error);
  }
}

export async function logSecurityEvent(
  action: string,
  userId: string | undefined,
  details: Record<string, unknown>,
  req?: Request
): Promise<void> {
  const ipAddress = req?.headers.get("x-forwarded-for") ||
                    req?.headers.get("x-real-ip") ||
                    "unknown";
  const userAgent = req?.headers.get("user-agent") || "unknown";

  await logAdminAction({
    level: "SECURITY",
    action,
    userId,
    metadata: details,
    ipAddress,
    userAgent,
  });
}

export async function getAdminLogs(options: {
  limit?: number;
  offset?: number;
  level?: AdminLogLevel;
  userId?: string;
  workspaceId?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const where: any = {};

  if (options.level) {
    where.level = options.level;
  }

  if (options.userId) {
    where.userId = options.userId;
  }

  if (options.workspaceId) {
    where.workspaceId = options.workspaceId;
  }

  if (options.startDate || options.endDate) {
    where.timestamp = {};
    if (options.startDate) {
      where.timestamp.gte = options.startDate;
    }
    if (options.endDate) {
      where.timestamp.lte = options.endDate;
    }
  }

  const [logs, total] = await Promise.all([
    db.adminLog.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: options.limit || 100,
      skip: options.offset || 0,
    }),
    db.adminLog.count({ where }),
  ]);

  return { logs, total };
}

export async function deleteOldLogs(daysToKeep: number = 90): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = await db.adminLog.deleteMany({
    where: {
      timestamp: {
        lt: cutoffDate,
      },
      level: {
        not: "SECURITY",
      },
    },
  });

  return result.count;
}
