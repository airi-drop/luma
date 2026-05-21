import { useState } from "react";
import { useBudgetsStore } from "../../stores/budgets.store";
import { useTransactionsStore } from "../../stores/transactions.store";
import { useUiStore } from "../../stores/ui.store";
import type { CreateTransactionInput } from "../../types";
import { ManualTransactionForm } from "../forms/ManualTransactionForm";
import { BottomSheet } from "../ui/BottomSheet";

export function AddTransactionSheet() {
  const activeBottomSheet = useUiStore((state) => state.activeBottomSheet);
  const closeBottomSheet = useUiStore((state) => state.closeBottomSheet);
  const showToast = useUiStore((state) => state.showToast);
  const createTransaction = useTransactionsStore((state) => state.createTransaction);
  const refreshBudgets = useBudgetsStore((state) => state.loadMonth);
  const currentMonth = useTransactionsStore((state) => state.month);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(input: CreateTransactionInput) {
    setIsSubmitting(true);

    try {
      await createTransaction({
        ...input,
        source: "manual",
      });
      await refreshBudgets(currentMonth);
      closeBottomSheet();
      showToast({
        message: "Tercatat ya ✨",
        tone: "success",
      });
    } catch (error) {
      showToast({
        message:
          error instanceof Error
            ? error.message
            : "Gagal nyimpen, coba sekali lagi ya.",
        tone: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <BottomSheet
      description="Catat manual dulu aja. AI dan voice belum dipakai di sprint ini."
      isOpen={activeBottomSheet === "add-transaction"}
      onClose={closeBottomSheet}
      title="Tambah Transaksi"
    >
      <ManualTransactionForm
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
    </BottomSheet>
  );
}
