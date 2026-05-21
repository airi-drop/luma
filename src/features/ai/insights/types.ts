import type { CategoryType, MoodType } from "../../../types";

export const AI_INSIGHT_TYPES = [
  "night_spending",
  "weekend_spending",
  "mood_category_correlation",
  "small_frequent_transactions",
  "month_over_month_category_change",
] as const;

export type AIInsightType = (typeof AI_INSIGHT_TYPES)[number];

export type AIInsightCardState =
  | "idle"
  | "loading"
  | "success"
  | "empty"
  | "limit"
  | "error"
  | "disabled";

export interface InsightSignal {
  type: AIInsightType;
  score: number;
  summary: string;
  metrics: Record<string, number | string>;
  tone: "direct" | "soft";
}

export interface InsightCategoryChange {
  category: CategoryType;
  currentTotal: number;
  previousTotal: number;
  deltaAmount: number;
  deltaPercentage: number | null;
}

export interface AggregatedMonthlyInsightData {
  month: string;
  monthLabel: string;
  transactionCount: number;
  totalSpending: number;
  activeDays: number;
  signature: string;
  categories: Array<{
    category: CategoryType;
    total: number;
    share: number;
  }>;
  weekend: {
    transactionCount: number;
    total: number;
    shareOfTransactions: number;
    shareOfSpending: number;
  };
  night: {
    transactionCount: number;
    total: number;
    shareOfTransactions: number;
    shareOfSpending: number;
    source: "createdAt";
  };
  moods: Array<{
    mood: MoodType;
    transactionCount: number;
    total: number;
    strongestCategory: CategoryType;
    strongestCategoryCount: number;
    strongestCategoryTotal: number;
    strongestCategoryShare: number;
  }>;
  smallTransactions: {
    threshold: number;
    transactionCount: number;
    total: number;
    shareOfTransactions: number;
    shareOfSpending: number;
    averagePerActiveDay: number;
  };
  monthOverMonthChanges: InsightCategoryChange[];
  signals: InsightSignal[];
}

export interface AIInsightContent {
  headline: string;
  reflection: string;
  action: string;
  types: AIInsightType[];
}

export interface InsightPreparationIdleResult {
  status: "idle";
  aggregate: AggregatedMonthlyInsightData;
  usageCount: number;
  limit: number;
}

export interface InsightSuccessResult {
  status: "success";
  insight: AIInsightContent;
  usageCount: number;
  limit: number;
  cached: boolean;
}

export interface InsightMessageResult {
  status: "empty" | "limit" | "disabled" | "error";
  message: string;
  usageCount: number;
  limit: number;
}

export type InsightPreparationResult =
  | InsightPreparationIdleResult
  | InsightSuccessResult
  | InsightMessageResult;
