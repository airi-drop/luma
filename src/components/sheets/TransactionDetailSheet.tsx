import { useState } from "react";
import { formatCurrency } from "../../lib/currency";
import { formatDateLabel } from "../../lib/date";
import { useBudgetsStore } from "../../stores/budgets.store";
import { useTransactionsStore } from "../../stores/transactions.store";
import { useUiStore } from "../../stores/ui.store";
import type { Transaction } from "../../types";
import {
  ManualTransactionForm,
  type ManualTransactionFormInput,
} from "../forms/ManualTransactionForm";
import { BottomSheet } from "../ui/BottomSheet";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface TransactionDetailSheetProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
}

export function TransactionDetailSheet({
  isOpen,
  onClose,
  transaction,
}: TransactionDetailSheetProps) {
  const updateTransaction = useTransactionsStore((state) => state.updateTransaction);
  const removeTransaction = useTransactionsStore((state) => state.removeTransaction);
  const currentMonth = useTransactionsStore((state) => state.month);
  const refreshBudgets = useBudgetsStore((state) => state.loadMonth);
  const showToast = useUiStore((state) => state.showToast);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  function handleClose() {
    setIsConfirmingDelete(false);
    setIsSubmitting(false);
    setIsDeleting(false);
    onClose();
  }

  async function handleSubmit(input: ManualTransactionFormInput) {
    if (!transaction) {
      return;
    }

    setIsSubmitting(true);

    try {
      await updateTransaction(transaction.id, input);
      await refreshBudgets(currentMonth);
      handleClose();
      showToast({
        message: "Perubahannya sudah disimpan ya ✨",
        tone: "success",
      });
    } catch (error) {
      showToast({
        message:
          error instanceof Error
            ? error.message
            : "Belum berhasil disimpan. Coba sekali lagi ya.",
        tone: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!transaction) {
      return;
    }

    setIsDeleting(true);

    try {
      await removeTransaction(transaction.id);
      await refreshBudgets(currentMonth);
      handleClose();
      showToast({
        message: "Transaksinya sudah dihapus.",
        tone: "info",
      });
    } catch (error) {
      showToast({
        message:
          error instanceof Error
            ? error.message
            : "Belum bisa dihapus sekarang. Coba lagi ya.",
        tone: "error",
      });
    } finally {
      setIsDeleting(false);
      setIsConfirmingDelete(false);
    }
  }

  return (
    <BottomSheet
      description={
        transaction
          ? `Tercatat ${formatDateLabel(transaction.date)} · ${formatCurrency(
              transaction.nominal,
            )}`
          : "Lihat detail transaksi dan rapihin lagi kalau perlu."
      }
      isOpen={isOpen}
      onClose={handleClose}
      title="Detail Transaksi"
    >
      {transaction ? (
        <div className="space-y-4">
          <Card className="space-y-2 bg-[var(--bg-card-soft)]" title="Ringkasan">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="font-semibold text-[var(--text-primary)]">
                  {transaction.detail}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {transaction.category} · {transaction.account}
                  {transaction.mood ? ` · ${transaction.mood}` : ""}
                </p>
              </div>
              <p className="text-sm font-bold text-[var(--text-primary)]">
                {formatCurrency(transaction.nominal)}
              </p>
            </div>
            {transaction.note ? (
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                {transaction.note}
              </p>
            ) : (
              <p className="text-sm leading-6 text-[var(--text-muted)]">
                Belum ada catatan tambahan di transaksi ini.
              </p>
            )}
          </Card>

          <ManualTransactionForm
            key={transaction.id}
            initialValues={{
              nominal: transaction.nominal,
              detail: transaction.detail,
              category: transaction.category,
              account: transaction.account,
              date: transaction.date,
              mood: transaction.mood,
              note: transaction.note,
            }}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            submitLabel="Simpan Perubahan"
          />

          <Card
            className="border-[rgba(217,108,95,0.18)] bg-[rgba(217,108,95,0.08)]"
            title="Hapus transaksi"
            subtitle="Kalau catatan ini memang tidak dipakai lagi, kamu bisa hapus dari sini."
          >
            {isConfirmingDelete ? (
              <div className="space-y-3">
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  Yakin mau hapus transaksi ini? Setelah dihapus, catatannya tidak
                  muncul lagi di daftar.
                </p>
                <div className="flex gap-3">
                  <Button
                    className="flex-1"
                    disabled={isDeleting}
                    onClick={() => setIsConfirmingDelete(false)}
                    variant="secondary"
                  >
                    Batal dulu
                  </Button>
                  <Button
                    className="flex-1 bg-[var(--danger-soft)] text-white shadow-none"
                    disabled={isDeleting}
                    onClick={handleDelete}
                  >
                    {isDeleting ? "Menghapus..." : "Iya, hapus"}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                className="w-full bg-[var(--danger-soft)] text-white shadow-none"
                disabled={isSubmitting}
                onClick={() => setIsConfirmingDelete(true)}
              >
                Hapus Transaksi
              </Button>
            )}
          </Card>
        </div>
      ) : null}
    </BottomSheet>
  );
}
