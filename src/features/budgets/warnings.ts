import { getCategoryEmoji, getCategoryLabel } from "./meta";
import type { CategoryType } from "../../types";

interface BudgetUsageLike {
  budget: {
    category: CategoryType;
  };
  usage: {
    percentage: number;
  };
}

export interface SoftWarning {
  category: CategoryType;
  message: string;
  percentage: number;
}

function createWarning(category: CategoryType, percentage: number): SoftWarning | null {
  if (percentage < 0.8) {
    return null;
  }

  const label = getCategoryLabel(category);
  const emoji = getCategoryEmoji(category);

  return {
    category,
    percentage,
    message:
      percentage >= 1
        ? `Budget ${label} sudah penuh ${emoji}`
        : `Budget ${label} hampir penuh ${emoji}`,
  };
}

export function generateSoftWarnings(items: BudgetUsageLike[]) {
  return items
    .map((item) => createWarning(item.budget.category, item.usage.percentage))
    .filter((item): item is SoftWarning => item !== null)
    .sort((left, right) => right.percentage - left.percentage);
}

export function getHomeBudgetWarning(items: BudgetUsageLike[]) {
  return generateSoftWarnings(items)[0] ?? null;
}
