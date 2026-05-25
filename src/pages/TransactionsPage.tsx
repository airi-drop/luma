import { useEffect, useMemo, useState } from "react";
import { TransactionDetailSheet } from "../components/sheets/TransactionDetailSheet";
import { PageWrapper } from "../components/layout/PageWrapper";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import {
  getCharacterById,
  getCharacterCompanionLine,
} from "../features/customization/presets";
import { formatCurrency } from "../lib/currency";
import { formatDateLabel, formatMonthLabel } from "../lib/date";
import { useSettingsStore } from "../stores/settings.store";
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
    <label
      className="flex flex-col"
      htmlFor={inputId}
      style={{ gap: "var(--space-2)" }}
    >
      <span className="ui-label font-semibold text-[var(--text-secondary)]">
        {label}
      </span>
      <select
        className="min-h-11 rounded-[var(--radius-field)] border border-[var(--border-soft)] bg-[var(--bg-card-soft)] px-3 text-[12px] text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-primary)]"
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

function groupTransactionsByMonth(transactions: Transaction[], sort: SortOption) {
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
      items: [...items].sort((left, right) => compareTransactions(left, right, sort)),
      total: items.reduce((sum, item) => sum + item.nominal, 0),
    }));
}

export function TransactionsPage() {
  const openBottomSheet = useUiStore((state) => state.openBottomSheet);
  const settings = useSettingsStore((state) => state.settings);
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
  const [visibleCount, setVisibleCount] = useState(120);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const selectedTransaction = useMemo(
    () => allItems.find((item) => item.id === selectedTransactionId) ?? null,
    [allItems, selectedTransactionId],
  );

  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = useMemo(
    () =>
      allItems.filter((item) => {
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
      }),
    [allItems, normalizedQuery, selectedAccount, selectedCategory],
  );
  const groupedItems = useMemo(
    () => groupTransactionsByMonth(filteredItems, sortOption),
    [filteredItems, sortOption],
  );
  const filteredTotal = useMemo(
    () => filteredItems.reduce((sum, transaction) => sum + transaction.nominal, 0),
    [filteredItems],
  );
  const visibleGroups = useMemo(() => {
    const visibleIds = new Set(
      groupedItems
        .flatMap((group) => group.items)
        .slice(0, visibleCount)
        .map((item) => item.id),
    );

    return groupedItems
      .map((group) => {
        const items = group.items.filter((item) => visibleIds.has(item.id));

        return {
          ...group,
          items,
          total: items.reduce((sum, item) => sum + item.nominal, 0),
        };
      })
      .filter((group) => group.items.length > 0);
  }, [groupedItems, visibleCount]);
  const hasMoreItems = filteredItems.length > visibleCount;
  const activeCharacter = getCharacterById(settings?.activeCharacterId);
  const emptyStateLine =
    getCharacterCompanionLine(settings?.activeCharacterId, "transactionsEmpty") ??
    "Belum ada transaksi yang pas. Mau mulai dari satu catatan kecil dulu?";

  return (
    <PageWrapper
      title="Transaksi"
      description="Lebih rapi dan fokus supaya catatanmu gampang dicari, disaring, lalu diedit kalau perlu."
    >
      <Card title="Cari dan saring">
        <div className="space-y-2.5">
          <Input
            label="Cari detail"
            onChange={(event) => {
              setQuery(event.target.value);
              setVisibleCount(120);
            }}
            placeholder="Misal: kopi, bensin, album"
            value={query}
          />
          <div className="grid grid-cols-2 gap-2">
            <FilterSelect
              label="Kategori"
              onChange={(value) => {
                setSelectedCategory(value);
                setVisibleCount(120);
              }}
              options={CATEGORY_TYPES}
              placeholder="Semua"
              value={selectedCategory}
            />
            <FilterSelect
              label="Akun"
              onChange={(value) => {
                setSelectedAccount(value);
                setVisibleCount(120);
              }}
              options={ACCOUNT_TYPES}
              placeholder="Semua"
              value={selectedAccount}
            />
          </div>
          <FilterSelect
            label="Urutkan"
            onChange={(value) => {
              setSortOption(value as SortOption);
              setVisibleCount(120);
            }}
            options={["terbaru", "terlama", "terbesar", "terkecil"]}
            placeholder="Pilih urutan"
            value={sortOption}
          />
        </div>
      </Card>

      <Card
        title="Ringkasan hasil"
        subtitle="Daftar ini menampilkan semua transaksi tersimpan di perangkatmu."
      >
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-[18px] border border-[var(--border-soft)] bg-[var(--bg-card-soft)] p-2.5">
            <p className="ui-label font-semibold text-[var(--text-muted)]">
              Total transaksi
            </p>
            <p className="mt-1 text-[14px] font-bold text-[var(--text-primary)]">
              {filteredItems.length}
            </p>
          </div>
          <div className="rounded-[18px] border border-[var(--border-soft)] bg-[var(--bg-card-soft)] p-2.5">
            <p className="ui-label font-semibold text-[var(--text-muted)]">
              Total nominal
            </p>
            <p className="mt-1 text-[14px] font-bold text-[var(--text-primary)]">
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
            : "Coba longgarkan pencarian atau mulai catat transaksi baru."
        }
      >
        {isLoadingAll ? (
          <p className="text-[12px] leading-5 text-[var(--text-secondary)]">
            Lagi memuat catatanmu sebentar ya...
          </p>
        ) : error ? (
          <p className="text-[12px] leading-5 text-[var(--danger-soft)]">{error}</p>
        ) : filteredItems.length > 0 ? (
          <div className="space-y-3">
            {visibleGroups.map((group) => (
              <section key={group.month} className="space-y-1.5">
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <h2 className="ui-label font-bold text-[var(--text-secondary)]">
                      {formatMonthLabel(group.month)}
                    </h2>
                    <p className="ui-helper mt-0.5 text-[var(--text-muted)]">
                      {group.items.length} transaksi - {formatCurrency(group.total)}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {group.items.map((transaction) => (
                    <button
                      key={transaction.id}
                      className="flex w-full items-start justify-between gap-3 rounded-[18px] border border-[var(--border-soft)] bg-[var(--bg-card-soft)] px-3 py-2.5 text-left transition-colors hover:border-[var(--accent-primary)]"
                      onClick={() => setSelectedTransactionId(transaction.id)}
                      type="button"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="truncate text-[14px] font-semibold text-[var(--text-primary)]">
                          {transaction.detail}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
                          <span className="rounded-full bg-[var(--accent-surface)] px-2 py-0.5 text-[10px] font-semibold text-[var(--accent-primary)]">
                            {transaction.category}
                          </span>
                          <span>{transaction.account}</span>
                          {transaction.mood ? <span>{transaction.mood}</span> : null}
                        </div>
                        <p className="text-[11px] leading-5 text-[var(--text-muted)]">
                          {formatDateLabel(transaction.date)}
                          {transaction.note ? ` · ${transaction.note}` : ""}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[15px] font-bold text-[var(--text-primary)]">
                          {formatCurrency(transaction.nominal)}
                        </p>
                        <span
                          aria-hidden="true"
                          className="mt-1 inline-flex text-[12px] text-[var(--text-muted)]"
                        >
                          ›
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ))}
            {hasMoreItems ? (
              <Button
                fullWidth
                onClick={() => setVisibleCount((current) => current + 120)}
                variant="secondary"
              >
                Tampilkan lebih banyak
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[12px] leading-5 text-[var(--text-secondary)]">
              {emptyStateLine}
            </p>
            <p className="text-[11px] leading-5 text-[var(--text-muted)]">
              {activeCharacter.name} siap nemenin kalau kamu mau mulai dari satu transaksi dulu.
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
