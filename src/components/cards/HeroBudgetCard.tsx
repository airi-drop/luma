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
    <div className="h-3 overflow-hidden rounded-full bg-[rgba(26,20,16,0.24)]">
      <div
        className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent-primary),var(--accent-secondary))]"
        style={{ width }}
      />
    </div>
  );
}

export function HeroBudgetCard({ budgetUsage, softWarning }: HeroBudgetCardProps) {
  const percentage = budgetUsage?.percentage ?? 0;
  const progressLabel = `${Math.round(Math.min(percentage, 1) * 100)}%`;
  const status = getBudgetStatus(percentage);

  return (
    <section className="overflow-hidden rounded-[32px] border border-[rgba(255,243,220,0.14)] bg-[linear-gradient(145deg,rgba(232,168,87,0.28),rgba(143,184,150,0.16))] p-5 shadow-[var(--shadow-card)]">
      <div className="space-y-5">
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
              Budget bulan ini
            </p>
            <h2 className="font-display text-[32px] leading-none font-bold text-[var(--text-primary)]">
              {budgetUsage ? formatCurrency(budgetUsage.remaining) : "Belum diatur"}
            </h2>
            <p className="max-w-[24ch] text-sm leading-6 text-[var(--text-secondary)]">
              {budgetUsage
                ? status.label
                : "Pasang budget bulanan dulu ya, nanti Home bakal bantu mantau sisanya."}
            </p>
          </div>
          <div className="self-start rounded-[24px] border border-[rgba(255,243,220,0.14)] bg-[rgba(26,20,16,0.22)] px-4 py-3 text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Progress
            </p>
            <p className="mt-2 font-display text-2xl font-bold text-[var(--text-primary)]">
              {progressLabel}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[22px] border border-[rgba(255,243,220,0.12)] bg-[rgba(26,20,16,0.18)] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
              Budget
            </p>
            <p className="mt-2 text-sm font-bold text-[var(--text-primary)]">
              {budgetUsage ? formatCurrency(budgetUsage.limit) : "Belum ada"}
            </p>
          </div>
          <div className="rounded-[22px] border border-[rgba(255,243,220,0.12)] bg-[rgba(26,20,16,0.18)] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
              Terpakai
            </p>
            <p className="mt-2 text-sm font-bold text-[var(--text-primary)]">
              {formatCurrency(budgetUsage?.used ?? 0)}
            </p>
          </div>
          <div className="col-span-2 rounded-[22px] border border-[rgba(255,243,220,0.12)] bg-[rgba(26,20,16,0.18)] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
              Sisa
            </p>
            <p className="mt-2 text-sm font-bold text-[var(--text-primary)]">
              {budgetUsage ? formatCurrency(budgetUsage.remaining) : "Belum ada"}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-[var(--text-secondary)]">Pemakaian budget</span>
            <span className="font-semibold text-[var(--text-primary)]">
              {progressLabel}
            </span>
          </div>
          <ProgressBar value={percentage} />
        </div>

        <Link
          to="/budget"
          className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-[rgba(255,243,220,0.14)] bg-[rgba(26,20,16,0.28)] px-5 text-sm font-bold text-[var(--text-primary)]"
        >
          Lihat Budget
        </Link>

        {softWarning ? (
          <p className="rounded-[18px] border border-[rgba(255,243,220,0.12)] bg-[rgba(26,20,16,0.2)] px-4 py-3 text-sm text-[var(--text-secondary)]">
            {softWarning}
          </p>
        ) : null}
      </div>
    </section>
  );
}
