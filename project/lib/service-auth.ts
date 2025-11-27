import { db } from "./db";
import { headers } from "next/headers";

export async function validateServiceAccount(): Promise<{
  valid: boolean;
  accountId?: string;
  error?: string;
}> {
  const headersList = await headers();
  const apiKey = headersList.get("x-service-api-key");

  if (!apiKey) {
    return { valid: false, error: "Missing service API key" };
  }

  try {
    const serviceAccount = await db.serviceAccount.findUnique({
      where: { apiKey },
    });

    if (!serviceAccount) {
      return { valid: false, error: "Invalid service API key" };
    }

    return { valid: true, accountId: serviceAccount.id };
  } catch (error) {
    console.error("Service account validation error:", error);
    return { valid: false, error: "Service account validation failed" };
  }
}

export async function requireServiceAccount() {
  const result = await validateServiceAccount();

  if (!result.valid) {
    throw new Error(result.error || "Unauthorized");
  }

  return result.accountId!;
}
