import { db } from "./db";

export type RateLimitConfig = {
  maxRequests: number;
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
};

export type RateLimitIdentifier = {
  workspaceId?: string;
  userId?: string;
  ip: string;
  route: string;
  method: string;
};

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  "api:default": { maxRequests: 100, windowMs: 60 * 1000 },
  "api:heavy": { maxRequests: 10, windowMs: 60 * 1000 },
  "api:auth": { maxRequests: 5, windowMs: 15 * 60 * 1000 },
  "api:search": { maxRequests: 30, windowMs: 60 * 1000 },
  "api:generation": { maxRequests: 10, windowMs: 60 * 1000 },
};

export function getRateLimitConfig(route: string): RateLimitConfig {
  if (route.includes("/api/keywords") || route.includes("/api/audits")) {
    return DEFAULT_CONFIGS["api:search"];
  }
  if (
    route.includes("/api/documents/generate") ||
    route.includes("/api/content-briefs")
  ) {
    return DEFAULT_CONFIGS["api:generation"];
  }
  if (route.includes("/api/auth")) {
    return DEFAULT_CONFIGS["api:auth"];
  }
  return DEFAULT_CONFIGS["api:default"];
}

export async function checkRateLimit(
  identifier: RateLimitIdentifier,
  config?: RateLimitConfig
): Promise<RateLimitResult> {
  const effectiveConfig = config || getRateLimitConfig(identifier.route);
  const now = new Date();
  const windowStart = new Date(now.getTime() - effectiveConfig.windowMs);

  const { workspaceId, userId, ip, route, method } = identifier;
  const key = `${workspaceId || "null"}:${userId || "null"}:${ip}:${route}:${method}`;

  const recentLogs = await db.rateLimitLog.count({
    where: {
      workspaceId: workspaceId || null,
      userId: userId || null,
      ip,
      route,
      method,
      createdAt: {
        gte: windowStart,
      },
    },
  });

  const allowed = recentLogs < effectiveConfig.maxRequests;
  const remaining = Math.max(0, effectiveConfig.maxRequests - recentLogs - 1);
  const resetAt = new Date(now.getTime() + effectiveConfig.windowMs);

  if (allowed) {
    await db.rateLimitLog.create({
      data: {
        workspaceId: workspaceId || null,
        userId: userId || null,
        ip,
        route,
        method,
        status: null,
      },
    });
  }

  const retryAfter = allowed ? undefined : Math.ceil(effectiveConfig.windowMs / 1000);

  return {
    allowed,
    remaining,
    resetAt,
    retryAfter,
  };
}

export async function logRateLimitAttempt(
  identifier: RateLimitIdentifier,
  status: number
): Promise<void> {
  await db.rateLimitLog.create({
    data: {
      workspaceId: identifier.workspaceId || null,
      userId: identifier.userId || null,
      ip: identifier.ip,
      route: identifier.route,
      method: identifier.method,
      status,
    },
  });
}

export async function cleanupOldRateLimitLogs(olderThanDays: number = 7): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  const result = await db.rateLimitLog.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
    },
  });

  return result.count;
}
