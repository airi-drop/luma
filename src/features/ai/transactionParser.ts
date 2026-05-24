import {
  ACCOUNT_TYPES,
  CATEGORY_TYPES,
  type AccountType,
  type CategoryType,
} from "../../types";
import { getCurrentDate } from "../../lib/date";
import type { ParseResult } from "./types";
import { AIError } from "./types";

const accountSynonyms: Record<AccountType, string[]> = {
  Cash: ["cash", "tunai", "dompet"],
  "E-wallet": ["e-wallet", "ewallet", "gopay", "ovo", "dana", "shopeepay", "linkaja"],
  BNI: ["bni"],
  BCA: ["bca"],
  Mandiri: ["mandiri", "livin"],
  Other: ["other", "lain", "lainnya"],
};

type HeuristicCategory = CategoryType | "Bills";

interface CategoryKeywordRule {
  category: HeuristicCategory;
  keyword: string;
  weight: number;
}

const categorySynonyms: Record<CategoryType, string[]> = {
  Food: [
    "food",
    "makan",
    "makanan",
    "minum",
    "jajan",
    "rujak",
    "bakso",
    "mie",
    "nasi",
    "ayam",
    "kopi",
    "es",
    "teh",
    "seblak",
    "cilok",
    "gorengan",
    "warung",
    "restoran",
    "cafe",
    "gofood",
    "grabfood",
    "shopeefood",
    "martabak",
    "sate",
    "soto",
    "bubur",
    "roti",
    "snack",
    "cemilan",
    "sempol",
  ],
  Transport: [
    "transport",
    "transportasi",
    "bensin",
    "pertalite",
    "pertamax",
    "solar",
    "parkir",
    "tol",
    "gojek",
    "grab",
    "maxim",
    "ojol",
    "taxi",
    "kereta",
    "bus",
    "angkot",
    "mrt",
    "lrt",
    "mobil",
  ],
  Entertainment: [
    "entertainment",
    "hiburan",
    "netflix",
    "spotify",
    "youtube",
    "game",
    "steam",
    "bioskop",
    "karaoke",
    "concert",
    "konser",
    "album",
    "photocard",
    "main",
  ],
  Shopping: [
    "shopping",
    "belanja",
    "beli",
    "shopee",
    "tokopedia",
    "lazada",
    "tiktok shop",
    "indomaret",
    "alfamart",
    "baju",
    "celana",
    "sepatu",
    "tas",
    "skincare",
    "sabun",
    "sampo",
    "deterjen",
    "marketplace",
    "pakaian",
  ],
  Health: [
    "health",
    "kesehatan",
    "obat",
    "dokter",
    "klinik",
    "rumah sakit",
    "vitamin",
    "apotek",
    "bidan",
  ],
  Giving: ["giving", "donasi", "sedekah", "zakat", "hadiah", "gift"],
  Saving: ["saving", "tabung", "nabung", "menabung", "setoran target", "target", "simpanan", "save"],
  Other: ["other", "lain", "lainnya"],
};

const slangAmountAliases: Array<{ pattern: RegExp; amount: number }> = [
  { pattern: /\bgoceng\b/i, amount: 5_000 },
  { pattern: /\bceban\b/i, amount: 10_000 },
  { pattern: /\bgopek\b/i, amount: 500 },
];

