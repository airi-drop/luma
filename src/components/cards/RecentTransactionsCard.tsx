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
        <div className="space-y-2">
          {items.map((transaction) => (
            <article
              key={transaction.id}
              className="flex items-start justify-between gap-2 rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-card-soft)] p-3"
            >
              <div className="min-w-0 space-y-0.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="truncate text-[13px] font-semibold text-[var(--text-primary)]">
                    {transaction.detail}
                  </p>
                  <span className="rounded-full bg-[var(--accent-surface)] px-2 py-0.5 text-[10px] font-semibold text-[var(--accent-primary)]">
                    {transaction.category}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  {transaction.account} · {transaction.date}
                </p>
                <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  {transaction.source}
                  {transaction.mood ? ` · ${transaction.mood}` : ""}
                </p>
              </div>
              <p className="shrink-0 text-[13px] font-bold text-[var(--text-primary)]">
                {formatCurrency(transaction.nominal)}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--border-soft)] bg-[var(--bg-card-soft)] p-3">
          <p className="text-[12px] leading-5 text-[var(--text-secondary)]">
            Belum ada catatan hari ini. Yuk mulai dari satu transaksi kecil dulu.
          </p>
        </div>
      )}
    </Card>
  );
}
