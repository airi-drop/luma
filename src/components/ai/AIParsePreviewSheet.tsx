import { useState } from "react";
import type { ParseResult } from "../../features/ai/types";
import { aiUsageRepo } from "../../db/repositories/ai-usage.repo";
import { formatCurrency } from "../../lib/currency";
import { getMonthFromDate } from "../../lib/date";
import { useBudgetsStore } from "../../stores/budgets.store";
import { useTransactionsStore } from "../../stores/transactions.store";
import { useUiStore } from "../../stores/ui.store";
import {
  ManualTransactionForm,
  type ManualTransactionFormInput,
} from "../forms/ManualTransactionForm";
import { BottomSheet } from "../ui/BottomSheet";
import { Button } from "../ui/Button";

interface AIParsePreviewSheetProps {
  isOpen: boolean;
  originalText: string;
  result: ParseResult | null;
  onClose: () => void;
  onSaved: () => void;
}

function getConfidenceTone(confidence: number) {
  if (confidence >= 0.8) {
    return "border-[rgba(143,184,150,0.32)] bg-[rgba(143,184,150,0.16)] text-[var(--text-primary)]";
  }

  if (confidence >= 0.5) {
    return "border-[var(--border-soft)] bg-[var(--bg-card)] text-[var(--text-primary)]";
  }

  return "border-[rgba(232,168,87,0.35)] bg-[rgba(232,168,87,0.16)] text-[var(--text-primary)]";
}

export function AIParsePreviewSheet({
  isOpen,
  originalText,
  result,
  onClose,
  onSaved,
}: AIParsePreviewSheetProps) {
  const createTransaction = useTransactionsStore((state) => state.createTransaction);
  const currentMonth = useTransactionsStore((state) => state.month);
  const refreshBudgets = useBudgetsStore((state) => state.loadMonth);
  const showToast = useUiStore((state) => state.showToast);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!result) {
    return null;
  }

  async function handleSubmit(input: ManualTransactionFormInput) {
    setIsSubmitting(true);

    try {
      await createTransaction({
        ...input,
        source: "ai",
      });
      await refreshBudgets(currentMonth);

      try {
        await aiUsageRepo.incrementInput(getMonthFromDate(input.date));
      } catch (error) {
        console.warn("Gagal update AI usage:", error);
      }

      showToast({
        message: "Tercatat dari AI ✨",
        tone: "success",
      });
      onSaved();
    } catch {
      showToast({
        message: "Gagal nyimpen, coba sekali lagi ya.",
        tone: "warning",
      });
      throw new Error("SAVE_FAILED");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <BottomSheet
      description={`Dari: "${originalText}"`}
      isOpen={isOpen}
      onClose={onClose}
      title="Cek dulu ya 👀"
    >
      <div className="space-y-4 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-[var(--border-soft)] bg-[var(--bg-card-soft)] p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Preview nominal
            </p>
            <p className="mt-2 font-display text-[28px] font-bold text-[var(--accent-primary)]">
              {formatCurrency(result.nominal)}
            </p>
          </div>
          <span
            className={[
              "inline-flex rounded-full border px-3 py-2 text-xs font-semibold",
              getConfidenceTone(result.confidence),
            ].join(" ")}
          >
            Confidence: {Math.round(result.confidence * 100)}%
          </span>
        </div>

        <ManualTransactionForm
          initialValues={{
            nominal: result.nominal,
            detail: result.detail,
            category: result.category,
            account: result.account,
            date: result.date,
          }}
          isSubmitting={isSubmitting}
          key={`${originalText}-${result.nominal}-${result.date ?? "today"}`}
          submitLabel="Simpan ✨"
          onSubmit={handleSubmit}
        />

        <Button fullWidth onClick={onClose} variant="ghost">
          Batal
        </Button>
      </div>
    </BottomSheet>
  );
}
