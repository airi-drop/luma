import { useMemo, useRef, useState, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link } from "react-router-dom";
import { MonthlyRecapExport } from "../components/reports/MonthlyRecapExport";
import { PageWrapper } from "../components/layout/PageWrapper";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import {
  exportMonthlyReportPdf,
  exportMonthlySpreadsheetCsv,
  exportMonthlySpreadsheetXlsx,
} from "../features/reports/export";
import { buildMonthlyReportData } from "../features/reports/reporting";
import { formatCurrency } from "../lib/currency";
import { formatDateLabel } from "../lib/date";
import { useBudgetsStore } from "../stores/budgets.store";
import { useSavingGoalsStore } from "../stores/saving-goals.store";
import { useTransactionsStore } from "../stores/transactions.store";
import { useUiStore } from "../stores/ui.store";

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <Card title={title} subtitle={subtitle}>
      <div className="h-64">{children}</div>
    </Card>
  );
}

export function ReportsPage() {
  const reportRef = useRef<HTMLDivElement | null>(null);
  const selectedMonth = useUiStore((state) => state.selectedMonth);
  const setSelectedMonth = useUiStore((state) => state.setSelectedMonth);
  const monthTransactions = useTransactionsStore((state) => state.items);
  const monthlyBudget = useBudgetsStore((state) => state.monthlyBudget);
  const categoryBudgets = useBudgetsStore((state) => state.categoryBudgets);
  const savingGoals = useSavingGoalsStore((state) => state.goals);
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
    if (!reportRef.current) {
      return;
    }

    setIsExportingPdf(true);

    try {
      await exportMonthlyReportPdf(selectedMonth, reportRef.current);
    } finally {
      setIsExportingPdf(false);
    }
  }

  async function handleExportXlsx() {
    setIsExportingXlsx(true);

    try {
      await exportMonthlySpreadsheetXlsx(selectedMonth);
    } finally {
      setIsExportingXlsx(false);
    }
  }

  async function handleExportCsv() {
    setIsExportingCsv(true);

    try {
      await exportMonthlySpreadsheetCsv(selectedMonth);
    } finally {
      setIsExportingCsv(false);
    }
  }

  return (
    <PageWrapper
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

      <MonthlyRecapExport data={reportData} ref={reportRef} />

      <Card
        title="Ekspor bulan ini"
        subtitle="Unduh recap visual atau spreadsheet mentah kalau mau dicek lagi di luar app."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <Button disabled={!hasReportContent || isExportingPdf} onClick={handleExportPdf} variant="secondary">
            {isExportingPdf ? "Membuat PDF..." : "Download PDF"}
          </Button>
          <Button disabled={!hasReportContent || isExportingXlsx} onClick={handleExportXlsx} variant="secondary">
            {isExportingXlsx ? "Membuat XLSX..." : "Export .xlsx"}
          </Button>
          <Button disabled={!hasReportContent || isExportingCsv} onClick={handleExportCsv} variant="secondary">
            {isExportingCsv ? "Membuat CSV..." : "Export .csv"}
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <Card title="Menyiapkan laporan">
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Sebentar ya, laporan bulan ini lagi dirapihin dulu.
          </p>
        </Card>
      ) : reportError ? (
        <Card title="Laporan belum kebuka">
          <p className="text-sm leading-6 text-[var(--danger-soft)]">{reportError}</p>
        </Card>
      ) : hasReportContent ? (
        <>
          <section className="grid gap-3 sm:grid-cols-2">
            <Card className="bg-[linear-gradient(155deg,rgba(232,168,87,0.18),rgba(143,184,150,0.12))]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Total spending
              </p>
              <p className="mt-3 font-display text-[30px] leading-none font-bold text-[var(--text-primary)]">
                {formatCurrency(reportData.totalSpending)}
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                Semua pengeluaran yang tercatat di {reportData.monthLabel.toLowerCase()}.
              </p>
            </Card>

            <Card className="bg-[linear-gradient(155deg,rgba(143,184,150,0.16),rgba(255,243,220,0.08))]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Remaining budget
              </p>
              <p className="mt-3 font-display text-[30px] leading-none font-bold text-[var(--text-primary)]">
                {reportData.remainingBudget === null
                  ? "Belum diatur"
                  : formatCurrency(reportData.remainingBudget)}
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                {reportData.totalBudget === null
                  ? "Budget bulanan belum dipasang untuk bulan ini."
                  : `Dari total ${formatCurrency(reportData.totalBudget)} yang kamu set.`}
              </p>
            </Card>

            <Card>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Top category
              </p>
              <p className="mt-3 text-xl font-bold text-[var(--text-primary)]">
                {reportData.topCategory?.category ?? "Belum ada"}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                {reportData.topCategory
                  ? formatCurrency(reportData.topCategory.total)
                  : "Nanti muncul begitu sudah ada transaksi."}
              </p>
            </Card>

            <Card>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Biggest transaction
              </p>
              <p className="mt-3 text-xl font-bold text-[var(--text-primary)]">
                {reportData.biggestTransaction?.detail ?? "Belum ada"}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                {reportData.biggestTransaction
                  ? `${formatCurrency(reportData.biggestTransaction.nominal)} · ${formatDateLabel(reportData.biggestTransaction.date)}`
                  : "Transaksi terbesarmu akan kebaca otomatis di sini."}
              </p>
            </Card>
          </section>

          <Card
            title="Ringkasan target tabungan"
            subtitle="Progress total target yang masih aktif atau sudah selesai."
          >
            <div className="grid gap-4 sm:grid-cols-[1.3fr_0.7fr]">
              <div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-[var(--text-primary)]">
                    {reportData.savingGoalsSummary.itemLabel}
                  </span>
                  <span className="text-[var(--text-secondary)]">
                    {reportData.savingGoalsSummary.targetAmount > 0
                      ? `${Math.round(reportData.savingGoalsSummary.percentage * 100)}%`
                      : "0%"}
                  </span>
                </div>
                <div className="mt-3 h-3 rounded-full bg-[rgba(255,243,220,0.08)]">
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
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                  {reportData.savingGoalsSummary.targetAmount > 0
                    ? `${formatCurrency(reportData.savingGoalsSummary.savedAmount)} dari ${formatCurrency(reportData.savingGoalsSummary.targetAmount)} sudah terkumpul.`
                    : "Belum ada target tabungan yang aktif atau selesai untuk diringkas."}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[22px] border border-[var(--border-soft)] bg-[var(--bg-card-soft)] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    Aktif
                  </p>
                  <p className="mt-2 text-lg font-bold text-[var(--text-primary)]">
                    {reportData.savingGoalsSummary.activeCount}
                  </p>
                </div>
                <div className="rounded-[22px] border border-[var(--border-soft)] bg-[var(--bg-card-soft)] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    Selesai
                  </p>
                  <p className="mt-2 text-lg font-bold text-[var(--text-primary)]">
                    {reportData.savingGoalsSummary.completedCount}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <ChartCard
            subtitle="Biar cepat kebaca kategori mana yang paling banyak kepakai."
            title="Category breakdown"
          >
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Pie
                  cx="50%"
                  cy="50%"
                  data={reportData.categoryBreakdown}
                  dataKey="total"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={3}
                >
                  {reportData.categoryBreakdown.map((item) => (
                    <Cell fill={item.color} key={item.category} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value ?? 0))}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid gap-2">
              {reportData.categoryBreakdown.slice(0, 5).map((item) => (
                <div
                  key={item.category}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--bg-card-soft)] px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-semibold text-[var(--text-primary)]">
                      {item.category}
                    </span>
                  </div>
                  <span className="text-[var(--text-secondary)]">
                    {formatCurrency(item.total)}
                  </span>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard
            subtitle="Grafik harian biar ritme pengeluaran bulan ini lebih gampang dilihat."
            title="Spending trend"
          >
            <ResponsiveContainer height="100%" width="100%">
              <AreaChart data={reportData.spendingTrend}>
                <defs>
                  <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#E8A857" stopOpacity={0.55} />
                    <stop offset="95%" stopColor="#E8A857" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,243,220,0.08)" strokeDasharray="3 3" />
                <XAxis
                  axisLine={false}
                  dataKey="label"
                  minTickGap={18}
                  tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                  tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
                  tickLine={false}
                  width={42}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value ?? 0))}
                  labelFormatter={(label) => `Tanggal ${label}`}
                />
                <Area
                  dataKey="total"
                  fill="url(#trendFill)"
                  stroke="#E8A857"
                  strokeWidth={3}
                  type="monotone"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            subtitle="Perbandingan limit dan pemakaian budget bulan ini."
            title="Budget comparison"
          >
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={reportData.budgetComparison}>
                <CartesianGrid stroke="rgba(255,243,220,0.08)" strokeDasharray="3 3" />
                <XAxis
                  axisLine={false}
                  dataKey="label"
                  tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                  tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
                  tickLine={false}
                  width={42}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value ?? 0))}
                />
                <Bar dataKey="limit" fill="rgba(255,243,220,0.18)" radius={[10, 10, 0, 0]} />
                <Bar dataKey="used" radius={[10, 10, 0, 0]}>
                  {reportData.budgetComparison.map((item) => (
                    <Cell fill={item.color} key={item.label} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </>
      ) : (
        <Card
          title="Laporan masih kosong"
          subtitle="Begitu ada transaksi atau budget bulan ini, recap-nya langsung muncul di sini."
        >
          <div className="space-y-4">
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              Mulai dari satu transaksi kecil dulu juga cukup. Laporan akan ikut kebentuk pelan-pelan.
            </p>
            <Link
              className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[var(--accent-primary)] px-5 text-sm font-bold text-[var(--text-on-accent)]"
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
