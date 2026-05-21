import { PageWrapper } from "../components/layout/PageWrapper";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export function TargetPage() {
  return (
    <PageWrapper
      title="Target"
      description="Area target tabungan sudah disiapkan, tapi CRUD-nya belum masuk sprint ini."
    >
      <Card title="Belum ada target">
        <p className="mb-4 text-sm leading-6 text-[var(--text-secondary)]">
          Ada sesuatu yang lagi kamu pengen wujudkan?
        </p>
        <Button>Buat Target</Button>
      </Card>
    </PageWrapper>
  );
}
