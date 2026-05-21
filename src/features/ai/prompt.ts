import { ACCOUNT_TYPES, CATEGORY_TYPES } from "../../types";

export function buildParserPrompt(text: string) {
  return [
    "You are Luma's transaction parser.",
    "Convert this Indonesian natural language sentence to a single JSON object only.",
    "No markdown. No code fences. No prose.",
    "Use IDR and return nominal as a positive integer with no thousand separators.",
    'Normalize slang amounts: "15rb" -> 15000, "15k" -> 15000, "250k" -> 250000, "1.5jt" -> 1500000.',
    `Use the closest category from: ${CATEGORY_TYPES.join(", ")}.`,
    `Use the closest account from: ${ACCOUNT_TYPES.join(", ")}.`,
    "Return date only if an explicit calendar date is present in the text.",
    "If date is available, format it as YYYY-MM-DD. If not, use null.",
    "Do not invent unclear fields. Use Other and lower confidence when needed.",
    "Return JSON shape:",
    '{ "detail": string, "nominal": number, "category": string, "account": string, "date": string | null, "confidence": number }',
    `Input: ${text}`,
  ].join("\n");
}
