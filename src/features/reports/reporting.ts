import { formatMonthLabel } from "../../lib/date";
import {
  getBudgetUsage,
  getCategoryTotals,
  getSavingGoalProgress,
  getTopCategory,
} from "../../lib/finance";
import type {
  CategoryBudget,
  CategoryTotal,
  MonthlyBudget,
  SavingGoal,
  Transaction,
} from "../../types";

const CATEGORY_COLOR_MAP: Record<string, string> = {
  Food: "#E8A857",
  Transport: "#89B8E8",
  Entertainment: "#B69AE8",
  Shopping: "#E89A9A",
  Health: "#8FB896",
  Giving: "#F4D6A0",
  Saving: "#7CC58C",
  Other: "#9C8D7B",
};

export interface ReportCategoryBreakdownItem extends CategoryTotal {
  color: string;
  share: number;
}

export interface ReportTrendPoint {
  day: number;
  label: string;
  total: number;
}

export interface ReportBudgetComparisonItem {
  label: string;
  limit: number;
  used: number;
  remaining: number;
  color: string;
}

export interface ReportSavingGoalSummary {
  activeCount: number;
  completedCount: number;
  savedAmount: number;
  targetAmount: number;
  percentage: number;
  itemLabel: string;
}

export interface MonthlyReportData {
  month: string;
  monthLabel: string;
  totalSpending: number;
  totalBudget: number | null;
  remainingBudget: number | null;
  topCategory: CategoryTotal | null;
  biggestTransaction: Transaction | null;
  savingGoalsSummary: ReportSavingGoalSummary;
  categoryBreakdown: ReportCategoryBreakdownItem[];
  spendingTrend: ReportTrendPoint[];
  budgetComparison: ReportBudgetComparisonItem[];
}

function getDaysInMonth(month: string) {
  const [year, monthValue] = month.split("-").map(Number);

  if (!year || !monthValue) {
    return 31;
  }

  return new Date(year, monthValue, 0).getDate();
}

function getCategoryColor(category: string) {
  return CATEGORY_COLOR_MAP[category] ?? CATEGORY_COLOR_MAP.Other;
}

function getBiggestTransaction(transactions: Transaction[]) {
  return [...transactions].sort(
    (left, right) =>
      right.nominal - left.nominal ||
      right.date.localeCompare(left.date) ||
      right.createdAt.localeCompare(left.createdAt),
  )[0] ?? null;
}

function buildCategoryBreakdown(transactions: Transaction[]) {
  const totalSpending = transactions.reduce(
    (sum, transaction) => sum + transaction.nominal,
    0,
  );

  return getCategoryTotals(transactions).map((item) => ({
    ...item,
    color: getCategoryColor(item.category),
    share: totalSpending > 0 ? item.total / totalSpending : 0,
  }));
}

function buildTrend(month: string, transactions: Transaction[]) {
  const totalsByDay = transactions.reduce<Record<string, number>>(
    (accumulator, transaction) => {
      const day = transaction.date.slice(-2);
      accumulator[day] = (accumulator[day] ?? 0) + transaction.nominal;
      return accumulator;
    },
    {},
  );

  return Array.from({ length: getDaysInMonth(month) }, (_, index) => {
    const day = index + 1;
    const dayKey = day.toString().padStart(2, "0");

    return {
      day,
      label: dayKey,
      total: totalsByDay[dayKey] ?? 0,
    };
  });
}

function buildBudgetComparison(
  monthlyBudget: MonthlyBudget | null,
  categoryBudgets: CategoryBudget[],
  transactions: Transaction[],
) {
  const items: ReportBudgetComparisonItem[] = [];

  if (monthlyBudget) {
    const usage = getBudgetUsage(monthlyBudget, transactions);

    if (usage) {
      items.push({
        label: "Total",
        limit: usage.limit,
        used: usage.used,
        remaining: usage.remaining,
        color: "#E8A857",
      });
    }
  }

  for (const budget of categoryBudgets) {
    const used = transactions
      .filter((transaction) => transaction.category === budget.category)
      .reduce((sum, transaction) => sum + transaction.nominal, 0);

    items.push({
      label: budget.category,
      limit: budget.limit,
      used,
      remaining: budget.limit - used,
      color: getCategoryColor(budget.category),
    });
  }

  return items;
}

function buildSavingGoalsSummary(goals: SavingGoal[]): ReportSavingGoalSummary {
  const reportGoals = goals.filter((goal) => goal.status !== "archived");
  const progressList = reportGoals.map((goal) => getSavingGoalProgress(goal));
  const savedAmount = progressList.reduce(
    (sum, progress) => sum + progress.savedAmount,
    0,
  );
  const targetAmount = progressList.reduce(
    (sum, progress) => sum + progress.targetAmount,
    0,
  );
  const activeCount = reportGoals.filter((goal) => goal.status === "active").length;
  const completedCount = reportGoals.filter(
    (goal) => goal.status === "completed",
  ).length;

  return {
    activeCount,
    completedCount,
    savedAmount,
    targetAmount,
    percentage: targetAmount > 0 ? savedAmount / targetAmount : 0,
    itemLabel:
      reportGoals.length > 0
        ? `${reportGoals.length} target kepantau`
        : "Belum ada target aktif",
  };
}

export function buildMonthlyReportData(params: {
  month: string;
  transactions: Transaction[];
  monthlyBudget: MonthlyBudget | null;
  categoryBudgets: CategoryBudget[];
  savingGoals: SavingGoal[];
}) {
  const { month, transactions, monthlyBudget, categoryBudgets, savingGoals } = params;
  const totalSpending = transactions.reduce(
    (sum, transaction) => sum + transaction.nominal,
    0,
  );
  const budgetUsage = getBudgetUsage(monthlyBudget, transactions);

  return {
    month,
    monthLabel: formatMonthLabel(month),
    totalSpending,
    totalBudget: monthlyBudget?.totalBudget ?? null,
    remainingBudget: budgetUsage?.remaining ?? null,
    topCategory: getTopCategory(transactions),
    biggestTransaction: getBiggestTransaction(transactions),
    savingGoalsSummary: buildSavingGoalsSummary(savingGoals),
    categoryBreakdown: buildCategoryBreakdown(transactions),
    spendingTrend: buildTrend(month, transactions),
    budgetComparison: buildBudgetComparison(
      monthlyBudget,
      categoryBudgets,
      transactions,
    ),
  } satisfies MonthlyReportData;
}

