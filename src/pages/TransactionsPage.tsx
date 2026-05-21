import { PageWrapper } from "../components/layout/PageWrapper";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { formatCurrency } from "../lib/currency";
import { useTransactionsStore } from "../stores/transactions.store";

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
          disabled
          label="Cari detail"
          placeholder="Misal: kopi, bensin, album"
          hint="Search, filter, dan edit masuk sprint berikutnya."
        />
      </Card>

      <Card title={items.length > 0 ? "Data bulan ini" : "Belum ada transaksi"}>
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          {items.length > 0
            ? `${items.length} transaksi tersimpan. Hari ini ${formatCurrency(todayTotal)}, total bulan ini ${formatCurrency(monthlyTotal)}.`
            : "Belum ada transaksi bulan ini. Catatan yang kamu simpan manual nanti muncul di sini."}
        </p>
        {items.length > 0 ? (
          <div className="mt-4 space-y-3">
            {items.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-start justify-between gap-3 rounded-3xl border border-[var(--border-soft)] bg-[var(--bg-card-soft)] p-4"
              >
                <div className="space-y-1">
                  <p className="font-semibold text-[var(--text-primary)]">
                    {transaction.detail}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {transaction.category} · {transaction.account}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {transaction.date}
                    {transaction.mood ? ` · ${transaction.mood}` : ""}
                    {transaction.note ? ` · ${transaction.note}` : ""}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-bold text-[var(--text-primary)]">
                  {formatCurrency(transaction.nominal)}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </Card>
    </PageWrapper>
  );
}
