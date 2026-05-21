import { Link } from "react-router-dom";
import { PageWrapper } from "../components/layout/PageWrapper";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useBudgetsStore } from "../stores/budgets.store";
import { useSavingGoalsStore } from "../stores/saving-goals.store";
import { useSettingsStore } from "../stores/settings.store";
import { useTransactionsStore } from "../stores/transactions.store";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function HomePage() {
  const settings = useSettingsStore((state) => state.settings);
  const monthlyTotal = useTransactionsStore((state) => state.monthlyTotal);
  const todayTotal = useTransactionsStore((state) => state.todayTotal);
  const items = useTransactionsStore((state) => state.items);
  const budgetUsage = useBudgetsStore((state) => state.budgetUsage);
  const goals = useSavingGoalsStore((state) => state.goals);
  const topCategory = useTransactionsStore((state) => state.categoryTotals[0]);

  return (
    <PageWrapper
      title={settings?.name ? `Halo, ${settings.name}` : "Space uangmu"}
      description="Fondasi data lokal sudah aktif. Manual flow tetap jadi prioritas, AI masih belum ikut campur."
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

      <Card title="Catatan awal" subtitle="Sprint 2 fokus ke fondasi data.">
        <p className="mb-4 text-sm leading-6 text-[var(--text-secondary)]">
          Total bulan ini {formatCurrency(monthlyTotal)}.
          {topCategory ? ` Kategori paling aktif sementara ${topCategory.category}.` : " Belum ada transaksi yang tersimpan."}
        </p>
        <Button fullWidth>Simpan Transaksi</Button>
      </Card>
    </PageWrapper>
  );
}
