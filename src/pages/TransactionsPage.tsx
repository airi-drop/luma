import { PageWrapper } from "../components/layout/PageWrapper";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useTransactionsStore } from "../stores/transactions.store";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function TransactionsPage() {
  const items = useTransactionsStore((state) => state.items);
  const todayTotal = useTransactionsStore((state) => state.todayTotal);
  const monthlyTotal = useTransactionsStore((state) => state.monthlyTotal);

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

      <Card title={items.length > 0 ? "Data bulan ini" : "Belum ada transaksi"}>
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          {items.length > 0
            ? `${items.length} transaksi tersimpan. Hari ini ${formatCurrency(todayTotal)}, total bulan ini ${formatCurrency(monthlyTotal)}.`
            : "Data layer transaksi sudah siap. List, filter, edit, dan delete masuk sprint berikutnya."}
        </p>
      </Card>
    </PageWrapper>
  );
}
