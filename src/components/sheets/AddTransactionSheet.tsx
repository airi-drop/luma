import { useState } from "react";
import type { ParseResult } from "../../features/ai/types";
import { useBudgetsStore } from "../../stores/budgets.store";
import { useSettingsStore } from "../../stores/settings.store";
import { useTransactionsStore } from "../../stores/transactions.store";
import { useUiStore } from "../../stores/ui.store";
import { AIParsePreviewSheet } from "../ai/AIParsePreviewSheet";
import { AIQuickInput } from "../ai/AIQuickInput";
import {
  ManualTransactionForm,
  type ManualTransactionFormInput,
} from "../forms/ManualTransactionForm";
import { BottomSheet } from "../ui/BottomSheet";

export function AddTransactionSheet() {
  const activeBottomSheet = useUiStore((state) => state.activeBottomSheet);
  const closeBottomSheet = useUiStore((state) => state.closeBottomSheet);
  const showToast = useUiStore((state) => state.showToast);
  const settings = useSettingsStore((state) => state.settings);
  const createTransaction = useTransactionsStore((state) => state.createTransaction);
  const refreshBudgets = useBudgetsStore((state) => state.loadMonth);
  const currentMonth = useTransactionsStore((state) => state.month);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"manual" | "ai">("manual");
  const [previewState, setPreviewState] = useState<{
    originalText: string;
    result: ParseResult;
  } | null>(null);

  async function handleSubmit(input: ManualTransactionFormInput) {
    setIsSubmitting(true);

    try {
      await createTransaction({
        ...input,
        source: "manual",
      });
      await refreshBudgets(currentMonth);
      closeBottomSheet();
      setActiveTab("manual");
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

  function handleCloseSheet() {
    closeBottomSheet();
    setActiveTab("manual");
    setPreviewState(null);
  }

  function handlePreviewSaved() {
    setPreviewState(null);
    setActiveTab("ai");
    closeBottomSheet();
  }

  return (
    <>
      <BottomSheet
        description="Manual tetap jadi default. AI ada di tab kedua kalau kamu mau input lebih cepat."
        isOpen={activeBottomSheet === "add-transaction"}
        onClose={handleCloseSheet}
        title="Tambah Transaksi"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--bg-card-soft)] p-1">
            <button
              className={[
                "min-h-11 rounded-full px-4 text-sm font-semibold transition-colors",
                activeTab === "manual"
                  ? "bg-[var(--accent-primary)] text-[var(--text-on-accent)]"
                  : "text-[var(--text-secondary)]",
              ].join(" ")}
              onClick={() => setActiveTab("manual")}
              type="button"
            >
              Manual
            </button>
            <button
              className={[
                "min-h-11 rounded-full px-4 text-sm font-semibold transition-colors",
                activeTab === "ai"
                  ? "bg-[var(--accent-primary)] text-[var(--text-on-accent)]"
                  : "text-[var(--text-secondary)]",
              ].join(" ")}
              onClick={() => setActiveTab("ai")}
              type="button"
            >
              AI Cepat
            </button>
          </div>

          {activeTab === "manual" ? (
            <ManualTransactionForm
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
            />
          ) : (
            <AIQuickInput
              aiEnabled={settings?.aiEnabled ?? false}
              onParsed={(result, originalText) =>
                setPreviewState({ result, originalText })}
            />
          )}
        </div>
      </BottomSheet>

      <AIParsePreviewSheet
        isOpen={previewState !== null}
        onClose={() => setPreviewState(null)}
        onSaved={handlePreviewSaved}
        originalText={previewState?.originalText ?? ""}
        result={previewState?.result ?? null}
      />
    </>
  );
}
