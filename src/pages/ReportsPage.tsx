import { Suspense, lazy, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AIReflectionCard } from "../components/ai/AIReflectionCard";
import { PageWrapper } from "../components/layout/PageWrapper";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { buildMonthlyReportData } from "../features/reports/reporting";
import { formatCurrency } from "../lib/currency";
import { formatDateLabel } from "../lib/date";
import { useBudgetsStore } from "../stores/budgets.store";
import { useSavingGoalsStore } from "../stores/saving-goals.store";
import { useSettingsStore } from "../stores/settings.store";
import { useTransactionsStore } from "../stores/transactions.store";
import { useUiStore } from "../stores/ui.store";

const ReportChartsSection = lazy(async () => {
  const module = await import("../components/reports/ReportChartsSection");
  return { default: module.ReportChartsSection };
});

function ExportIcon({ kind }: { kind: "pdf" | "xlsx" | "csv" }) {
  const config = {
    pdf: { label: "PDF", bubble: "bg-[#F2685A] text-white" },
    xlsx: { label: "XLS", bubble: "bg-[#73BF63] text-white" },
    csv: { label: "CSV", bubble: "bg-[var(--bg-card)] text-[var(--text-secondary)]" },
  }[kind];

  return (
    <span
      className={[
        "inline-flex h-5 min-w-[24px] items-center justify-center rounded-full px-1.5 text-[9px] font-black tracking-[0.08em]",
        config.bubble,
      ].join(" ")}
    >
      {config.label}
    </span>
  );
}

