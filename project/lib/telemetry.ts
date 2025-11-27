import { db } from "./db";
import { TelemetryEventType } from "@prisma/client";

export type TelemetryContext = {
  workspaceId: string;
  userId?: string;
  type: TelemetryEventType;
  context?: string;
  metadata?: Record<string, any>;
};

export async function logTelemetryEvent({
  workspaceId,
  userId,
  type,
  context,
  metadata,
}: TelemetryContext): Promise<void> {
  try {
    await db.telemetryEvent.create({
      data: {
        workspaceId,
        userId,
        type,
        context,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (error) {
    console.error("Failed to log telemetry event:", error);
  }
}

export async function logUserLogin(workspaceId: string, userId: string) {
  await logTelemetryEvent({
    workspaceId,
    userId,
    type: "USER_LOGIN",
  });
}

export async function logUserLogout(workspaceId: string, userId: string) {
  await logTelemetryEvent({
    workspaceId,
    userId,
    type: "USER_LOGOUT",
  });
}

export async function logProjectCreated(
  workspaceId: string,
  userId: string,
  projectId: string,
  projectName: string
) {
  await logTelemetryEvent({
    workspaceId,
    userId,
    type: "PROJECT_CREATED",
    context: projectId,
    metadata: { projectName },
  });
}

export async function logProjectUpdated(
  workspaceId: string,
  userId: string,
  projectId: string
) {
  await logTelemetryEvent({
    workspaceId,
    userId,
    type: "PROJECT_UPDATED",
    context: projectId,
  });
}

export async function logProjectDeleted(
  workspaceId: string,
  userId: string,
  projectId: string
) {
  await logTelemetryEvent({
    workspaceId,
    userId,
    type: "PROJECT_DELETED",
    context: projectId,
  });
}

export async function logKeywordSearch(
  workspaceId: string,
  userId: string,
  projectId: string,
  keywords: string[]
) {
  await logTelemetryEvent({
    workspaceId,
    userId,
    type: "KEYWORD_SEARCH",
    context: projectId,
    metadata: { keywords, count: keywords.length },
  });
}

export async function logAuditRun(
  workspaceId: string,
  userId: string,
  projectId: string,
  url: string
) {
  await logTelemetryEvent({
    workspaceId,
    userId,
    type: "AUDIT_RUN",
    context: projectId,
    metadata: { url },
  });
}

export async function logContentBriefGenerated(
  workspaceId: string,
  userId: string,
  projectId: string,
  keyword: string
) {
  await logTelemetryEvent({
    workspaceId,
    userId,
    type: "CONTENT_BRIEF_GENERATED",
    context: projectId,
    metadata: { keyword },
  });
}

export async function logDocumentCreated(
  workspaceId: string,
  userId: string,
  documentId: string,
  documentType: string
) {
  await logTelemetryEvent({
    workspaceId,
    userId,
    type: "DOCUMENT_CREATED",
    context: documentId,
    metadata: { documentType },
  });
}

export async function logIntegrationConnected(
  workspaceId: string,
  userId: string,
  integrationType: string
) {
  await logTelemetryEvent({
    workspaceId,
    userId,
    type: "INTEGRATION_CONNECTED",
    metadata: { integrationType },
  });
}

export async function logIntegrationDisconnected(
  workspaceId: string,
  userId: string,
  integrationType: string
) {
  await logTelemetryEvent({
    workspaceId,
    userId,
    type: "INTEGRATION_DISCONNECTED",
    metadata: { integrationType },
  });
}

export async function logError(
  workspaceId: string,
  userId: string | undefined,
  error: Error | string,
  context?: string
) {
  await logTelemetryEvent({
    workspaceId,
    userId,
    type: "ERROR_OCCURRED",
    context,
    metadata: {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    },
  });
}

export async function logApiCall(
  workspaceId: string,
  userId: string | undefined,
  endpoint: string,
  method: string
) {
  await logTelemetryEvent({
    workspaceId,
    userId,
    type: "API_CALL",
    context: endpoint,
    metadata: { method },
  });
}
