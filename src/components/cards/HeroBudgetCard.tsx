import { Link } from "react-router-dom";
import { formatCurrency } from "../../lib/currency";
import { getBudgetStatus } from "../../lib/finance";
import type { BudgetUsageSummary } from "../../types";

interface HeroBudgetCardProps {
  budgetUsage: BudgetUsageSummary | null;
  softWarning?: string | null;
}

function ProgressBar({ value }: { value: number }) {
  const width = `${Math.min(Math.max(value, 0), 1) * 100}%`;

  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-[var(--hero-progress-track)]">
      <div
        className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent-primary),var(--accent-secondary))] transition-[width] duration-500"
        style={{ width }}
      />
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-[10px] border border-[var(--hero-glass-border)] bg-[var(--hero-glass)] px-2 py-1.5 backdrop-blur-sm">
      <p className="truncate text-[8px] font-semibold uppercase tracking-[0.12em] text-[var(--hero-text-soft)]">
        {label}
      </p>
      <p className="truncate text-[12px] font-bold text-[var(--hero-text)]">
        {value}
      </p>
    </div>
  );
}

export function HeroBudgetCard({ budgetUsage, softWarning }: HeroBudgetCardProps) {
  const percentage = budgetUsage?.percentage ?? 0;
  const progressLabel = `${Math.round(Math.min(percentage, 1) * 100)}%`;
  const status = getBudgetStatus(percentage);

  return (
    <section
      className="relative isolate overflow-hidden rounded-[20px] border border-[var(--hero-glass-border)] p-4 shadow-[var(--shadow-card)]"
      style={{
        background: [
          "radial-gradient(120% 90% at 0% 0%, var(--hero-glow-tl), transparent 55%)",
          "radial-gradient(100% 80% at 100% 100%, var(--hero-glow-br), transparent 60%)",
          "radial-gradient(70% 60% at 50% 50%, var(--hero-glow-mid), transparent 75%)",
          "var(--hero-grad)",
        ].join(", "),
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-[radial-gradient(circle,var(--hero-glow-tl),transparent_65%)] blur-2xl"
      />

      <div className="relative space-y-3" style={{ color: "var(--hero-text)" }}>
        {/* header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--hero-text-soft)]">
              Budget bulan ini
            </p>
            <h2 className="truncate font-display text-[22px] leading-tight font-bold">
              {budgetUsage ? formatCurrency(budgetUsage.remaining) : "Belum diatur"}
            </h2>
            <p className="line-clamp-2 max-w-[26ch] text-[11px] leading-4 text-[var(--hero-text-soft)]">
              {budgetUsage
                ? status.label
                : "Pasang budget bulanan dulu, nanti Home bantu pantau sisanya."}
            </p>
          </div>
          <div
            className="shrink-0 rounded-full border px-2 py-0.5 text-center backdrop-blur-sm"
            style={{
              borderColor: "var(--hero-glass-border)",
              background: "var(--hero-glass-strong)",
            }}
          >
            <p className="text-[7px] font-semibold uppercase tracking-[0.16em] text-[var(--hero-text-soft)]">
              Progress
            </p>
            <p className="font-display text-[12px] font-bold leading-tight text-[var(--hero-text)]">
              {progressLabel}
            </p>
          </div>
        </div>

        {/* stat chips */}
        <div className="flex items-stretch gap-1.5">
          <StatChip
            label="Budget"
            value={budgetUsage ? formatCurrency(budgetUsage.limit) : "—"}
          />
          <StatChip
            label="Terpakai"
            value={formatCurrency(budgetUsage?.used ?? 0)}
          />
          <StatChip
            label="Sisa"
            value={budgetUsage ? formatCurrency(budgetUsage.remaining) : "—"}
          />
        </div>

        {/* progress */}
        <div className="space-y-1">
          <ProgressBar value={percentage} />
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-[var(--hero-text-soft)]">Pemakaian budget</span>
            <span className="font-semibold text-[var(--hero-text)]">
              {progressLabel}
            </span>
          </div>
        </div>

        {/* footer */}
        <div className="flex items-center justify-between gap-2">
          {softWarning ? (
            <p className="min-w-0 flex-1 truncate text-[10px] text-[var(--hero-text-soft)]">
              {softWarning}
            </p>
          ) : (
            <span aria-hidden="true" className="min-w-0 flex-1" />
          )}
          <Link
            to="/budget"
            className="inline-flex h-7 shrink-0 items-center justify-center gap-1 rounded-full px-2.5 text-[11px] font-bold text-[var(--hero-text)] backdrop-blur-sm transition-colors"
            style={{ background: "var(--hero-glass-strong)" }}
          >
            Lihat Budget
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
