import { PageWrapper } from "../components/layout/PageWrapper";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";

export function TransactionsPage() {
  return (
    <PageWrapper
      title="Transaksi"
      description="Halaman ini disiapkan lebih clean supaya data nanti gampang discan."
    >
      <Card title="Cari transaksi">
        <Input
          label="Cari detail"
          placeholder="Misal: kopi, bensin, album"
          hint="Search, filter, dan edit masuk sprint berikutnya."
        />
      </Card>

      <Card title="Belum ada transaksi">
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          Nanti list transaksi bulanan bakal muncul di sini.
        </p>
      </Card>
    </PageWrapper>
  );
}