export function ReportsPage() {
  const selectedMonth = useUiStore((state) => state.selectedMonth);
  const setSelectedMonth = useUiStore((state) => state.setSelectedMonth);
  const monthTransactions = useTransactionsStore((state) => state.items);
  const monthlyBudget = useBudgetsStore((state) => state.monthlyBudget);
  const categoryBudgets = useBudgetsStore((state) => state.categoryBudgets);
  const savingGoals = useSavingGoalsStore((state) => state.goals);
  const settings = useSettingsStore((state) => state.settings);
  const isLoadingTransactions = useTransactionsStore((state) => state.isLoading);
  const isLoadingBudgets = useBudgetsStore((state) => state.isLoading);
  const isLoadingGoals = useSavingGoalsStore((state) => state.isLoading);
  const transactionError = useTransactionsStore((state) => state.error);
  const budgetError = useBudgetsStore((state) => state.error);
  const reportError = transactionError ?? budgetError;
  const reportData = useMemo(
    () =>
      buildMonthlyReportData({
        month: selectedMonth,
        transactions: monthTransactions,
        monthlyBudget,
        categoryBudgets,
        savingGoals,
      }),
    [categoryBudgets, monthTransactions, monthlyBudget, savingGoals, selectedMonth],
  );
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingXlsx, setIsExportingXlsx] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);

  const isLoading = isLoadingTransactions || isLoadingBudgets || isLoadingGoals;
  const hasReportContent =
    reportData.totalSpending > 0 ||
    reportData.totalBudget !== null ||
    reportData.savingGoalsSummary.targetAmount > 0;

  async function handleExportPdf() {
    setIsExportingPdf(true);

    try {
      const { exportMonthlyReportPdf } = await import("../features/reports/export-pdf");
      await exportMonthlyReportPdf(selectedMonth);
    } finally {
      setIsExportingPdf(false);
    }
  }

  async function handleExportXlsx() {
    setIsExportingXlsx(true);

    try {
      const { exportMonthlySpreadsheetXlsx } = await import("../features/reports/export-xlsx");
      await exportMonthlySpreadsheetXlsx(selectedMonth);
    } finally {
      setIsExportingXlsx(false);
    }
  }

  async function handleExportCsv() {
    setIsExportingCsv(true);

    try {
      const { exportMonthlySpreadsheetCsv } = await import("../features/reports/export-csv");
      await exportMonthlySpreadsheetCsv(selectedMonth);
    } finally {
      setIsExportingCsv(false);
    }
  }

  return (
    <PageWrapper
      bottomPadding={140}
      title="Laporan"
      description="Rekap bulanan yang tetap cozy, tapi angka pentingnya masih gampang dicari."
    >
      <Card title="Atur bulan laporan" subtitle="Pilih bulan yang mau kamu lihat atau ekspor lagi.">
        <Input
          hint="Semua ringkasan, chart, dan file export akan mengikuti bulan ini."
          label="Bulan laporan"
          onChange={(event) => setSelectedMonth(event.target.value)}
          type="month"
          value={selectedMonth}
        />
      </Card>

      <Card
        className="px-4 py-4"
        title="Ekspor bulan ini"
        subtitle="PDF dibuat sebagai recap bulanan yang rapi, sementara XLSX dan CSV tetap fokus ke data."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button
            className="min-h-[40px] gap-2 px-3.5 text-[12px]"
            disabled={!hasReportContent || isExportingPdf}
            onClick={handleExportPdf}
            variant="secondary"
          >
            <ExportIcon kind="pdf" />
            {isExportingPdf ? "PDF..." : "PDF"}
          </Button>
          <Button
            className="min-h-[40px] gap-2 px-3.5 text-[12px]"
            disabled={!hasReportContent || isExportingXlsx}
            onClick={handleExportXlsx}
            variant="secondary"
          >
            <ExportIcon kind="xlsx" />
            {isExportingXlsx ? "XLSX..." : "XLSX"}
          </Button>
          <Button
            className="min-h-[40px] gap-2 px-3.5 text-[12px]"
            disabled={!hasReportContent || isExportingCsv}
            onClick={handleExportCsv}
            variant="secondary"
          >
            <ExportIcon kind="csv" />
            {isExportingCsv ? "CSV..." : "CSV"}
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <Card title="Menyiapkan laporan">
          <p className="text-[12px] leading-5 text-[var(--text-secondary)]">
            Sebentar ya, laporan bulan ini lagi dirapihin dulu.
          </p>
        </Card>
      ) : reportError ? (
        <Card title="Laporan belum kebuka">
          <p className="text-[12px] leading-5 text-[var(--danger-soft)]">{reportError}</p>
        </Card>
      ) : hasReportContent ? (
        <>
          <section className="grid grid-cols-2 gap-2">
            <Card className="bg-[linear-gradient(155deg,rgba(var(--overlay-glow-primary),0.22),rgba(var(--overlay-glow-secondary),0.16))]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                Total spending
              </p>
              <p className="mt-1.5 truncate font-display text-[20px] leading-tight font-bold text-[var(--text-primary)]">
                {formatCurrency(reportData.totalSpending)}
              </p>
              <p className="mt-1 text-[11px] leading-4 text-[var(--text-secondary)]">
                Pengeluaran di {reportData.monthLabel.toLowerCase()}.
              </p>
            </Card>

            <Card className="bg-[linear-gradient(155deg,rgba(var(--overlay-glow-secondary),0.18),rgba(var(--overlay-glow-primary),0.12))]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                Remaining
              </p>
              <p className="mt-1.5 truncate font-display text-[20px] leading-tight font-bold text-[var(--text-primary)]">
                {reportData.remainingBudget === null
                  ? "Belum diatur"
                  : formatCurrency(reportData.remainingBudget)}
              </p>
              <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[var(--text-secondary)]">
                {reportData.totalBudget === null
                  ? "Budget bulan ini belum dipasang."
                  : `Dari ${formatCurrency(reportData.totalBudget)} yang kamu set.`}
              </p>
            </Card>

            <Card>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                Top category
              </p>
              <p className="mt-1.5 truncate text-[15px] font-bold text-[var(--text-primary)]">
                {reportData.topCategory?.category ?? "Belum ada"}
              </p>
              <p className="mt-1 text-[11px] leading-4 text-[var(--text-secondary)]">
                {reportData.topCategory
                  ? formatCurrency(reportData.topCategory.total)
                  : "Muncul setelah ada transaksi."}
              </p>
            </Card>

            <Card>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                Biggest tx
              </p>
              <p className="mt-1.5 truncate text-[15px] font-bold text-[var(--text-primary)]">
                {reportData.biggestTransaction?.detail ?? "Belum ada"}
              </p>
              <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[var(--text-secondary)]">
                {reportData.biggestTransaction
                  ? `${formatCurrency(reportData.biggestTransaction.nominal)} · ${formatDateLabel(reportData.biggestTransaction.date)}`
                  : "Otomatis kebaca di sini."}
              </p>
            </Card>
          </section>

          <Card
            title="Ringkasan target tabungan"
            subtitle="Progress total target aktif atau selesai."
          >
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between gap-2 text-[12px]">
                  <span className="font-semibold text-[var(--text-primary)]">
                    {reportData.savingGoalsSummary.itemLabel}
                  </span>
                  <span className="text-[var(--text-secondary)]">
                    {reportData.savingGoalsSummary.targetAmount > 0
                      ? `${Math.round(reportData.savingGoalsSummary.percentage * 100)}%`
                      : "0%"}
                  </span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-[var(--bg-card-soft)]">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent-secondary),var(--accent-primary))]"
                    style={{
                      width: `${Math.min(
                        Math.max(reportData.savingGoalsSummary.percentage * 100, 0),
                        100,
                      )}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-[11px] leading-4 text-[var(--text-secondary)]">
                  {reportData.savingGoalsSummary.targetAmount > 0
                    ? `${formatCurrency(reportData.savingGoalsSummary.savedAmount)} / ${formatCurrency(reportData.savingGoalsSummary.targetAmount)} sudah terkumpul.`
                    : "Belum ada target tabungan untuk diringkas."}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-card-soft)] p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Aktif
                  </p>
                  <p className="mt-1 text-[13px] font-bold text-[var(--text-primary)]">
                    {reportData.savingGoalsSummary.activeCount}
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-card-soft)] p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Selesai
                  </p>
                  <p className="mt-1 text-[13px] font-bold text-[var(--text-primary)]">
                    {reportData.savingGoalsSummary.completedCount}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <AIReflectionCard
            activeCharacterId={settings?.activeCharacterId}
            month={selectedMonth}
            transactions={monthTransactions}
            aiEnabled={settings?.aiEnabled ?? false}
          />

          <Suspense
            fallback={
              <Card
                title="Menyiapkan chart"
                subtitle="Bagian visualnya lagi dibuka dulu biar halaman awal tetap ringan."
              >
                <div className="h-52 animate-pulse rounded-2xl bg-[var(--bg-card-soft)]" />
              </Card>
            }
          >
            <ReportChartsSection reportData={reportData} />
          </Suspense>
        </>
      ) : (
        <Card
          title="Laporan masih kosong"
          subtitle="Begitu ada transaksi atau budget bulan ini, recap-nya muncul di sini."
        >
          <div className="space-y-3">
            <p className="text-[12px] leading-5 text-[var(--text-secondary)]">
              Mulai dari satu transaksi kecil dulu juga cukup. Laporan akan ikut kebentuk pelan-pelan.
            </p>
            <Link
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[var(--accent-primary)] px-4 text-[13px] font-bold text-[var(--text-on-accent)]"
              to="/transactions"
            >
              Buka Transaksi
            </Link>
          </div>
        </Card>
      )}
    </PageWrapper>
  );
}
