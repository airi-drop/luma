import type {
  BudgetUsageSummary,
  CategoryBudget,
  CategoryTotal,
  CategoryType,
  MonthlyBudget,
  SavingGoal,
  SavingGoalProgress,
  Transaction,
} from "../types";
import { getCurrentDate } from "./date";

function clampPercentage(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  return value;
}

export function getMonthlyTotal(transactions: Transaction[]) {
  return transactions.reduce((sum, transaction) => sum + transaction.nominal, 0);
}

export function getTodayTotal(
  transactions: Transaction[],
  today = getCurrentDate(),
) {
  return transactions
    .filter((transaction) => transaction.date === today)
    .reduce((sum, transaction) => sum + transaction.nominal, 0);
}

export function getCategoryTotals(
  transactions: Transaction[],
): CategoryTotal[] {
  const totals = transactions.reduce<Record<CategoryType, number>>(
    (accumulator, transaction) => {
      accumulator[transaction.category] =
        (accumulator[transaction.category] ?? 0) + transaction.nominal;

      return accumulator;
    },
    {} as Record<CategoryType, number>,
  );

  return Object.entries(totals)
    .map(([category, total]) => ({
      category: category as CategoryType,
      total,
    }))
    .sort((left, right) => right.total - left.total);
}

export function getTopCategory(transactions: Transaction[]) {
  return getCategoryTotals(transactions)[0] ?? null;
}

export function getBudgetUsage(
  monthlyBudget: MonthlyBudget | null,
  transactions: Transaction[],
): BudgetUsageSummary | null {
  if (!monthlyBudget) {
    return null;
  }

  const used = getMonthlyTotal(transactions);
  const remaining = monthlyBudget.totalBudget - used;
  const percentage = clampPercentage(
    monthlyBudget.totalBudget > 0 ? used / monthlyBudget.totalBudget : 0,
  );

  return {
    limit: monthlyBudget.totalBudget,
    used,
    remaining,
    percentage,
  };
}

export function getBudgetStatus(percentage: number) {
  if (percentage >= 1) {
    return {
      tone: "panic",
      label: "Budgetnya sudah lewat sedikit. Pelan-pelan kita rapihin lagi ya.",
    } as const;
  }

  if (percentage >= 0.8) {
    return {
      tone: "worried",
      label: "Budget mulai tipis. Boleh cek lagi sebelum belanja berikutnya.",
    } as const;
  }

  if (percentage >= 0.5) {
    return {
      tone: "chill",
      label: "Masih aman, tapi sudah mulai kepakai lumayan.",
    } as const;
  }

  return {
    tone: "happy",
    label: "Dompetmu masih aman hari ini.",
  } as const;
}

export function getCategoryBudgetUsage(
  categoryBudget: CategoryBudget,
  transactions: Transaction[],
): BudgetUsageSummary {
  const used = transactions
    .filter((transaction) => transaction.category === categoryBudget.category)
    .reduce((sum, transaction) => sum + transaction.nominal, 0);
  const remaining = categoryBudget.limit - used;
  const percentage = clampPercentage(
    categoryBudget.limit > 0 ? used / categoryBudget.limit : 0,
  );

  return {
    limit: categoryBudget.limit,
    used,
    remaining,
    percentage,
  };
}

export function getSavingGoalProgress(goal: SavingGoal): SavingGoalProgress {
  const savedAmount = goal.currentAmount;
  const targetAmount = goal.targetAmount;
  const remainingAmount = Math.max(targetAmount - savedAmount, 0);
  const percentage = clampPercentage(
    targetAmount > 0 ? savedAmount / targetAmount : 0,
  );

  return {
    savedAmount,
    targetAmount,
    remainingAmount,
    percentage,
    isCompleted: savedAmount >= targetAmount,
  };
}
