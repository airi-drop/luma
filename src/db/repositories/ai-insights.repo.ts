import { getLumaDb } from "../client";
import { nowIso } from "../../lib/date";
import type { AIInsightRecord } from "../../types";

interface UpsertAIInsightInput {
  month: string;
  headline: string;
  reflection: string;
  action: string;
  types: string[];
  aggregateSignature: string;
  generatedAt?: string;
}

export const aiInsightsRepo = {
  async get(month: string) {
    const database = await getLumaDb();
    return database.get("aiInsights", month);
  },

  async upsert(input: UpsertAIInsightInput) {
    const database = await getLumaDb();
    const current = await database.get("aiInsights", input.month);
    const timestamp = nowIso();
    const next: AIInsightRecord = {
      id: input.month,
      month: input.month,
      headline: input.headline.trim(),
      reflection: input.reflection.trim(),
      action: input.action.trim(),
      types: [...input.types],
      aggregateSignature: input.aggregateSignature,
      generatedAt: input.generatedAt ?? current?.generatedAt ?? timestamp,
      updatedAt: timestamp,
    };

    await database.put("aiInsights", next);
    return next;
  },
};
