import {
  ACCOUNT_TYPES,
  CATEGORY_TYPES,
  type AccountType,
  type CategoryType,
} from "../../types";
import { geminiGenerate } from "./geminiClient";
import { buildParserPrompt } from "./prompt";
import type { ParseResult, ParserDraft } from "./types";
import { AIError } from "./types";

const accountSynonyms: Record<AccountType, string[]> = {
  Cash: ["cash", "tunai", "dompet"],
  "E-wallet": ["e-wallet", "ewallet", "gopay", "ovo", "dana", "shopeepay", "linkaja"],
  BNI: ["bni"],
  BCA: ["bca"],
  Mandiri: ["mandiri", "livin"],
  Other: ["other", "lain", "lainnya"],
};

const categorySynonyms: Record<CategoryType, string[]> = {
  Food: ["food", "makan", "makanan", "bakso", "kopi", "gofood", "grabfood", "jajan"],
  Transport: ["transport", "transportasi", "bensin", "tol", "grab", "gojek", "kereta", "parkir"],
  Entertainment: ["entertainment", "hiburan", "concert", "konser", "album", "spotify", "netflix", "game", "bioskop"],
  Shopping: ["shopping", "belanja", "skincare", "baju", "pakaian", "sepatu", "marketplace"],
  Health: ["health", "kesehatan", "obat", "vitamin", "klinik", "dokter"],
  Giving: ["giving", "donasi", "sedekah", "zakat", "hadiah", "gift"],
  Saving: ["saving", "tabungan", "nabung", "menabung", "save"],
  Other: ["other", "lain", "lainnya"],
};

function stripMarkdownFence(input: string) {
  const match = input.match(/^\s*```(?:json)?\s*\n([\s\S]*?)\n```\s*$/i);
  return match ? match[1].trim() : input.trim();
}

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

export function normalizeAmount(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.round(value);
  }

  if (typeof value !== "string") {
    throw new AIError("VALIDATION_FAILED");
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/^rp\s*/i, "")
    .replace(/\s+/g, "");

  const suffixed = normalized.match(/^(\d+(?:[.,]\d+)?)\s*(rb|k|jt)$/i);

  if (suffixed) {
    const amount = Number(suffixed[1].replace(",", "."));
    const multiplier =
      suffixed[2].toLowerCase() === "jt"
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

export async function parseUserText(text: string): Promise<ParseResult> {
  const trimmed = text.trim();

  if (!trimmed) {
    throw new AIError("EMPTY_INPUT");
  }

  const raw = await geminiGenerate({
    prompt: buildParserPrompt(trimmed),
    timeoutMs: 8000,
  });

  let draft: ParserDraft;

  try {
    draft = JSON.parse(stripMarkdownFence(raw)) as ParserDraft;
  } catch {
    throw new AIError("PARSE_FAILED");
  }

  const detail =
    typeof draft.detail === "string"
      ? toTitleCase(draft.detail).slice(0, 120)
      : "";

  if (!detail) {
    throw new AIError("VALIDATION_FAILED");
  }

  return {
    detail,
    nominal: normalizeAmount(draft.nominal),
    category: snapEnum(draft.category, CATEGORY_TYPES, categorySynonyms),
    account: snapEnum(draft.account, ACCOUNT_TYPES, accountSynonyms),
    date: normalizeDate(draft.date),
    confidence: clampConfidence(draft.confidence),
  };
}
