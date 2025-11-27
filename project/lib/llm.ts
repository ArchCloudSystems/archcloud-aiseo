import OpenAI from "openai";
import { db } from "./db";

export type LLMProvider = "openai" | "anthropic" | "gemini" | "shared";

export type LLMProfile = "fast" | "balanced" | "deep";

export interface LLMGenerateOptions {
  prompt: string;
  system?: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  provider: string;
  model: string;
}

const PROFILE_CONFIGS: Record<
  LLMProfile,
  { openai: string; anthropic?: string; gemini?: string }
> = {
  fast: {
    openai: "gpt-4o-mini",
    anthropic: "claude-3-haiku-20240307",
    gemini: "gemini-1.5-flash",
  },
  balanced: {
    openai: "gpt-4o",
    anthropic: "claude-3-5-sonnet-20241022",
    gemini: "gemini-1.5-pro",
  },
  deep: {
    openai: "gpt-4o",
    anthropic: "claude-3-5-sonnet-20241022",
    gemini: "gemini-2.0-flash-exp",
  },
};

export async function getWorkspaceLLMConfig(
  workspaceId: string,
  provider: LLMProvider = "openai"
) {
  if (provider === "shared") {
    return {
      provider: "openai",
      apiKey: process.env.OPENAI_API_KEY,
      isShared: true,
    };
  }

  const config = await db.integrationConfig.findFirst({
    where: {
      workspaceId,
      type: provider.toUpperCase() as any,
      isEnabled: true,
    },
  });

  if (config && config.encryptedCredentials) {
    try {
      const credentials = JSON.parse(config.encryptedCredentials);
      return {
        provider,
        apiKey: credentials.apiKey,
        isShared: false,
      };
    } catch {
      throw new Error(`Invalid credentials for ${provider}`);
    }
  }

  const fallbackKey =
    provider === "openai"
      ? process.env.OPENAI_API_KEY
      : provider === "anthropic"
        ? process.env.ANTHROPIC_API_KEY
        : process.env.GEMINI_API_KEY;

  if (fallbackKey) {
    return {
      provider,
      apiKey: fallbackKey,
      isShared: true,
    };
  }

  throw new Error(`No API key configured for ${provider}`);
}

export async function generateText(
  workspaceId: string,
  options: LLMGenerateOptions,
  profile: LLMProfile = "balanced",
  preferredProvider: LLMProvider = "openai"
): Promise<LLMResponse> {
  const config = await getWorkspaceLLMConfig(workspaceId, preferredProvider);

  if (config.provider === "openai") {
    return generateWithOpenAI(config.apiKey!, options, profile);
  }

  if (config.provider === "anthropic") {
    return generateWithAnthropic(config.apiKey!, options, profile);
  }

  if (config.provider === "gemini") {
    return generateWithGemini(config.apiKey!, options, profile);
  }

  throw new Error(`Unsupported provider: ${config.provider}`);
}

async function generateWithOpenAI(
  apiKey: string,
  options: LLMGenerateOptions,
  profile: LLMProfile
): Promise<LLMResponse> {
  const openai = new OpenAI({ apiKey });

  const model = options.model || PROFILE_CONFIGS[profile].openai;

  const messages: any[] = [];
  if (options.system) {
    messages.push({ role: "system", content: options.system });
  }
  messages.push({ role: "user", content: options.prompt });

  const response = await openai.chat.completions.create({
    model,
    messages,
    max_tokens: options.maxTokens || 2000,
    temperature: options.temperature || 0.7,
  });

  return {
    content: response.choices[0]?.message?.content || "",
    usage: {
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
    },
    provider: "openai",
    model,
  };
}

async function generateWithAnthropic(
  apiKey: string,
  options: LLMGenerateOptions,
  profile: LLMProfile
): Promise<LLMResponse> {
  const model = options.model || PROFILE_CONFIGS[profile].anthropic;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: options.maxTokens || 2000,
      system: options.system,
      messages: [{ role: "user", content: options.prompt }],
      temperature: options.temperature || 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    content: data.content[0]?.text || "",
    usage: {
      promptTokens: data.usage?.input_tokens || 0,
      completionTokens: data.usage?.output_tokens || 0,
      totalTokens:
        (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
    },
    provider: "anthropic",
    model: model!,
  };
}

async function generateWithGemini(
  apiKey: string,
  options: LLMGenerateOptions,
  profile: LLMProfile
): Promise<LLMResponse> {
  const model = options.model || PROFILE_CONFIGS[profile].gemini;

  const systemInstruction = options.system
    ? { parts: [{ text: options.system }] }
    : undefined;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: options.prompt }] }],
        systemInstruction,
        generationConfig: {
          maxOutputTokens: options.maxTokens || 2000,
          temperature: options.temperature || 0.7,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();

  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  return {
    content,
    usage: {
      promptTokens: data.usageMetadata?.promptTokenCount || 0,
      completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
      totalTokens: data.usageMetadata?.totalTokenCount || 0,
    },
    provider: "gemini",
    model: model!,
  };
}

export async function getAvailableProviders(
  workspaceId: string
): Promise<LLMProvider[]> {
  const configs = await db.integrationConfig.findMany({
    where: {
      workspaceId,
      type: { in: ["OPENAI", "ANTHROPIC", "GEMINI"] },
      isEnabled: true,
    },
  });

  const providers: LLMProvider[] = [];

  configs.forEach((config) => {
    if (config.type === "OPENAI") providers.push("openai");
    if (config.type === "ANTHROPIC") providers.push("anthropic");
    if (config.type === "GEMINI") providers.push("gemini");
  });

  if (process.env.OPENAI_API_KEY && !providers.includes("openai")) {
    providers.push("openai");
  }
  if (process.env.ANTHROPIC_API_KEY && !providers.includes("anthropic")) {
    providers.push("anthropic");
  }
  if (process.env.GEMINI_API_KEY && !providers.includes("gemini")) {
    providers.push("gemini");
  }

  return providers.length > 0 ? providers : ["openai"];
}
