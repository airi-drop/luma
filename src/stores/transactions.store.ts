import { create } from "zustand";
import { getCurrentMonth } from "../lib/date";
import {
  getCategoryTotals,
  getMonthlyTotal,
  getTodayTotal,
} from "../lib/finance";
import { transactionsRepo } from "../db/repositories/transactions.repo";
import type {
  CreateTransactionInput,
  Transaction,
  UpdateTransactionInput,
} from "../types";

interface TransactionsState {
  month: string;
  items: Transaction[];
  isLoading: boolean;
  error: string | null;
  monthlyTotal: number;
  todayTotal: number;
  categoryTotals: ReturnType<typeof getCategoryTotals>;
  loadMonth: (month?: string) => Promise<void>;
  setMonth: (month: string) => Promise<void>;
  createTransaction: (input: CreateTransactionInput) => Promise<Transaction>;
  updateTransaction: (
    id: string,
    input: UpdateTransactionInput,
  ) => Promise<Transaction>;
  removeTransaction: (id: string) => Promise<void>;
}

function derive(items: Transaction[]) {
  return {
    monthlyTotal: getMonthlyTotal(items),
    todayTotal: getTodayTotal(items),
    categoryTotals: getCategoryTotals(items),
  };
}

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  month: getCurrentMonth(),
  items: [],
  isLoading: false,
  error: null,
  monthlyTotal: 0,
  todayTotal: 0,
  categoryTotals: [],
  async loadMonth(month = get().month) {
    set({ isLoading: true, error: null });

    try {
      const items = await transactionsRepo.listByMonth(month);
      set({
        month,
        items,
        isLoading: false,
        ...derive(items),
      });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Gagal memuat transaksi.",
      });
    }
  },
  async setMonth(month) {
    await get().loadMonth(month);
  },
  async createTransaction(input) {
    const created = await transactionsRepo.create(input);

    if (created.month === get().month) {
      const items = [created, ...get().items].sort((left, right) =>
        right.date.localeCompare(left.date) ||
        right.createdAt.localeCompare(left.createdAt),
      );
      set({
        items,
        ...derive(items),
      });
    }

    return created;
  },
  async updateTransaction(id, input) {
    const updated = await transactionsRepo.update(id, input);
    await get().loadMonth(get().month);
    return updated;
  },
  async removeTransaction(id) {
    await transactionsRepo.remove(id);
    const items = get().items.filter((item) => item.id !== id);
    set({
      items,
      ...derive(items),
    });
  },
}));
