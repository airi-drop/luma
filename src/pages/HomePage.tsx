import { Link } from "react-router-dom";
import { HeroBudgetCard } from "../components/cards/HeroBudgetCard";
import { QuickStatsRow } from "../components/cards/QuickStatsRow";
import { RecentTransactionsCard } from "../components/cards/RecentTransactionsCard";
import { MascotPlaceholder } from "../components/character/MascotPlaceholder";
import { PageWrapper } from "../components/layout/PageWrapper";
import { Card } from "../components/ui/Card";
import { getBudgetStatus, getTopCategory } from "../lib/finance";
import { useBudgetsStore } from "../stores/budgets.store";
import { useSettingsStore } from "../stores/settings.store";
import { useTransactionsStore } from "../stores/transactions.store";
import { useUiStore } from "../stores/ui.store";

export function HomePage() {
  const settings = useSettingsStore((state) => state.settings);
  const month = useTransactionsStore((state) => state.month);
  const items = useTransactionsStore((state) => state.items);
  const monthlyTotal = useTransactionsStore((state) => state.monthlyTotal);
  const todayTotal = useTransactionsStore((state) => state.todayTotal);
  const openBottomSheet = useUiStore((state) => state.openBottomSheet);
  const budgetUsage = useBudgetsStore((state) => state.budgetUsage);
  const topCategory = getTopCategory(items);
  const recentTransactions = items.slice(0, 4);
  const mascotMood = getBudgetStatus(budgetUsage?.percentage ?? 0).tone;

  return (
    <PageWrapper
      title={settings?.name ? `Halo, ${settings.name}` : "Space uangmu"}
      description="Ringkasan bulan ini biar tetap nyaman dilihat. Manual input tetap jadi jalur utama, tanpa nunggu AI."
      headerAction={
        <Link
          to="/settings"
          className="inline-flex min-h-11 items-center rounded-full border border-[var(--border-soft)] bg-[var(--bg-card)] px-4 text-sm font-semibold text-[var(--text-secondary)]"
        >
          Settings
        </Link>
      }
    >
      <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <HeroBudgetCard budgetUsage={budgetUsage} />
        <MascotPlaceholder
          characterId={settings?.activeCharacterId ?? "otter"}
          mood={settings?.mascotEnabled === false ? "chill" : mascotMood}
        />
      </div>

      <QuickStatsRow
        monthlyTotal={monthlyTotal}
        todayTotal={todayTotal}
        topCategory={topCategory}
      />

      <Card
        title="Ringkasan cepat"
        subtitle={`Bulan ${month} dipantau dari transaksi manual yang kamu simpan di device ini.`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-[30ch] text-sm leading-6 text-[var(--text-secondary)]">
            {topCategory
              ? `Kategori terboros sementara ${topCategory.category}. Kalau mau lihat ringkasan budget penuh, shortcut-nya tetap lewat Home.`
              : "Begitu ada transaksi, Home bakal langsung nunjukin ritme bulan ini tanpa bikin tampilannya terasa berat."}
          </p>
          <Link
            to="/budget"
            className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--bg-card-soft)] px-5 text-sm font-bold text-[var(--text-primary)]"
          >
            Lihat Budget
          </Link>
        </div>
      </Card>

      <RecentTransactionsCard items={recentTransactions} />

      <button
        aria-label="Tambah transaksi"
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+88px)] left-1/2 z-30 inline-flex w-[calc(100%-40px)] max-w-[220px] -translate-x-1/2 items-center justify-center gap-2 rounded-full bg-[var(--accent-primary)] px-5 py-4 text-sm font-bold text-[var(--text-on-accent)] shadow-[0_18px_36px_rgba(232,168,87,0.28)]"
        onClick={() => openBottomSheet("add-transaction")}
        type="button"
      >
        <span aria-hidden="true" className="text-lg leading-none">
          +
        </span>
        Tambah Transaksi
      </button>
    </PageWrapper>
  );
}
