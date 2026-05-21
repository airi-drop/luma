import { type PropsWithChildren, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { applyTheme, getStoredThemeId } from "../features/customization/theme";
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
