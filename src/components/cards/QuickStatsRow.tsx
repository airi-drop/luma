import { Card } from "../ui/Card";
import { formatCurrency } from "../../lib/currency";
import type { CategoryTotal } from "../../types";

interface QuickStatsRowProps {
  monthlyTotal: number;
  todayTotal: number;
  topCategory: CategoryTotal | null;
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card className="h-full p-4" title={label}>
      <p className="font-display text-2xl leading-none font-bold text-[var(--text-primary)]">
        {value}
      </p>
      <p className="mt-3 text-xs leading-5 text-[var(--text-secondary)]">
        {hint}
      </p>
    </Card>
  );
}

export function QuickStatsRow({
  monthlyTotal,
  todayTotal,
  topCategory,
}: QuickStatsRowProps) {
  return (
    <section className="grid grid-cols-3 gap-3">
      <StatCard
        hint="Semua pengeluaran di bulan aktif."
        label="Total bulan ini"
        value={formatCurrency(monthlyTotal)}
      />
      <StatCard
        hint="Biar gampang cek ritme hari ini."
        label="Hari ini"
        value={formatCurrency(todayTotal)}
      />
      <StatCard
        hint={
          topCategory
            ? `${formatCurrency(topCategory.total)} paling banyak ke sini.`
            : "Nanti muncul setelah ada transaksi."
        }
        label="Kategori terboros"
        value={topCategory?.category ?? "Belum ada"}
      />
    </section>
  );
}
