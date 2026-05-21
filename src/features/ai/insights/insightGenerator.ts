import { aiInsightsRepo } from "../../../db/repositories/ai-insights.repo";
import { aiUsageRepo } from "../../../db/repositories/ai-usage.repo";
import { transactionsRepo } from "../../../db/repositories/transactions.repo";
import { getPreviousMonth } from "../../../lib/date";
import type { AIInsightRecord, Transaction } from "../../../types";
import { geminiGenerate } from "../geminiClient";
import { AIError } from "../types";
import {
  AI_INSIGHT_MIN_TRANSACTIONS,
  AI_INSIGHT_MONTHLY_LIMIT,
} from "./constants";
import { getInsightStateMessage } from "./copy";
import { buildInsightAggregate } from "./insightAggregator";
import { buildInsightPrompt } from "./insightPrompt";
import type {
  AIInsightContent,
  AIInsightType,
  AggregatedMonthlyInsightData,
  InsightPreparationIdleResult,
  InsightPreparationResult,
  InsightSuccessResult,
} from "./types";

function stripMarkdownFence(input: string) {
  const match = input.match(/^\s*```(?:json)?\s*\n([\s\S]*?)\n```\s*$/i);
  return match ? match[1].trim() : input.trim();
}

function mapRecordToContent(record: AIInsightRecord): AIInsightContent {
  return {
    headline: record.headline,
    reflection: record.reflection,
    action: record.action,
    types: record.types as AIInsightType[],
  };
}

function normalizeTypes(types: unknown): AIInsightType[] {
  if (!Array.isArray(types)) {
    return [];
  }

  return types.filter((type): type is AIInsightType =>
    typeof type === "string" &&
    [
      "night_spending",
      "weekend_spending",
      "mood_category_correlation",
      "small_frequent_transactions",
      "month_over_month_category_change",
    ].includes(type),
  );
}

function parseInsightResponse(raw: string) {
  let draft: {
    headline?: unknown;
    reflection?: unknown;
    action?: unknown;
    types?: unknown;
  };

  try {
    draft = JSON.parse(stripMarkdownFence(raw)) as typeof draft;
  } catch {
    throw new AIError("PARSE_FAILED");
  }

  const headline =
    typeof draft.headline === "string" ? draft.headline.trim().slice(0, 80) : "";
  const reflection =
    typeof draft.reflection === "string"
      ? draft.reflection.trim().slice(0, 280)
      : "";
  const action =
    typeof draft.action === "string" ? draft.action.trim().slice(0, 160) : "";
  const types = normalizeTypes(draft.types).slice(0, 3);

  if (!headline || !reflection || !action) {
    throw new AIError("VALIDATION_FAILED");
  }

  return {
    headline,
    reflection,
    action,
    types,
  } satisfies AIInsightContent;
}

async function buildAggregate(month: string, transactions: Transaction[]) {
  const previousMonthTransactions = await transactionsRepo.listByMonth(
    getPreviousMonth(month),
  );

  return buildInsightAggregate({
    month,
    transactions,
    previousMonthTransactions,
  });
}

function canGenerateInsight(aggregate: AggregatedMonthlyInsightData) {
  return (
    aggregate.transactionCount >= AI_INSIGHT_MIN_TRANSACTIONS &&
    aggregate.signals.length > 0
  );
}

export async function prepareInsightGeneration(params: {
  month: string;
  transactions: Transaction[];
  aiEnabled: boolean;
}): Promise<InsightPreparationResult> {
  const { month, transactions, aiEnabled } = params;
  const usage = await aiUsageRepo.get(month);

  if (!aiEnabled) {
    return {
      status: "disabled",
      message: getInsightStateMessage("disabled"),
      usageCount: usage.aiInsightCount,
      limit: AI_INSIGHT_MONTHLY_LIMIT,
    };
  }

  const aggregate = await buildAggregate(month, transactions);
  const cached = await aiInsightsRepo.get(month);

  if (cached && cached.aggregateSignature === aggregate.signature) {
    return {
      status: "success",
      insight: mapRecordToContent(cached),
      usageCount: usage.aiInsightCount,
      limit: AI_INSIGHT_MONTHLY_LIMIT,
      cached: true,
    };
  }

  if (!canGenerateInsight(aggregate)) {
    return {
      status: "empty",
      message: getInsightStateMessage("empty"),
      usageCount: usage.aiInsightCount,
      limit: AI_INSIGHT_MONTHLY_LIMIT,
    };
  }

  if (usage.aiInsightCount >= AI_INSIGHT_MONTHLY_LIMIT) {
    return {
      status: "limit",
      message: getInsightStateMessage("limit"),
      usageCount: usage.aiInsightCount,
      limit: AI_INSIGHT_MONTHLY_LIMIT,
    };
  }

  return {
    status: "idle",
    aggregate,
    usageCount: usage.aiInsightCount,
    limit: AI_INSIGHT_MONTHLY_LIMIT,
  } satisfies InsightPreparationIdleResult;
}

export async function generateInsightForMonth(
  preparation: InsightPreparationIdleResult,
): Promise<InsightSuccessResult | Exclude<InsightPreparationResult, InsightPreparationIdleResult | InsightSuccessResult>> {
  try {
    if (preparation.usageCount >= preparation.limit) {
      return {
        status: "limit",
        message: getInsightStateMessage("limit"),
        usageCount: preparation.usageCount,
        limit: preparation.limit,
      };
    }

    const raw = await geminiGenerate({
      prompt: buildInsightPrompt(preparation.aggregate),
      timeoutMs: 9000,
    });
    const parsedInsight = parseInsightResponse(raw);
    const insight = {
      ...parsedInsight,
      types:
        parsedInsight.types.length > 0
          ? parsedInsight.types
          : preparation.aggregate.signals.slice(0, 2).map((signal) => signal.type),
    };
    const saved = await aiInsightsRepo.upsert({
      month: preparation.aggregate.month,
      headline: insight.headline,
      reflection: insight.reflection,
      action: insight.action,
      types: insight.types,
      aggregateSignature: preparation.aggregate.signature,
    });
    const nextUsage = await aiUsageRepo.incrementInsight(preparation.aggregate.month);

    return {
      status: "success",
      insight: mapRecordToContent(saved),
      usageCount: nextUsage.aiInsightCount,
      limit: preparation.limit,
      cached: false,
    };
  } catch (error) {
    const message =
      error instanceof AIError
        ? getInsightStateMessage("error")
        : "Refleksi AI belum jadi sekarang. Coba lagi sebentar lagi ya.";

    return {
      status: "error",
      message,
      usageCount: preparation.usageCount,
      limit: preparation.limit,
    };
  }
}
