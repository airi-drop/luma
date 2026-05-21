import type { CategoryType } from "../../types";

export const CATEGORY_LABELS: Record<CategoryType, string> = {
  Food: "makan",
  Transport: "transport",
  Entertainment: "hiburan",
  Shopping: "belanja",
  Health: "kesehatan",
  Giving: "berbagi",
  Saving: "tabungan",
  Other: "lainnya",
};

export const CATEGORY_EMOJIS: Record<CategoryType, string> = {
  Food: "🍜",
  Transport: "🚌",
  Entertainment: "🎬",
  Shopping: "🛍️",
  Health: "💊",
  Giving: "🎁",
  Saving: "💰",
  Other: "📝",
};

export function getCategoryLabel(category: CategoryType) {
  return CATEGORY_LABELS[category];
}

export function getCategoryEmoji(category: CategoryType) {
  return CATEGORY_EMOJIS[category];
}
