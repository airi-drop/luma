import { AI_INSIGHT_TYPES } from "./types";
import type { AggregatedMonthlyInsightData } from "./types";

export function buildInsightPrompt(aggregate: AggregatedMonthlyInsightData) {
  const payload = {
    month: aggregate.month,
    monthLabel: aggregate.monthLabel,
    transactionCount: aggregate.transactionCount,
    activeDays: aggregate.activeDays,
    weekend: aggregate.weekend,
    night: aggregate.night,
    moods: aggregate.moods,
    smallTransactions: aggregate.smallTransactions,
    monthOverMonthChanges: aggregate.monthOverMonthChanges.slice(0, 3),
    topSignals: aggregate.signals.slice(0, 3),
  };

  return [
    "You are Luma's monthly behavioral insight writer.",
    "Write in soft, casual, supportive Indonesian.",
    "Do not sound like a financial advisor. Do not judge the user.",
    "Do not repeat obvious chart stats such as top category, biggest transaction, or total spending.",
    "Use only the aggregate data provided below. Do not invent facts.",
    "Night data comes from transaction createdAt time, so phrase it as a soft signal, not a certainty.",
    `Only use these insight types if relevant: ${AI_INSIGHT_TYPES.join(", ")}.`,
    "Return JSON only with this shape:",
    '{ "headline": string, "reflection": string, "action": string, "types": string[] }',
    "Rules:",
    "- Headline max 80 characters.",
    "- Reflection 1-2 short sentences.",
    "- Action 1 short supportive sentence.",
    "- Mention at most 2 behavioral patterns.",
    "- Prefer patterns from topSignals.",
    "- If a signal is soft, use careful phrasing like 'kelihatan' or 'sering tercatat'.",
    `Aggregate data: ${JSON.stringify(payload)}`,
  ].join("\n");
}
