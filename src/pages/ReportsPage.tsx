import { PageWrapper } from "../components/layout/PageWrapper";
import { Card } from "../components/ui/Card";

export function ReportsPage() {
  return (
    <PageWrapper
      title="Laporan"
      description="Nanti laporan tetap dibuat readable, bukan dashboard yang padat."
    >
      <Card title="Ringkasan bulan ini">
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          Charts, export, dan insight belum diimplementasi di sprint ini.
        </p>
      </Card>
    </PageWrapper>
  );
}
