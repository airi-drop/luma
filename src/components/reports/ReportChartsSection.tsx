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
import { useState, type ReactNode } from "react";
import type { MonthlyReportData } from "../../features/reports/reporting";
import { formatCurrency } from "../../lib/currency";
import { Card } from "../ui/Card";

interface ReportChartsSectionProps {
  reportData: MonthlyReportData;
}

type ReportChartTab = "category" | "trend" | "budget";

interface TooltipPayloadItem {
  name?: string;
  value?: number | string;
  color?: string;
  payload?: {
    label?: string;
  };
}

function ChartTooltip({
  active,
  label,
  payload,
  labelPrefix,
}: {
  active?: boolean;
  label?: string | number;
  payload?: TooltipPayloadItem[];
  labelPrefix?: string;
}) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="min-w-[132px] rounded-[18px] border border-[var(--border-soft)] bg-[color:var(--bg-elevated)]/96 px-3 py-2 shadow-[0_14px_28px_rgba(0,0,0,0.18)] backdrop-blur-md">
      <p className="ui-label font-semibold text-[var(--text-secondary)]">
        {labelPrefix ? `${labelPrefix} ${label}` : label}
      </p>
      <div className="mt-1.5 space-y-1.5">
        {payload.map((item, index) => (
          <div
            key={`${item.name ?? "item"}-${index}`}
            className="flex items-center justify-between gap-3 text-[12px]"
          >
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color ?? "var(--accent-primary)" }}
              />
              <span className="font-medium">
                {item.name ?? item.payload?.label ?? "Nilai"}
              </span>
            </div>
            <span className="font-semibold text-[var(--text-primary)]">
              {formatCurrency(Number(item.value ?? 0))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartSurface({ children, height = "h-52" }: { children: ReactNode; height?: string }) {
  return (
    <div
      className={[
        height,
        "overflow-hidden rounded-[18px] border border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(var(--overlay-base-rgb),0.54),rgba(var(--overlay-base-rgb),0.82))] px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function ReportChartsSection({ reportData }: ReportChartsSectionProps) {
  const [activeTab, setActiveTab] = useState<ReportChartTab>("category");
  const tabs: Array<{
    id: ReportChartTab;
    label: string;
    title: string;
    subtitle: string;
  }> = [
    {
      id: "category",
      label: "Kategori",
      title: "Category breakdown",
      subtitle: "Biar cepat kebaca kategori mana yang paling banyak kepakai.",
    },
    {
      id: "trend",
      label: "Tren",
      title: "Spending trend",
      subtitle: "Grafik harian biar ritme pengeluaran bulan ini lebih gampang dilihat.",
    },
    {
      id: "budget",
      label: "Budget",
      title: "Budget comparison",
      subtitle: "Perbandingan limit dan pemakaian budget bulan ini.",
    },
  ];
  const activeTabMeta = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <Card
      className="px-4 py-4"
      title="Visual laporan"
      subtitle={activeTabMeta.subtitle}
    >
      <div className="-mx-1 mb-2 overflow-x-auto pb-1">
        <div className="flex min-w-max gap-1.5 px-1">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                className={[
                  "min-h-[36px] rounded-full border px-3.5 text-[12px] font-semibold transition-[color,background-color,border-color,box-shadow] duration-150",
                  isActive
                    ? "border-[rgba(242,155,118,0.42)] bg-[linear-gradient(180deg,rgba(var(--overlay-glow-primary),0.18),rgba(var(--overlay-glow-secondary),0.08))] text-[var(--text-primary)] shadow-[inset_0_-2px_0_var(--accent-primary)]"
                    : "border-[var(--border-soft)] bg-[var(--bg-card-soft)]/76 text-[var(--text-secondary)]",
                ].join(" ")}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        {activeTabMeta.title}
      </p>

      {activeTab === "category" ? (
        <>
          <ChartSurface height="h-48">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Pie
                  cx="50%"
                  cy="50%"
                  data={reportData.categoryBreakdown}
                  dataKey="total"
                  innerRadius={50}
                  outerRadius={78}
                  paddingAngle={3}
                >
                  {reportData.categoryBreakdown.map((item) => (
                    <Cell fill={item.color} key={item.category} />
                  ))}
                </Pie>
                <Tooltip
                  content={<ChartTooltip labelPrefix="Kategori" />}
                  cursor={false}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartSurface>
          <div className="mt-2.5 grid gap-1.5">
            {reportData.categoryBreakdown.slice(0, 5).map((item) => (
              <div
                key={item.category}
                className="flex items-center justify-between gap-2 rounded-xl bg-[var(--bg-card-soft)] px-2.5 py-1.5 text-[12px]"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate font-semibold text-[var(--text-primary)]">
                    {item.category}
                  </span>
                </div>
                <span className="shrink-0 text-[var(--text-secondary)]">
                  {formatCurrency(item.total)}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {activeTab === "trend" ? (
        <>
          <ChartSurface height="h-48">
            <ResponsiveContainer height="100%" width="100%">
              <AreaChart data={reportData.spendingTrend}>
                <defs>
                  <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="4%" stopColor="#F29B76" stopOpacity={0.68} />
                    <stop offset="96%" stopColor="#F29B76" stopOpacity={0.08} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(122,90,72,0.22)" strokeDasharray="3 3" />
                <XAxis
                  axisLine={{ stroke: "rgba(122,90,72,0.18)" }}
                  dataKey="label"
                  minTickGap={18}
                  tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis
                  axisLine={{ stroke: "rgba(122,90,72,0.18)" }}
                  tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                  tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
                  tickLine={false}
                  width={42}
                />
                <Tooltip
                  content={<ChartTooltip labelPrefix="Tanggal" />}
                  cursor={{
                    stroke: "rgba(242,155,118,0.28)",
                    strokeWidth: 1.5,
                    strokeDasharray: "4 4",
                  }}
                />
                <Area
                  activeDot={{
                    fill: "#F29B76",
                    r: 4,
                    stroke: "rgba(255,245,236,0.85)",
                    strokeWidth: 2,
                  }}
                  dataKey="total"
                  fill="url(#trendFill)"
                  stroke="#F29B76"
                  strokeWidth={3.2}
                  type="monotone"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartSurface>
          <p className="mt-2 text-[11px] leading-4 text-[var(--text-secondary)]">
            Pola harian di {reportData.monthLabel.toLowerCase()} biar pengeluaran yang naik turun
            lebih gampang dilihat tanpa scroll panjang.
          </p>
        </>
      ) : null}

      {activeTab === "budget" ? (
        <>
          <ChartSurface height="h-48">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={reportData.budgetComparison}>
                <CartesianGrid stroke="rgba(122,90,72,0.22)" strokeDasharray="3 3" />
                <XAxis
                  axisLine={{ stroke: "rgba(122,90,72,0.18)" }}
                  dataKey="label"
                  tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis
                  axisLine={{ stroke: "rgba(122,90,72,0.18)" }}
                  tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                  tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
                  tickLine={false}
                  width={42}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: "rgba(122,90,72,0.06)" }}
                />
                <Bar dataKey="limit" fill="rgba(122,90,72,0.22)" radius={[10, 10, 0, 0]} />
                <Bar dataKey="used" radius={[10, 10, 0, 0]} strokeWidth={0}>
                  {reportData.budgetComparison.map((item) => (
                    <Cell fill={item.color} key={item.label} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartSurface>
          <div className="mt-2.5 grid gap-1.5">
            {reportData.budgetComparison.slice(0, 4).map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-2 rounded-xl bg-[var(--bg-card-soft)] px-2.5 py-1.5 text-[12px]"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate font-semibold text-[var(--text-primary)]">
                    {item.label}
                  </span>
                </div>
                <span className="shrink-0 text-[var(--text-secondary)]">
                  {formatCurrency(item.used)} / {formatCurrency(item.limit)}
                </span>
              </div>
            ))}
            {reportData.budgetComparison.length === 0 ? (
              <p className="text-[12px] leading-5 text-[var(--text-secondary)]">
                Begitu budget bulanan atau per kategori dipasang, perbandingannya muncul di sini.
              </p>
            ) : null}
          </div>
        </>
      ) : null}
    </Card>
  );
}
