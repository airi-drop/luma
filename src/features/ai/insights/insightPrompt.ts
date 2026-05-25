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

  const nightSourceInstruction =
    aggregate.night.source === "none"
      ? "Hour-of-day source is unavailable. Do not make any hour-based behavioral claim, including night spending."
      : aggregate.night.source === "transaction-time"
        ? "Hour-of-day source comes from an explicit transaction time field. Only mention night behavior if the provided night aggregate supports it."
        : "Hour-of-day source comes from an explicit transaction date-time field. Only mention night behavior if the provided night aggregate supports it.";

  return [
    "You are Luma's monthly behavioral insight writer.",
    "Write in soft, casual, supportive Indonesian.",
    "Do not sound like a financial advisor. Do not judge the user.",
    "Do not repeat obvious chart stats such as top category, biggest transaction, or total spending.",
    "Use only the aggregate data provided below. Do not invent facts.",
    nightSourceInstruction,
    "Never say the user spends more at night unless night.source is not 'none' and the aggregate clearly supports that pattern.",
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
