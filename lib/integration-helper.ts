import { db } from "./db";
import { decryptCredentials } from "./crypto";
import { IntegrationType } from "@prisma/client";

export async function getWorkspaceIntegrationCredentials<T = Record<string, unknown>>(
  workspaceId: string,
  type: IntegrationType
): Promise<T | null> {
  const config = await db.integrationConfig.findUnique({
    where: {
      workspaceId_type: {
        workspaceId,
        type,
      },
    },
  });

  if (!config || !config.isEnabled) {
    return null;
  }

  try {
    return decryptCredentials<T>(config.encryptedCredentials);
  } catch (error) {
    console.error(`Failed to decrypt credentials for ${type}:`, error);
    return null;
  }
}

export async function hasIntegration(
  workspaceId: string,
  type: IntegrationType
): Promise<boolean> {
  const config = await db.integrationConfig.findUnique({
    where: {
      workspaceId_type: {
        workspaceId,
        type,
      },
    },
  });

  return !!config && config.isEnabled;
}

export type SERPAPICredentials = {
  apiKey: string;
};

export type OpenAICredentials = {
  apiKey: string;
};

export type PageSpeedCredentials = {
  apiKey: string;
};

export async function getOrFallbackSERPAPIKey(workspaceId: string): Promise<string | null> {
  const creds = await getWorkspaceIntegrationCredentials<SERPAPICredentials>(
    workspaceId,
    IntegrationType.SERP_API
  );

  if (creds?.apiKey) {
    return creds.apiKey;
  }

  return process.env.SERPAPI_API_KEY || null;
}

export async function getOrFallbackOpenAIKey(workspaceId: string): Promise<string | null> {
  const creds = await getWorkspaceIntegrationCredentials<OpenAICredentials>(
    workspaceId,
    IntegrationType.OPENAI
  );

  if (creds?.apiKey) {
    return creds.apiKey;
  }

  return process.env.OPENAI_API_KEY || null;
}

export async function getOrFallbackPageSpeedKey(workspaceId: string): Promise<string | null> {
  const creds = await getWorkspaceIntegrationCredentials<PageSpeedCredentials>(
    workspaceId,
    IntegrationType.PAGESPEED
  );

  if (creds?.apiKey) {
    return creds.apiKey;
  }

  return process.env.PAGESPEED_API_KEY || null;
}
