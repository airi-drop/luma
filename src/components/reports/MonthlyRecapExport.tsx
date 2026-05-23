import { forwardRef } from "react";
import { formatCurrency } from "../../lib/currency";
import type { MonthlyReportData } from "../../features/reports/reporting";

interface MonthlyRecapExportProps {
  data: MonthlyReportData;
}

export const MonthlyRecapExport = forwardRef<
  HTMLDivElement,
  MonthlyRecapExportProps
>(function MonthlyRecapExport({ data }, ref) {
  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-[20px] border border-[var(--border-soft)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)]"
    >
      <div
        className="rounded-[18px] border border-[var(--border-soft)] p-4"
        style={{
          background: [
            "radial-gradient(circle at top right, rgba(var(--overlay-glow-primary),0.22), transparent 38%)",
            "radial-gradient(circle at top left, rgba(var(--overlay-glow-secondary),0.18), transparent 40%)",
            "var(--bg-card-soft)",
          ].join(", "),
        }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)]">
          Monthly recap
        </p>
        <div className="mt-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate font-display text-[22px] leading-tight font-bold text-[var(--text-primary)]">
              {data.monthLabel}
            </h2>
            <p className="mt-1 line-clamp-2 max-w-[30ch] text-[12px] leading-5 text-[var(--text-secondary)]">
              Ringkasan bulanan yang tetap lembut dibaca, tapi angkanya jelas.
            </p>
          </div>
          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-surface)] text-xl">
            ✨
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-card)] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              Total spending
            </p>
            <p className="mt-1 text-[14px] font-bold text-[var(--text-primary)]">
              {formatCurrency(data.totalSpending)}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-card)] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              Remaining budget
            </p>
            <p className="mt-1 text-[14px] font-bold text-[var(--text-primary)]">
              {data.remainingBudget === null
                ? "Belum diatur"
                : formatCurrency(data.remainingBudget)}
            </p>
          </div>
        </div>

        <div className="mt-3 grid gap-2">
          <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-card)] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              Highlight
            </p>
            <div className="mt-2 grid gap-1.5 text-[12px] leading-5 text-[var(--text-secondary)]">
              <p>
                Kategori paling ramai:{" "}
                <span className="font-bold text-[var(--text-primary)]">
                  {data.topCategory?.category ?? "Belum ada"}
                </span>
              </p>
              <p>
                Transaksi terbesar:{" "}
                <span className="font-bold text-[var(--text-primary)]">
                  {data.biggestTransaction
                    ? `${data.biggestTransaction.detail} · ${formatCurrency(data.biggestTransaction.nominal)}`
                    : "Belum ada"}
                </span>
              </p>
              <p>
                Progress target:{" "}
                <span className="font-bold text-[var(--text-primary)]">
                  {data.savingGoalsSummary.targetAmount > 0
                    ? `${formatCurrency(data.savingGoalsSummary.savedAmount)} / ${formatCurrency(data.savingGoalsSummary.targetAmount)}`
                    : "Belum ada target"}
                </span>
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-card)] p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                Breakdown kategori
              </p>
              <p className="text-[10px] text-[var(--text-muted)]">
                {data.categoryBreakdown.length} kategori
              </p>
            </div>
            <div className="mt-2 space-y-2">
              {data.categoryBreakdown.slice(0, 4).map((item) => (
                <div key={item.category} className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-[12px]">
                    <span className="truncate font-semibold text-[var(--text-primary)]">
                      {item.category}
                    </span>
                    <span className="shrink-0 text-[var(--text-secondary)]">
                      {formatCurrency(item.total)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--bg-card-soft)]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: item.color,
                        width: `${Math.max(item.share * 100, 6)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
              {data.categoryBreakdown.length === 0 ? (
                <p className="text-[12px] leading-5 text-[var(--text-secondary)]">
                  Laporan ini akan terisi begitu kamu punya transaksi bulan ini.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
