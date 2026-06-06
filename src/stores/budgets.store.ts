import { create } from "zustand";
import { budgetsRepo } from "../db/repositories/budgets.repo";
import { getCurrentMonth } from "../lib/date";
import { getBudgetUsage, getCategoryBudgetUsage } from "../lib/finance";
import type { CategoryBudget, CategoryType, MonthlyBudget, Transaction } from "../types";
import { useTransactionsStore } from "./transactions.store";

interface BudgetWithUsage {
  budget: CategoryBudget;
  usage: ReturnType<typeof getCategoryBudgetUsage>;
}

interface BudgetsState {
  month: string;
  monthlyBudget: MonthlyBudget | null;
  categoryBudgets: CategoryBudget[];
  categoryUsages: BudgetWithUsage[];
  budgetUsage: ReturnType<typeof getBudgetUsage>;
  isLoading: boolean;
  error: string | null;
  syncUsageWithTransactions: (transactions: Transaction[]) => void;
  loadMonth: (month?: string) => Promise<void>;
  setMonth: (month: string) => Promise<void>;
  upsertMonthlyBudget: (totalBudget: number) => Promise<MonthlyBudget>;
  upsertCategoryBudget: (
    category: CategoryType,
    limit: number,
    resetMonthly?: boolean,
  ) => Promise<CategoryBudget>;
  removeCategoryBudget: (category: CategoryType) => Promise<void>;
}

function deriveBudgetState(
  monthlyBudget: MonthlyBudget | null,
  categoryBudgets: CategoryBudget[],
  month: string,
  transactions: Transaction[],
) {
  const monthTransactions = transactions.filter((transaction) => transaction.month === month);

  return {
    budgetUsage: getBudgetUsage(monthlyBudget, monthTransactions),
    categoryUsages: categoryBudgets.map((budget) => ({
      budget,
      usage: getCategoryBudgetUsage(budget, monthTransactions),
    })),
  };
}

export const useBudgetsStore = create<BudgetsState>((set, get) => ({
  month: getCurrentMonth(),
  monthlyBudget: null,
  categoryBudgets: [],
  categoryUsages: [],
  budgetUsage: null,
  isLoading: false,
  error: null,
  syncUsageWithTransactions(transactions) {
    const { monthlyBudget, categoryBudgets, month } = get();
    set({
      ...deriveBudgetState(monthlyBudget, categoryBudgets, month, transactions),
    });
  },
  async loadMonth(month = get().month) {
    set({ isLoading: true, error: null });

    try {
      const [monthlyBudget, categoryBudgets] = await Promise.all([
        budgetsRepo.getMonthlyBudget(month),
        budgetsRepo.listCategoryBudgets(month),
      ]);
      const transactionsState = useTransactionsStore.getState();
      const transactions =
        transactionsState.month === month
          ? transactionsState.items
          : transactionsState.allItems;

      set({
        month,
        monthlyBudget,
        categoryBudgets,
        isLoading: false,
        ...deriveBudgetState(monthlyBudget, categoryBudgets, month, transactions),
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Gagal memuat budget.",
      });
    }
  },
  async setMonth(month) {
    await get().loadMonth(month);
  },
  async upsertMonthlyBudget(totalBudget) {
    const record = await budgetsRepo.upsertMonthlyBudget(get().month, totalBudget);
    await get().loadMonth(get().month);
    return record;
  },
  async upsertCategoryBudget(category, limit, resetMonthly = true) {
    const record = await budgetsRepo.upsertCategoryBudget(
      get().month,
      category,
      limit,
      resetMonthly,
    );
    await get().loadMonth(get().month);
    return record;
  },
  async removeCategoryBudget(category) {
    await budgetsRepo.removeCategoryBudget(get().month, category);
    await get().loadMonth(get().month);
  },
}));
