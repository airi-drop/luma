import type { AIProvider } from "../../types";
import type { GeminiRequestOptions } from "./types";
import { AIError } from "./types";

/**
 * Build-time injected env (via vite.config.ts define).
 * Dijamin inline ke bundle saat build, termasuk di Vercel.
 */
declare const __LUMA_ENV__: {
  geminiKey: string;
  openaiKey: string;
  openrouterKey: string;
  universalKey: string;
  provider: string;
  model: string;
};

function getEnv() {
  // __LUMA_ENV__ di-define di vite.config.ts via `define` →
  // diganti jadi literal object saat build.
  if (typeof __LUMA_ENV__ !== "undefined" && __LUMA_ENV__) {
    return __LUMA_ENV__;
  }

  // Fallback ke import.meta.env (lokal dev / non-Vercel).
  return {
    geminiKey: import.meta.env.VITE_GEMINI_API_KEY ?? "",
    openaiKey: import.meta.env.VITE_OPENAI_API_KEY ?? "",
    openrouterKey: import.meta.env.VITE_OPENROUTER_API_KEY ?? "",
    universalKey: import.meta.env.VITE_AI_API_KEY ?? "",
    provider: import.meta.env.VITE_AI_PROVIDER ?? "",
    model: import.meta.env.VITE_AI_MODEL ?? "",
  };
}

interface AIProviderConfig {
  id: AIProvider;
  defaultModel: string;
  readonly envApiKey: string | undefined;
  resolveEndpoint: (model: string) => string;
  buildHeaders: (apiKey: string) => Record<string, string>;
  buildBody: (prompt: string, model: string) => unknown;
  extractText: (payload: unknown) => string | undefined;
}

const PROVIDERS: Record<AIProvider, AIProviderConfig> = {
  gemini: {
    id: "gemini",
    defaultModel: "gemini-2.5-flash",
    get envApiKey() {
      return getEnv().geminiKey;
    },
    resolveEndpoint: (model) =>
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    buildHeaders: (apiKey) => ({
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    }),
    buildBody: (prompt) => ({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
    extractText: (payload) => {
      const data = payload as {
        candidates?: Array<{
          content?: { parts?: Array<{ text?: string }> };
        }>;
      };
      return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    },
  },
  openai: {
    id: "openai",
    defaultModel: "gpt-4o-mini",
    get envApiKey() {
      return getEnv().openaiKey;
    },
    resolveEndpoint: () => "https://api.openai.com/v1/chat/completions",
    buildHeaders: (apiKey) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }),
    buildBody: (prompt, model) => ({
      model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    }),
    extractText: (payload) => {
      const data = payload as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      return data.choices?.[0]?.message?.content?.trim();
    },
  },
  openrouter: {
    id: "openrouter",
    defaultModel: "google/gemini-2.5-flash",
    get envApiKey() {
      return getEnv().openrouterKey;
    },
    resolveEndpoint: () => "https://openrouter.ai/api/v1/chat/completions",
    buildHeaders: (apiKey) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer":
        typeof window === "undefined"
          ? "https://luma.local"
          : window.location.origin,
      "X-Title": "Luma",
    }),
    buildBody: (prompt, model) => ({
      model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    }),
    extractText: (payload) => {
      const data = payload as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      return data.choices?.[0]?.message?.content?.trim();
    },
  },
};

function resolveProvider(): AIProvider {
  const fromEnv = getEnv().provider.trim().toLowerCase();
  if (fromEnv === "openai" || fromEnv === "openrouter" || fromEnv === "gemini") {
    return fromEnv;
  }
  return "gemini";
}

interface ResolvedConfig {
  config: AIProviderConfig;
  apiKey: string;
  model: string;
}

function resolveConfig(): ResolvedConfig {
  const provider = resolveProvider();
  const config = PROVIDERS[provider];
  const env = getEnv();
  const apiKey =
    (config.envApiKey?.trim() || env.universalKey.trim() || "");

  if (!apiKey) {
    throw new AIError("MISSING_API_KEY");
  }

  const model = env.model.trim() || config.defaultModel;

  return { config, apiKey, model };
}

export async function aiGenerate({
  prompt,
  signal,
  timeoutMs = 12000,
}: GeminiRequestOptions) {
  const { config, apiKey, model } = resolveConfig();
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort("timeout");
  }, timeoutMs);

  const abortController = () => {
    controller.abort("aborted");
  };

  signal?.addEventListener("abort", abortController, { once: true });

  try {
    const response = await fetch(config.resolveEndpoint(model), {
      method: "POST",
      headers: config.buildHeaders(apiKey),
      signal: controller.signal,
      body: JSON.stringify(config.buildBody(prompt, model)),
    });

    if (response.status >= 400 && response.status < 500) {
      throw new AIError("HTTP_4XX");
    }

    if (response.status >= 500) {
      throw new AIError("HTTP_5XX");
    }

    const payload = (await response.json()) as unknown;
    const text = config.extractText(payload);

    if (!text) {
      throw new AIError("EMPTY_RESPONSE");
    }

    return text;
  } catch (error) {
    if (error instanceof AIError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new AIError(signal?.aborted ? "NETWORK" : "TIMEOUT");
    }

    throw new AIError("NETWORK");
  } finally {
    window.clearTimeout(timeoutId);
    signal?.removeEventListener("abort", abortController);
  }
}

/** @deprecated pakai aiGenerate. Alias supaya kode lama tidak pecah. */
export const geminiGenerate = aiGenerate;
