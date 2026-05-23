import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddEditBudgetSheet, type BudgetSheetMode } from "../components/sheets/AddEditBudgetSheet";
import { PageWrapper } from "../components/layout/PageWrapper";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { formatCurrency } from "../lib/currency";
import { generateSoftWarnings } from "../features/budgets/warnings";
import { getCategoryEmoji, getCategoryLabel } from "../features/budgets/meta";
import { useBudgetsStore } from "../stores/budgets.store";
import { useUiStore } from "../stores/ui.store";
import type { CategoryType } from "../types";

function BudgetProgressBar({ percentage }: { percentage: number }) {
  const toneClass =
    percentage >= 1
      ? "bg-[var(--danger-soft)]"
      : percentage >= 0.75
        ? "bg-[var(--warning-soft)]"
        : "bg-[linear-gradient(90deg,var(--accent-primary),var(--accent-secondary))]";
  const width = `${Math.min(Math.max(percentage, 0), 1) * 100}%`;

  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-[var(--bg-card-soft)]">
      <div className={["h-full rounded-full", toneClass].join(" ")} style={{ width }} />
    </div>
  );
}

interface SheetState {
  mode: BudgetSheetMode;
  category?: CategoryType;
  currentLimit?: number;
}

export function BudgetDetailPage() {
  const navigate = useNavigate();
  const month = useBudgetsStore((state) => state.month);
  const monthlyBudget = useBudgetsStore((state) => state.monthlyBudget);
  const budgetUsage = useBudgetsStore((state) => state.budgetUsage);
  const categoryUsages = useBudgetsStore((state) => state.categoryUsages);
  const upsertMonthlyBudget = useBudgetsStore((state) => state.upsertMonthlyBudget);
  const upsertCategoryBudget = useBudgetsStore((state) => state.upsertCategoryBudget);
  const showToast = useUiStore((state) => state.showToast);
  const [sheetState, setSheetState] = useState<SheetState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const warnings = useMemo(
    () => generateSoftWarnings(categoryUsages),
    [categoryUsages],
  );
  const warningMap = useMemo(
    () =>
      new Map(warnings.map((warning) => [warning.category, warning.message])),
    [warnings],
  );

  function openMonthlySheet() {
    setSheetState({
      mode: "monthly",
      currentLimit: monthlyBudget?.totalBudget,
    });
  }

  function openCategorySheet(category?: CategoryType, currentLimit?: number) {
    setSheetState({
      mode: "category",
      category,
      currentLimit,
    });
  }

  async function handleSubmit(input: {
    mode: BudgetSheetMode;
    nominal: number;
    category?: CategoryType;
  }) {
    setIsSubmitting(true);

    try {
      if (input.mode === "monthly") {
        await upsertMonthlyBudget(input.nominal);
      } else if (input.category) {
        await upsertCategoryBudget(input.category, input.nominal, true);
      }

      setSheetState(null);
      showToast({
        message: "Budget tersimpan ya ✨",
        tone: "success",
      });
    } catch (error) {
      showToast({
        message:
          error instanceof Error
            ? error.message
            : "Gagal nyimpen budget, coba sekali lagi ya.",
        tone: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageWrapper
      description={`Ringkasan budget ${month} biar tetap enak dipantau pelan-pelan.`}
      title="Budget Bulan Ini"
      withBottomNav={false}
      headerAction={
        <button
          className="inline-flex min-h-11 items-center rounded-full border border-[var(--border-soft)] bg-[var(--bg-card)] px-4 text-sm font-semibold text-[var(--text-secondary)]"
          onClick={() => navigate("/home")}
          type="button"
        >
          Kembali
        </button>
      }
    >
      <Card className="overflow-hidden bg-[linear-gradient(150deg,rgba(var(--overlay-glow-primary),0.22),rgba(var(--overlay-glow-secondary),0.16))]">
        {monthlyBudget && budgetUsage ? (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                  Total budget
                </p>
                <p className="truncate font-display text-[24px] leading-tight font-bold text-[var(--text-primary)]">
                  {formatCurrency(monthlyBudget.totalBudget)}
                </p>
                <p className="line-clamp-2 text-[12px] leading-5 text-[var(--text-secondary)]">
                  {budgetUsage.remaining >= 0
                    ? `Masih ada ${formatCurrency(budgetUsage.remaining)} buat sisa bulan ini.`
                    : `Sudah lewat ${formatCurrency(Math.abs(budgetUsage.remaining))} dari batas bulan ini.`}
                </p>
              </div>
              <button
                className="inline-flex min-h-9 items-center rounded-full border border-[var(--border-soft)] bg-[var(--bg-card-soft)] px-3 text-[12px] font-semibold text-[var(--text-primary)]"
                onClick={openMonthlySheet}
                type="button"
              >
                Edit
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-card-soft)] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                  Terpakai
                </p>
                <p className="mt-1 text-[13px] font-bold text-[var(--text-primary)]">
                  {formatCurrency(budgetUsage.used)}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-card-soft)] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                  Sisa
                </p>
                <p className="mt-1 text-[13px] font-bold text-[var(--text-primary)]">
                  {formatCurrency(budgetUsage.remaining)}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-[12px]">
                <span className="text-[var(--text-secondary)]">Progress bulanan</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {Math.round(budgetUsage.percentage * 100)}%
                </span>
              </div>
              <BudgetProgressBar percentage={budgetUsage.percentage} />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                Budget bulanan
              </p>
              <p className="font-display text-3xl font-bold text-[var(--text-primary)]">
                Belum ada budget bulan ini.
              </p>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                Kalau mau, pasang batas nyaman dulu biar sisa uangnya lebih gampang kebaca.
              </p>
            </div>
            <Button variant="secondary" onClick={openMonthlySheet}>
              Atur Budget Bulanan
            </Button>
          </div>
        )}
      </Card>

      <Card
        title="Budget per Kategori"
        subtitle="Set satu-satu sesuai ritme pengeluaran yang pengen kamu jagain."
      >
        {categoryUsages.length > 0 ? (
          <div className="space-y-4">
            {categoryUsages.map(({ budget, usage }) => (
              <button
                key={budget.id}
                className="w-full rounded-[24px] border border-[var(--border-soft)] bg-[var(--bg-card-soft)] p-4 text-left"
                onClick={() => openCategorySheet(budget.category, budget.limit)}
                type="button"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent-surface)] text-lg">
                        {getCategoryEmoji(budget.category)}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold capitalize text-[var(--text-primary)]">
                          {getCategoryLabel(budget.category)}
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {formatCurrency(usage.used)} / {formatCurrency(budget.limit)}
                        </p>
                      </div>
                    </div>
                    <BudgetProgressBar percentage={usage.percentage} />
                    {warningMap.has(budget.category) ? (
                      <p className="rounded-2xl bg-[rgba(232,168,87,0.12)] px-3 py-2 text-xs leading-5 text-[var(--text-secondary)]">
                        {warningMap.get(budget.category)}
                      </p>
                    ) : null}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-[var(--text-primary)]">
                      {Math.round(usage.percentage * 100)}%
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {usage.remaining >= 0
                        ? `Sisa ${formatCurrency(usage.remaining)}`
                        : `Lewat ${formatCurrency(Math.abs(usage.remaining))}`}
                    </p>
                  </div>
                </div>
              </button>
            ))}

            <Button
              fullWidth
              variant="secondary"
              onClick={() => openCategorySheet()}
            >
              Tambah Budget Kategori
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              Belum ada budget kategori. Yuk atur supaya lebih terkontrol 💫
            </p>
            <Button variant="secondary" onClick={() => openCategorySheet()}>
              Tambah Budget Kategori
            </Button>
          </div>
        )}
      </Card>

      <AddEditBudgetSheet
        initialCategory={sheetState?.category}
        initialLimit={sheetState?.currentLimit}
        isOpen={sheetState !== null}
        isSubmitting={isSubmitting}
        mode={sheetState?.mode ?? "monthly"}
        onClose={() => setSheetState(null)}
        onSubmit={handleSubmit}
      />
    </PageWrapper>
  );
}