const categoryKeywordRules: CategoryKeywordRule[] = [
  { category: "Food", keyword: "gofood", weight: 10 },
  { category: "Food", keyword: "grabfood", weight: 10 },
  { category: "Food", keyword: "shopeefood", weight: 10 },
  { category: "Food", keyword: "rujak", weight: 9 },
  { category: "Food", keyword: "bakso", weight: 9 },
  { category: "Food", keyword: "martabak", weight: 9 },
  { category: "Food", keyword: "sate", weight: 9 },
  { category: "Food", keyword: "soto", weight: 9 },
  { category: "Food", keyword: "bubur", weight: 8 },
  { category: "Food", keyword: "seblak", weight: 8 },
  { category: "Food", keyword: "cilok", weight: 8 },
  { category: "Food", keyword: "gorengan", weight: 8 },
  { category: "Food", keyword: "warung", weight: 7 },
  { category: "Food", keyword: "restoran", weight: 7 },
  { category: "Food", keyword: "cafe", weight: 7 },
  { category: "Food", keyword: "kopi", weight: 6 },
  { category: "Food", keyword: "makan", weight: 6 },
  { category: "Food", keyword: "minum", weight: 6 },
  { category: "Food", keyword: "jajan", weight: 6 },
  { category: "Food", keyword: "mie", weight: 5 },
  { category: "Food", keyword: "nasi", weight: 5 },
  { category: "Food", keyword: "ayam", weight: 5 },
  { category: "Food", keyword: "teh", weight: 4 },
  { category: "Food", keyword: "es", weight: 4 },
  { category: "Food", keyword: "roti", weight: 4 },
  { category: "Food", keyword: "snack", weight: 4 },
  { category: "Food", keyword: "cemilan", weight: 4 },
  { category: "Food", keyword: "sempol", weight: 8 },
  { category: "Transport", keyword: "pertalite", weight: 10 },
  { category: "Transport", keyword: "pertamax", weight: 10 },
  { category: "Transport", keyword: "bensin", weight: 9 },
  { category: "Transport", keyword: "solar", weight: 9 },
  { category: "Transport", keyword: "parkir", weight: 8 },
  { category: "Transport", keyword: "tol", weight: 8 },
  { category: "Transport", keyword: "gojek", weight: 7 },
  { category: "Transport", keyword: "grab", weight: 7 },
  { category: "Transport", keyword: "maxim", weight: 7 },
  { category: "Transport", keyword: "ojol", weight: 7 },
  { category: "Transport", keyword: "taxi", weight: 7 },
  { category: "Transport", keyword: "kereta", weight: 7 },
  { category: "Transport", keyword: "bus", weight: 6 },
  { category: "Transport", keyword: "angkot", weight: 6 },
  { category: "Transport", keyword: "mrt", weight: 6 },
  { category: "Transport", keyword: "lrt", weight: 6 },
  { category: "Transport", keyword: "mobil", weight: 8 },
  { category: "Shopping", keyword: "tiktok shop", weight: 10 },
  { category: "Shopping", keyword: "tokopedia", weight: 9 },
  { category: "Shopping", keyword: "lazada", weight: 9 },
  { category: "Shopping", keyword: "shopee", weight: 8 },
  { category: "Shopping", keyword: "indomaret", weight: 8 },
  { category: "Shopping", keyword: "alfamart", weight: 8 },
  { category: "Shopping", keyword: "skincare", weight: 8 },
  { category: "Shopping", keyword: "deterjen", weight: 8 },
  { category: "Shopping", keyword: "sabun", weight: 7 },
  { category: "Shopping", keyword: "sampo", weight: 7 },
  { category: "Shopping", keyword: "baju", weight: 7 },
  { category: "Shopping", keyword: "celana", weight: 7 },
  { category: "Shopping", keyword: "sepatu", weight: 7 },
  { category: "Shopping", keyword: "tas", weight: 7 },
  { category: "Shopping", keyword: "belanja", weight: 6 },
  { category: "Shopping", keyword: "beli", weight: 2 },
  { category: "Entertainment", keyword: "spotify", weight: 10 },
  { category: "Entertainment", keyword: "netflix", weight: 10 },
  { category: "Entertainment", keyword: "youtube", weight: 9 },
  { category: "Entertainment", keyword: "steam", weight: 9 },
  { category: "Entertainment", keyword: "bioskop", weight: 9 },
  { category: "Entertainment", keyword: "karaoke", weight: 9 },
  { category: "Entertainment", keyword: "konser", weight: 9 },
  { category: "Entertainment", keyword: "concert", weight: 9 },
  { category: "Entertainment", keyword: "album", weight: 8 },
  { category: "Entertainment", keyword: "photocard", weight: 8 },
  { category: "Entertainment", keyword: "game", weight: 7 },
  { category: "Entertainment", keyword: "main", weight: 3 },
  { category: "Health", keyword: "rumah sakit", weight: 10 },
  { category: "Health", keyword: "apotek", weight: 9 },
  { category: "Health", keyword: "dokter", weight: 9 },
  { category: "Health", keyword: "klinik", weight: 9 },
  { category: "Health", keyword: "obat", weight: 8 },
  { category: "Health", keyword: "vitamin", weight: 7 },
  { category: "Health", keyword: "bidan", weight: 7 },
  { category: "Saving", keyword: "setoran target", weight: 10 },
  { category: "Saving", keyword: "target", weight: 8 },
  { category: "Saving", keyword: "nabung", weight: 8 },
  { category: "Saving", keyword: "tabung", weight: 8 },
  { category: "Saving", keyword: "simpanan", weight: 8 },
  { category: "Bills", keyword: "paket data", weight: 10 },
  { category: "Bills", keyword: "token listrik", weight: 10 },
  { category: "Bills", keyword: "rumah sakit", weight: 0 },
  { category: "Bills", keyword: "internet", weight: 9 },
  { category: "Bills", keyword: "wifi", weight: 9 },
  { category: "Bills", keyword: "listrik", weight: 9 },
  { category: "Bills", keyword: "pulsa", weight: 8 },
  { category: "Bills", keyword: "pdam", weight: 8 },
  { category: "Bills", keyword: "bpjs", weight: 8 },
  { category: "Bills", keyword: "cicilan", weight: 8 },
  { category: "Bills", keyword: "kontrakan", weight: 8 },
  { category: "Bills", keyword: "langganan", weight: 8 },
  { category: "Bills", keyword: "sewa", weight: 7 },
  { category: "Bills", keyword: "air", weight: 5 },
];

