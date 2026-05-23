import { Link } from "react-router-dom";
import { HeroBudgetCard } from "../components/cards/HeroBudgetCard";
import { QuickStatsRow } from "../components/cards/QuickStatsRow";
import { RecentTransactionsCard } from "../components/cards/RecentTransactionsCard";
import { MascotPlaceholder } from "../components/character/MascotPlaceholder";
import { PageWrapper } from "../components/layout/PageWrapper";
import { InstallPromptCard } from "../components/pwa/InstallPromptCard";
import { getHomeBudgetWarning } from "../features/budgets/warnings";
import { getBudgetStatus, getTopCategory } from "../lib/finance";
import { useBudgetsStore } from "../stores/budgets.store";
import { useSettingsStore } from "../stores/settings.store";
import { useTransactionsStore } from "../stores/transactions.store";

function SettingsIconButton() {
  return (
    <Link
      aria-label="Buka Settings"
      to="/settings"
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--bg-card)] text-[var(--text-secondary)] shadow-[var(--shadow-card)] backdrop-blur-sm transition-colors hover:text-[var(--text-primary)]"
    >
      <svg
        aria-hidden="true"
        fill="none"
        height="18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
        width="18"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.36.13.68.36.92.66" />
      </svg>
    </Link>
  );
}

export function HomePage() {
  const settings = useSettingsStore((state) => state.settings);
  const items = useTransactionsStore((state) => state.items);
  const monthlyTotal = useTransactionsStore((state) => state.monthlyTotal);
  const todayTotal = useTransactionsStore((state) => state.todayTotal);
  const budgetUsage = useBudgetsStore((state) => state.budgetUsage);
  const categoryUsages = useBudgetsStore((state) => state.categoryUsages);
  const topCategory = getTopCategory(items);
  const recentTransactions = items.slice(0, 4);
  const mascotMood = getBudgetStatus(budgetUsage?.percentage ?? 0).tone;
  const homeWarning = getHomeBudgetWarning(categoryUsages)?.message ?? null;

  return (
    <PageWrapper
      title={settings?.name ? `Halo, ${settings.name}` : "Space uangmu"}
      description="Catetan kecil hari ini, biar tetap nyaman dilihat."
      headerAction={<SettingsIconButton />}
      contentClassName="space-y-4"
      bottomPadding={140}
    >
      <HeroBudgetCard budgetUsage={budgetUsage} softWarning={homeWarning} />

      <QuickStatsRow
        monthlyTotal={monthlyTotal}
        todayTotal={todayTotal}
        topCategory={topCategory}
      />

      <MascotPlaceholder
        characterId={settings?.activeCharacterId ?? "otter"}
        mood={settings?.mascotEnabled === false ? "chill" : mascotMood}
      />

      <InstallPromptCard />

      <RecentTransactionsCard items={recentTransactions} />
    </PageWrapper>
  );
}
