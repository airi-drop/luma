import { Link } from "react-router-dom";
import { PageWrapper } from "../components/layout/PageWrapper";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { formatCurrency } from "../lib/currency";
import { useBudgetsStore } from "../stores/budgets.store";
import { useSavingGoalsStore } from "../stores/saving-goals.store";
import { useSettingsStore } from "../stores/settings.store";
import { useTransactionsStore } from "../stores/transactions.store";
import { useUiStore } from "../stores/ui.store";

export function HomePage() {
  const settings = useSettingsStore((state) => state.settings);
  const monthlyTotal = useTransactionsStore((state) => state.monthlyTotal);
  const todayTotal = useTransactionsStore((state) => state.todayTotal);
  const items = useTransactionsStore((state) => state.items);
  const openBottomSheet = useUiStore((state) => state.openBottomSheet);
  const budgetUsage = useBudgetsStore((state) => state.budgetUsage);
  const goals = useSavingGoalsStore((state) => state.goals);
  const topCategory = useTransactionsStore((state) => state.categoryTotals[0]);
  const recentTransactions = items.slice(0, 4);

  return (
    <PageWrapper
      title={settings?.name ? `Halo, ${settings.name}` : "Space uangmu"}
      description="Catat pengeluaran manual dulu dengan tenang. Flow ini tetap jadi jalur utama, tanpa AI."
      headerAction={
        <Link
          to="/settings"
          className="inline-flex min-h-11 items-center rounded-full border border-[var(--border-soft)] bg-[var(--bg-card)] px-4 text-sm font-semibold text-[var(--text-secondary)]"
        >
          Settings
        </Link>
      }
    >
      <Card className="overflow-hidden bg-[linear-gradient(135deg,rgba(232,168,87,0.22),rgba(143,184,150,0.14))]">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm text-[var(--text-secondary)]">
                Budget bulan ini
              </p>
              <p className="font-display text-4xl font-bold">
                {budgetUsage ? formatCurrency(budgetUsage.remaining) : "Belum diatur"}
              </p>
            </div>
            <div className="rounded-full bg-[var(--bg-card)] px-4 py-2 text-3xl">
              {settings?.activeCharacterId ?? "otter"}
            </div>
          </div>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            {budgetUsage
              ? `Terpakai ${formatCurrency(budgetUsage.used)} dari ${formatCurrency(
                  budgetUsage.limit,
                )}.`
              : "Budget detail belum diisi. Shortcut-nya tetap lewat Home, bukan tab terpisah."}
          </p>
          <Link
            to="/budget"
            className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--bg-card-soft)] px-5 text-sm font-bold text-[var(--text-primary)]"
          >
            Lihat Budget
          </Link>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card title="Transaksi" subtitle="Flow manual jadi prioritas utama.">
          <p className="text-sm text-[var(--text-secondary)]">
            Hari ini {formatCurrency(todayTotal)} dari {items.length} catatan bulan ini.
          </p>
        </Card>
        <Card title="Target" subtitle="Tabungan tetap terasa ringan.">
          <p className="text-sm text-[var(--text-secondary)]">
            {goals.length} target tersimpan. {goals.filter((goal) => goal.status === "completed").length} sudah selesai.
          </p>
        </Card>
      </div>

      <Card title="Input manual" subtitle="Manual transaction flow sekarang sudah jadi jalur utama.">
        <p className="mb-4 text-sm leading-6 text-[var(--text-secondary)]">
          Total bulan ini {formatCurrency(monthlyTotal)}.
          {topCategory ? ` Kategori paling aktif sementara ${topCategory.category}.` : " Belum ada transaksi yang tersimpan."}
        </p>
        <Button fullWidth onClick={() => openBottomSheet("add-transaction")}>
          Simpan Transaksi
        </Button>
      </Card>

      <Card
        title="Transaksi terbaru"
        subtitle="Biar catatan terakhir tetap gampang dicek dari Home."
      >
        {recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-start justify-between gap-3 rounded-3xl border border-[var(--border-soft)] bg-[var(--bg-card-soft)] p-4"
              >
                <div className="space-y-1">
                  <p className="font-semibold text-[var(--text-primary)]">
                    {transaction.detail}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {transaction.category} · {transaction.account} · {transaction.date}
                  </p>
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    {transaction.source}
                    {transaction.mood ? ` · ${transaction.mood}` : ""}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-bold text-[var(--text-primary)]">
                  {formatCurrency(transaction.nominal)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Belum ada catatan hari ini. Mau mulai dari satu transaksi kecil?
          </p>
        )}
      </Card>

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