const amountPattern = /\b(?:rp\s*)?\d+(?:[.,]\d+)?\s*(?:rb|ribu|k|jt|juta)?\b/i;
const amountPatternGlobal =
  /\b(?:rp\s*)?\d+(?:[.,]\d+)?\s*(?:rb|ribu|k|jt|juta)?\b/gi;
const punctuationPattern = /[^\p{L}\p{N}\s]+/gu;
const leadingDetailNoisePattern =
  /^(?:beli|belanja|bayar|isi|top\s*up|topup|pakai|via|dari|untuk|setor)\s+/i;

function clampConfidence(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0.5;
  }

  if (value < 0) {
    return 0;
  }

  if (value > 1) {
    return 1;
  }

  return value;
}

function toTitleCase(text: string) {
  return text
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeForKeywordMatch(text: string) {
  return ` ${text
    .toLowerCase()
    .replace(punctuationPattern, " ")
    .replace(/\s+/g, " ")
    .trim()} `;
}

function includesWholeKeyword(text: string, keyword: string) {
  return text.includes(` ${keyword.toLowerCase()} `);
}

export function normalizeAmount(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.round(value);
  }

  if (typeof value !== "string") {
    throw new AIError("VALIDATION_FAILED");
  }

  const matchedSlangAmount = slangAmountAliases.find(({ pattern }) =>
    pattern.test(value),
  );

  if (matchedSlangAmount) {
    return matchedSlangAmount.amount;
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/^rp\s*/i, "")
    .replace(/\s+/g, "");

  const suffixed = normalized.match(/^(\d+(?:[.,]\d+)?)(rb|ribu|k|jt|juta)$/i);

  if (suffixed) {
    const amount = Number(suffixed[1].replace(",", "."));
    const multiplier =
      suffixed[2].toLowerCase() === "jt" ||
      suffixed[2].toLowerCase() === "juta"
        ? 1_000_000
        : 1_000;

    if (Number.isFinite(amount) && amount > 0) {
      return Math.round(amount * multiplier);
    }
  }

  const digitsOnly = normalized.replace(/[^\d]/g, "");
  const numeric = Number(digitsOnly);

  if (Number.isFinite(numeric) && numeric > 0) {
    return numeric;
  }

  throw new AIError("VALIDATION_FAILED");
}

function snapEnum<TValue extends string>(
  value: unknown,
  options: readonly TValue[],
  synonyms: Record<TValue, string[]>,
) {
  if (typeof value !== "string" || !value.trim()) {
    return "Other" as TValue;
  }

  const normalized = value.trim().toLowerCase();
  const exact = options.find((option) => option.toLowerCase() === normalized);

  if (exact) {
    return exact;
  }

  for (const option of options) {
    if (synonyms[option].some((keyword) => normalized.includes(keyword))) {
      return option;
    }
  }

  return "Other" as TValue;
}

