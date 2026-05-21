import { getLumaDb } from "../client";
import { nowIso } from "../../lib/date";
import type { AIUsage } from "../../types";

function createEmptyUsage(month: string): AIUsage {
  return {
    id: month,
    aiInputCount: 0,
    aiInsightCount: 0,
    updatedAt: nowIso(),
  };
}

async function getCurrentUsage(month: string) {
  const database = await getLumaDb();
  const usage = await database.get("aiUsage", month);

  return {
    database,
    usage: usage ?? createEmptyUsage(month),
  };
}

export const aiUsageRepo = {
  async get(month: string) {
    const database = await getLumaDb();
    const usage = await database.get("aiUsage", month);
    return usage ?? createEmptyUsage(month);
  },

  async incrementInput(month: string, by = 1) {
    const { database, usage } = await getCurrentUsage(month);
    const next: AIUsage = {
      ...usage,
      aiInputCount: usage.aiInputCount + by,
      updatedAt: nowIso(),
    };

    await database.put("aiUsage", next);
    return next;
  },

  async incrementInsight(month: string, by = 1) {
    const { database, usage } = await getCurrentUsage(month);
    const next: AIUsage = {
      ...usage,
      aiInsightCount: usage.aiInsightCount + by,
      updatedAt: nowIso(),
    };

    await database.put("aiUsage", next);
    return next;
  },
};
