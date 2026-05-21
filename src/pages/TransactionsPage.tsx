import { useEffect, useState } from "react";
import { TransactionDetailSheet } from "../components/sheets/TransactionDetailSheet";
import { PageWrapper } from "../components/layout/PageWrapper";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { formatCurrency } from "../lib/currency";
import { formatDateLabel, formatMonthLabel } from "../lib/date";
import { useTransactionsStore } from "../stores/transactions.store";
import { useUiStore } from "../stores/ui.store";
import {
  ACCOUNT_TYPES,
  CATEGORY_TYPES,
  type AccountType,
  type CategoryType,
  type Transaction,
} from "../types";

type SortOption = "terbaru" | "terlama" | "terbesar" | "terkecil";

function FilterSelect({
  label,
  options,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const inputId = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label className="flex flex-col gap-2" htmlFor={inputId}>
      <span className="text-sm font-semibold text-[var(--text-secondary)]">
        {label}
      </span>
      <select
        className="min-h-14 rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-card-soft)] px-4 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-primary)]"
        id={inputId}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function compareTransactions(left: Transaction, right: Transaction, sort: SortOption) {
  if (sort === "terlama") {
    return (
      left.date.localeCompare(right.date) ||
      left.createdAt.localeCompare(right.createdAt)
    );
  }

  if (sort === "terbesar") {
    return (
      right.nominal - left.nominal ||
      right.date.localeCompare(left.date) ||
      right.createdAt.localeCompare(left.createdAt)
    );
  }

  if (sort === "terkecil") {
    return (
      left.nominal - right.nominal ||
      right.date.localeCompare(left.date) ||
      right.createdAt.localeCompare(left.createdAt)
    );
  }

  return (
    right.date.localeCompare(left.date) ||
    right.createdAt.localeCompare(left.createdAt)
  );
}

function groupTransactionsByMonth(
  transactions: Transaction[],
  sort: SortOption,
) {
  const groups = transactions.reduce<Record<string, Transaction[]>>(
    (accumulator, transaction) => {
      if (!accumulator[transaction.month]) {
        accumulator[transaction.month] = [];
      }

      accumulator[transaction.month].push(transaction);
      return accumulator;
    },
    {},
  );

  return Object.entries(groups)
    .sort(([leftMonth], [rightMonth]) => rightMonth.localeCompare(leftMonth))
    .map(([month, items]) => ({
      month,
      items: [...items].sort((left, right) =>
        compareTransactions(left, right, sort),
      ),
      total: items.reduce((sum, item) => sum + item.nominal, 0),
    }));
}

export function TransactionsPage() {
  const openBottomSheet = useUiStore((state) => state.openBottomSheet);
  const loadAll = useTransactionsStore((state) => state.loadAll);
  const allItems = useTransactionsStore((state) => state.allItems);
  const isLoadingAll = useTransactionsStore((state) => state.isLoadingAll);
  const error = useTransactionsStore((state) => state.error);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("terbaru");
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const selectedTransaction =
    allItems.find((item) => item.id === selectedTransactionId) ?? null;

  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = allItems.filter((item) => {
    const matchesQuery = normalizedQuery
      ? item.detail.toLowerCase().includes(normalizedQuery)
      : true;
    const matchesCategory = selectedCategory
      ? item.category === (selectedCategory as CategoryType)
      : true;
    const matchesAccount = selectedAccount
      ? item.account === (selectedAccount as AccountType)
      : true;

    return matchesQuery && matchesCategory && matchesAccount;
  });

  const groupedItems = groupTransactionsByMonth(filteredItems, sortOption);
  const filteredTotal = filteredItems.reduce(
    (sum, transaction) => sum + transaction.nominal,
    0,
  );

  return (
    <PageWrapper
      title="Transaksi"
      description="Lebih rapi dan fokus supaya catatanmu gampang dicari, disaring, lalu diedit kalau perlu."
    >
      <Card title="Cari dan saring">
        <div className="space-y-4">
          <Input
            label="Cari detail"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Misal: kopi, bensin, album"
            value={query}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FilterSelect
              label="Kategori"
              onChange={setSelectedCategory}
              options={CATEGORY_TYPES}
              placeholder="Semua kategori"
              value={selectedCategory}
            />
            <FilterSelect
              label="Akun"
              onChange={setSelectedAccount}
              options={ACCOUNT_TYPES}
              placeholder="Semua akun"
              value={selectedAccount}
            />
          </div>
          <FilterSelect
            label="Urutkan"
            onChange={(value) => setSortOption(value as SortOption)}
            options={["terbaru", "terlama", "terbesar", "terkecil"]}
            placeholder="Pilih urutan"
            value={sortOption}
          />
        </div>
      </Card>

      <Card
        title="Ringkasan hasil"
        subtitle="Daftar ini menampilkan semua transaksi yang sudah tersimpan di perangkatmu."
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--bg-card-soft)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Total transaksi
            </p>
            <p className="mt-2 text-lg font-bold text-[var(--text-primary)]">
              {filteredItems.length}
            </p>
          </div>
          <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--bg-card-soft)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Total nominal
            </p>
            <p className="mt-2 text-lg font-bold text-[var(--text-primary)]">
              {formatCurrency(filteredTotal)}
            </p>
          </div>
        </div>
      </Card>

      <Card
        title={filteredItems.length > 0 ? "Riwayat transaksi" : "Belum ada yang cocok"}
        subtitle={
          filteredItems.length > 0
            ? "Tap salah satu transaksi untuk lihat detail, edit, atau hapus."
            : "Coba longgarkan pencarian atau mulai catat transaksi baru dari sini."
        }
      >
        {isLoadingAll ? (
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Lagi memuat catatanmu sebentar ya...
          </p>
        ) : error ? (
          <p className="text-sm leading-6 text-[var(--danger-soft)]">{error}</p>
        ) : filteredItems.length > 0 ? (
          <div className="space-y-5">
            {groupedItems.map((group) => (
              <section key={group.month} className="space-y-3">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                      {formatMonthLabel(group.month)}
                    </h2>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {group.items.length} transaksi · {formatCurrency(group.total)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {group.items.map((transaction) => (
                    <button
                      key={transaction.id}
                      className="flex w-full items-start justify-between gap-3 rounded-3xl border border-[var(--border-soft)] bg-[var(--bg-card-soft)] p-4 text-left transition-colors hover:border-[var(--accent-primary)]"
                      onClick={() => setSelectedTransactionId(transaction.id)}
                      type="button"
                    >
                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-[var(--text-primary)]">
                            {transaction.detail}
                          </p>
                          <span className="rounded-full bg-[rgba(232,168,87,0.14)] px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                            {transaction.category}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {transaction.account}
                          {transaction.mood ? ` · ${transaction.mood}` : ""}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {formatDateLabel(transaction.date)}
                          {transaction.note ? ` · ${transaction.note}` : ""}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold text-[var(--text-primary)]">
                          {formatCurrency(transaction.nominal)}
                        </p>
                        <p className="mt-2 text-xs text-[var(--text-muted)]">
                          Lihat detail
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              Belum ada transaksi yang pas dengan filter ini. Mau catat transaksi
              baru dulu?
            </p>
            <Button fullWidth onClick={() => openBottomSheet("add-transaction")}>
              Tambah Transaksi
            </Button>
          </div>
        )}
      </Card>

      <TransactionDetailSheet
        isOpen={selectedTransaction !== null}
        onClose={() => setSelectedTransactionId(null)}
        transaction={selectedTransaction}
      />
    </PageWrapper>
  );
}
