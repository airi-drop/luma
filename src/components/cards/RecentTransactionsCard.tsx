import { Card } from "../ui/Card";
import { formatCurrency } from "../../lib/currency";
import type { Transaction } from "../../types";

interface RecentTransactionsCardProps {
  items: Transaction[];
}

export function RecentTransactionsCard({
  items,
}: RecentTransactionsCardProps) {
  return (
    <Card
      title="Transaksi terbaru"
      subtitle="Catatan terakhir biar tetap kebaca cepat dari Home."
    >
      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((transaction) => (
            <article
              key={transaction.id}
              className="flex items-start justify-between gap-3 rounded-[24px] border border-[var(--border-soft)] bg-[var(--bg-card-soft)] p-4"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-[var(--text-primary)]">
                    {transaction.detail}
                  </p>
                  <span className="rounded-full bg-[rgba(232,168,87,0.14)] px-2.5 py-1 text-[11px] font-semibold text-[var(--accent-soft)]">
                    {transaction.category}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  {transaction.account} · {transaction.date}
                </p>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  {transaction.source}
                  {transaction.mood ? ` · ${transaction.mood}` : ""}
                </p>
              </div>
              <p className="shrink-0 text-sm font-bold text-[var(--text-primary)]">
                {formatCurrency(transaction.nominal)}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-[var(--border-soft)] bg-[var(--bg-card-soft)] p-4">
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Belum ada catatan hari ini. Yuk mulai dari satu transaksi kecil dulu.
          </p>
        </div>
      )}
    </Card>
  );
}
