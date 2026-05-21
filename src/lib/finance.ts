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
  today = new Date().toISOString().slice(0, 10),
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
