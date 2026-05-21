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
  allItems: Transaction[];
  isLoading: boolean;
  isLoadingAll: boolean;
  error: string | null;
  monthlyTotal: number;
  todayTotal: number;
  categoryTotals: ReturnType<typeof getCategoryTotals>;
  hasLoadedAll: boolean;
  loadMonth: (month?: string) => Promise<void>;
  loadAll: () => Promise<void>;
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
  allItems: [],
  isLoading: false,
  isLoadingAll: false,
  error: null,
  monthlyTotal: 0,
  todayTotal: 0,
  categoryTotals: [],
  hasLoadedAll: false,
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
  async loadAll() {
    set({ isLoadingAll: true, error: null });

    try {
      const allItems = await transactionsRepo.listAll();
      set({
        allItems,
        hasLoadedAll: true,
        isLoadingAll: false,
      });
    } catch (error) {
      set({
        isLoadingAll: false,
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

    if (get().hasLoadedAll) {
      const allItems = [created, ...get().allItems].sort((left, right) =>
        right.date.localeCompare(left.date) ||
        right.createdAt.localeCompare(left.createdAt),
      );
      set({ allItems });
    }

    return created;
  },
  async updateTransaction(id, input) {
    const updated = await transactionsRepo.update(id, input);
    const tasks = [get().loadMonth(get().month)];

    if (get().hasLoadedAll) {
      tasks.push(get().loadAll());
    }

    await Promise.all(tasks);
    return updated;
  },
  async removeTransaction(id) {
    await transactionsRepo.remove(id);
    const items = get().items.filter((item) => item.id !== id);
    const nextState: Partial<TransactionsState> = {
      items,
      ...derive(items),
    };

    if (get().hasLoadedAll) {
      nextState.allItems = get().allItems.filter((item) => item.id !== id);
    }

    set({
      ...nextState,
    });
  },
}));
