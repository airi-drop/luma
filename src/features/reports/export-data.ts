import { budgetsRepo } from "../../db/repositories/budgets.repo";
import { savingGoalsRepo } from "../../db/repositories/saving-goals.repo";
import { transactionsRepo } from "../../db/repositories/transactions.repo";
import { buildMonthlyReportData } from "./reporting";

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function getExportData(month: string) {
  const [transactions, budgets, savingGoals] = await Promise.all([
    transactionsRepo.listByMonth(month),
    budgetsRepo.listByMonth(month),
    savingGoalsRepo.listAll(),
  ]);

  const monthlyBudget =
    budgets.find((budget) => budget.kind === "monthly") ?? null;
  const categoryBudgets = budgets.filter((budget) => budget.kind === "category");
  const reportData = buildMonthlyReportData({
    month,
    transactions,
    monthlyBudget,
    categoryBudgets,
    savingGoals,
  });

  return {
    transactions,
    budgets,
    savingGoals,
    reportData,
  };
}

export function readThemeColor(token: string, fallback: string) {
  if (typeof window === "undefined") {
    return fallback;
  }

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim();
  return value || fallback;
}