function resolveHeuristicCategory(text: string): CategoryType {
  const normalized = normalizeForKeywordMatch(text);
  const scores = new Map<HeuristicCategory, number>();
  const strongestKeywordWeight = new Map<HeuristicCategory, number>();

  for (const rule of categoryKeywordRules) {
    if (!includesWholeKeyword(normalized, rule.keyword)) {
      continue;
    }

    scores.set(rule.category, (scores.get(rule.category) ?? 0) + rule.weight);
    strongestKeywordWeight.set(
      rule.category,
      Math.max(strongestKeywordWeight.get(rule.category) ?? 0, rule.weight),
    );
  }

  let winner: HeuristicCategory | null = null;
  let winnerScore = -1;
  let winnerStrongest = -1;

  for (const [category, score] of scores) {
    const strongest = strongestKeywordWeight.get(category) ?? 0;

    if (
      score > winnerScore ||
      (score === winnerScore && strongest > winnerStrongest)
    ) {
      winner = category;
      winnerScore = score;
      winnerStrongest = strongest;
    }
  }

  if (winner === "Bills") {
    // Schema kategori saat ini belum punya Bills, jadi tetap diarahkan ke
    // kategori yang tersedia tanpa mengubah model data.
    return "Other";
  }

  if (winner) {
    return winner;
  }

  return snapEnum(text, CATEGORY_TYPES, categorySynonyms);
}

function normalizeDate(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : undefined;
}

function extractExplicitDate(text: string) {
  const isoMatch = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);

  if (isoMatch) {
    return normalizeDate(isoMatch[1]);
  }

  const localMatch = text.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/);

  if (!localMatch) {
    return undefined;
  }

  const day = Number(localMatch[1]);
  const month = Number(localMatch[2]);
  const year = Number(localMatch[3].length === 2 ? `20${localMatch[3]}` : localMatch[3]);

  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) {
    return undefined;
  }

  return normalizeDate(
    `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`,
  );
}

function findAmountToken(text: string) {
  const numericMatch = text.match(amountPattern)?.[0];

  if (numericMatch) {
    return numericMatch;
  }

  return slangAmountAliases.find(({ pattern }) => pattern.test(text))?.pattern.exec(text)?.[0] ?? null;
}

function buildFallbackDetail(text: string) {
  const cleanupPatterns = [
    amountPatternGlobal,
    /\b(?:cash|tunai|dompet|e-wallet|ewallet|gopay|ovo|dana|shopeepay|linkaja|bni|bca|mandiri|livin)\b/gi,
    /\b(?:pakai|via|dari)\b/gi,
    /\b\d{4}-\d{2}-\d{2}\b/g,
    /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g,
  ];

  let candidate = text;

  for (const pattern of cleanupPatterns) {
    candidate = candidate.replace(pattern, " ");
  }

  candidate = candidate
    .replace(/[.,;:]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (candidate.split(" ").length > 1) {
    candidate = candidate.replace(leadingDetailNoisePattern, "").trim();
  }

  return candidate || text.trim();
}

function parseWithHeuristics(text: string): ParseResult {
  const amountToken = findAmountToken(text);

  if (!amountToken) {
    throw new AIError("VALIDATION_FAILED");
  }

  const account = snapEnum(text, ACCOUNT_TYPES, accountSynonyms);
  const category = resolveHeuristicCategory(text);
  const detail = toTitleCase(buildFallbackDetail(text)).slice(0, 120);

  if (!detail) {
    throw new AIError("VALIDATION_FAILED");
  }

  let confidence = 0.56;

  if (account !== "Other") {
    confidence += 0.12;
  }

  if (category !== "Other") {
    confidence += 0.12;
  }

  const date = extractExplicitDate(text);

  if (date === getCurrentDate()) {
    confidence -= 0.04;
  }

  return {
    detail,
    nominal: normalizeAmount(amountToken),
    category,
    account,
    date,
    confidence: clampConfidence(confidence),
  };
}

export async function parseUserText(text: string): Promise<ParseResult> {
  const trimmed = text.trim();

  if (!trimmed) {
    throw new AIError("EMPTY_INPUT");
  }

  return parseWithHeuristics(trimmed);
}
