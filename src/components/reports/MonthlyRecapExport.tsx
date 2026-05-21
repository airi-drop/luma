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
      className="overflow-hidden rounded-[32px] border border-[rgba(255,243,220,0.14)] bg-[linear-gradient(180deg,#2F231C_0%,#1A1410_100%)] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.32)]"
    >
      <div className="rounded-[28px] border border-[rgba(255,243,220,0.12)] bg-[radial-gradient(circle_at_top_right,rgba(232,168,87,0.22),transparent_35%),radial-gradient(circle_at_top_left,rgba(143,184,150,0.18),transparent_38%),rgba(255,243,220,0.03)] p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)]">
          Monthly recap
        </p>
        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-[32px] leading-tight font-bold text-[var(--text-primary)]">
              {data.monthLabel}
            </h2>
            <p className="mt-2 max-w-[28ch] text-sm leading-6 text-[var(--text-secondary)]">
              Ringkasan bulanan yang tetap lembut dibaca, tapi angkanya masih jelas.
            </p>
          </div>
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(255,243,220,0.08)] text-3xl">
            ✨
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-[22px] border border-[rgba(255,243,220,0.1)] bg-[rgba(26,20,16,0.34)] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Total spending
            </p>
            <p className="mt-2 text-lg font-bold text-[var(--text-primary)]">
              {formatCurrency(data.totalSpending)}
            </p>
          </div>
          <div className="rounded-[22px] border border-[rgba(255,243,220,0.1)] bg-[rgba(26,20,16,0.34)] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Remaining budget
            </p>
            <p className="mt-2 text-lg font-bold text-[var(--text-primary)]">
              {data.remainingBudget === null
                ? "Belum diatur"
                : formatCurrency(data.remainingBudget)}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          <div className="rounded-[24px] border border-[rgba(255,243,220,0.1)] bg-[rgba(26,20,16,0.26)] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Highlight
            </p>
            <div className="mt-3 grid gap-3 text-sm text-[var(--text-secondary)]">
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
                    ? `${formatCurrency(data.savingGoalsSummary.savedAmount)} dari ${formatCurrency(data.savingGoalsSummary.targetAmount)}`
                    : "Belum ada target"}
                </span>
              </p>
            </div>
          </div>

          <div className="rounded-[24px] border border-[rgba(255,243,220,0.1)] bg-[rgba(26,20,16,0.26)] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Breakdown kategori
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {data.categoryBreakdown.length} kategori
              </p>
            </div>
            <div className="mt-4 space-y-3">
              {data.categoryBreakdown.slice(0, 4).map((item) => (
                <div key={item.category} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-[var(--text-primary)]">
                      {item.category}
                    </span>
                    <span className="text-[var(--text-secondary)]">
                      {formatCurrency(item.total)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[rgba(255,243,220,0.08)]">
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
                <p className="text-sm text-[var(--text-secondary)]">
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

