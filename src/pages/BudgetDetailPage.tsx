import { Link } from "react-router-dom";
import { PageWrapper } from "../components/layout/PageWrapper";
import { Card } from "../components/ui/Card";
import { useBudgetsStore } from "../stores/budgets.store";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function BudgetDetailPage() {
  const monthlyBudget = useBudgetsStore((state) => state.monthlyBudget);
  const budgetUsage = useBudgetsStore((state) => state.budgetUsage);
  const categoryUsages = useBudgetsStore((state) => state.categoryUsages);

  return (
    <PageWrapper
      title="Budget Detail"
      description="Akses budget tetap lewat Home sesuai flow yang sudah ditetapkan."
      withBottomNav={false}
      headerAction={
        <Link
          to="/home"
          className="inline-flex min-h-11 items-center rounded-full border border-[var(--border-soft)] bg-[var(--bg-card)] px-4 text-sm font-semibold text-[var(--text-secondary)]"
        >
          Kembali
        </Link>
      }
    >
      <Card title="Budget bulanan">
        <div className="space-y-3">
          <p className="font-display text-4xl font-bold">
            {monthlyBudget ? formatCurrency(monthlyBudget.totalBudget) : "Belum diatur"}
          </p>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            {budgetUsage
              ? `Sisa ${formatCurrency(budgetUsage.remaining)} dari ${formatCurrency(
                  budgetUsage.limit,
                )}.`
              : "Detail budget dan kategori sudah siap di data layer, UI editornya masuk sprint budgeting."}
          </p>
          <button
            type="button"
            className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--bg-card-soft)] px-5 text-sm font-bold text-[var(--text-primary)]"
          >
            Tambah Budget
          </button>
        </div>
      </Card>

      <Card title="Budget kategori">
        {categoryUsages.length > 0 ? (
          <div className="space-y-3 text-sm text-[var(--text-secondary)]">
            {categoryUsages.map(({ budget, usage }) => (
              <div key={budget.id} className="rounded-3xl border border-[var(--border-soft)] bg-[var(--bg-card-soft)] p-4">
                <p className="font-semibold text-[var(--text-primary)]">{budget.category}</p>
                <p>
                  {formatCurrency(usage.used)} / {formatCurrency(usage.limit)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Belum ada budget kategori yang tersimpan.
          </p>
        )}
      </Card>
    </PageWrapper>
  );
}
