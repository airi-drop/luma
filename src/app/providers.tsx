import { type PropsWithChildren, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { useBudgetsStore } from "../stores/budgets.store";
import { useSavingGoalsStore } from "../stores/saving-goals.store";
import { useSettingsStore } from "../stores/settings.store";
import { useTransactionsStore } from "../stores/transactions.store";
import { useUiStore } from "../stores/ui.store";

function DataBootstrap() {
  const selectedMonth = useUiStore((state) => state.selectedMonth);
  const hydrateSettings = useSettingsStore((state) => state.hydrate);
  const loadTransactions = useTransactionsStore((state) => state.loadMonth);
  const loadBudgets = useBudgetsStore((state) => state.loadMonth);
  const loadGoals = useSavingGoalsStore((state) => state.loadGoals);

  useEffect(() => {
    void hydrateSettings();
    void loadGoals();
  }, [hydrateSettings, loadGoals]);

  useEffect(() => {
    void loadTransactions(selectedMonth);
    void loadBudgets(selectedMonth);
  }, [selectedMonth, loadBudgets, loadTransactions]);

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
