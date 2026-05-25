import { type PropsWithChildren, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { appDataRepo } from "../db/repositories/app-data.repo";
import { applyTheme, getStoredThemeId } from "../features/customization/theme";
import {
  seedDummyData,
} from "../features/transactions/seed";
import { useBudgetsStore } from "../stores/budgets.store";
import { useSavingGoalsStore } from "../stores/saving-goals.store";
import { useSettingsStore } from "../stores/settings.store";
import { useTransactionsStore } from "../stores/transactions.store";
import { useUiStore } from "../stores/ui.store";

function DataBootstrap() {
  const selectedMonth = useUiStore((state) => state.selectedMonth);
  const hydrateSettings = useSettingsStore((state) => state.hydrate);
  const settings = useSettingsStore((state) => state.settings);
  const loadTransactions = useTransactionsStore((state) => state.loadMonth);
  const transactionItems = useTransactionsStore((state) => state.items);
  const loadBudgets = useBudgetsStore((state) => state.loadMonth);
  const syncBudgetUsage = useBudgetsStore((state) => state.syncUsageWithTransactions);
  const loadGoals = useSavingGoalsStore((state) => state.loadGoals);

  useEffect(() => {
    applyTheme(getStoredThemeId());
  }, []);

  useEffect(() => {
    void hydrateSettings();
    void loadGoals();
  }, [hydrateSettings, loadGoals]);

  useEffect(() => {
    void loadTransactions(selectedMonth);
    void loadBudgets(selectedMonth);
  }, [selectedMonth, loadBudgets, loadTransactions]);

  useEffect(() => {
    syncBudgetUsage();
  }, [syncBudgetUsage, transactionItems, selectedMonth]);

  useEffect(() => {
    applyTheme(settings?.activeThemeId);
  }, [settings?.activeThemeId]);

  // Dev helpers: panggil dari DevTools console.
  useEffect(() => {
    if (typeof window === "undefined" || !import.meta.env.DEV) {
      return;
    }

    const refresh = async () => {
      const month = useTransactionsStore.getState().month;
      await Promise.all([
        useTransactionsStore.getState().loadAll(),
        useTransactionsStore.getState().loadMonth(month),
        useBudgetsStore.getState().loadMonth(month),
      ]);
    };

    const win = window as typeof window & {
      lumaSeed?: typeof seedDummyData;
      lumaClear?: () => Promise<number>;
    };

    win.lumaSeed = async (...args: Parameters<typeof seedDummyData>) => {
      const result = await seedDummyData(...args);
      await refresh();
      console.info(
        `[luma] Seeded ${result.totalCreated} dummy transactions across ${result.perMonth.length} months.`,
      );
      return result;
    };

    win.lumaClear = async () => {
      const removed = await appDataRepo.clearFinanceData();
      await refresh();
      console.info(`[luma] Cleared ${removed} finance records.`);
      return removed;
    };

    return () => {
      delete win.lumaSeed;
      delete win.lumaClear;
    };
  }, []);

  return null;
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <BrowserRouter>
      <DataBootstrap />
      {children}
    </BrowserRouter>
  );
}
