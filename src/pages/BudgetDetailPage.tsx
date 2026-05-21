import { Link } from "react-router-dom";
import { PageWrapper } from "../components/layout/PageWrapper";
import { Card } from "../components/ui/Card";

export function BudgetDetailPage() {
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
          <p className="font-display text-4xl font-bold">Rp0</p>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Detail budget dan kategori masuk sprint budgeting.
          </p>
          <button
            type="button"
            className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--bg-card-soft)] px-5 text-sm font-bold text-[var(--text-primary)]"
          >
            Tambah Budget
          </button>
        </div>
      </Card>
    </PageWrapper>
  );
}
