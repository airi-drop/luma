import type { AccountType, CategoryType } from "../../types";

export type AIStatus = "idle" | "parsing";

export interface ParserDraft {
  detail?: unknown;
  nominal?: unknown;
  account?: unknown;
  category?: unknown;
  date?: unknown;
  confidence?: unknown;
}

export interface ParseResult {
  detail: string;
  nominal: number;
  account: AccountType;
  category: CategoryType;
  date?: string;
  confidence: number;
  pipeline: "local" | "ai-refined" | "local-fallback";
}

export type AIErrorCode =
  | "AI_DISABLED"
  | "EMPTY_INPUT"
  | "MISSING_API_KEY"
  | "NETWORK"
  | "TIMEOUT"
  | "HTTP_4XX"
  | "HTTP_5XX"
  | "EMPTY_RESPONSE"
  | "PARSE_FAILED"
  | "VALIDATION_FAILED";

export class AIError extends Error {
  constructor(
    public readonly code: AIErrorCode,
    message?: string,
  ) {
    super(message ?? code);
    this.name = "AIError";
  }
}

export interface GeminiRequestOptions {
  prompt: string;
  signal?: AbortSignal;
  timeoutMs?: number;
}
