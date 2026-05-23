import { formatCurrency } from "../../lib/currency";
import type { CategoryTotal } from "../../types";

interface QuickStatsRowProps {
  monthlyTotal: number;
  todayTotal: number;
  topCategory: CategoryTotal | null;
}

interface StatChipProps {
  label: string;
  value: string;
  hint: string;
  tint: "amber" | "sage" | "rose";
}

const tintStyles: Record<StatChipProps["tint"], { bg: string; border: string }> = {
  amber: { bg: "var(--chip-amber)", border: "var(--chip-amber-border)" },
  sage: { bg: "var(--chip-sage)", border: "var(--chip-sage-border)" },
  rose: { bg: "var(--chip-rose)", border: "var(--chip-rose-border)" },
};

function StatChip({ label, value, hint, tint }: StatChipProps) {
  const style = tintStyles[tint];
  return (
    <article
      className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-2xl border p-2.5 shadow-[var(--shadow-card)] backdrop-blur-sm"
      style={{ background: style.bg, borderColor: style.border }}
    >
      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
        {label}
      </p>
      <p className="truncate font-display text-[14px] leading-tight font-bold text-[var(--text-primary)]">
        {value}
      </p>
      <p className="truncate text-[10px] leading-4 text-[var(--text-muted)]">
        {hint}
      </p>
    </article>
  );
}

export function QuickStatsRow({
  monthlyTotal,
  todayTotal,
  topCategory,
}: QuickStatsRowProps) {
  return (
    <section className="flex items-stretch gap-2">
      <StatChip
        hint="Bulan aktif"
        label="Total"
        tint="amber"
        value={formatCurrency(monthlyTotal)}
      />
      <StatChip
        hint="Hari ini"
        label="Hari ini"
        tint="sage"
        value={formatCurrency(todayTotal)}
      />
      <StatChip
        hint={
          topCategory
            ? formatCurrency(topCategory.total)
            : "Mulai catat dulu"
        }
        label="Terboros"
        tint="rose"
        value={topCategory?.category ?? "—"}
      />
    </section>
  );
}
