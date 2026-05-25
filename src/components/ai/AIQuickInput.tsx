import { useState } from "react";
import { getAiRefinementAvailability } from "../../features/ai/aiProvider";
import type { ParseResult } from "../../features/ai/types";
import { AIError, type AIStatus } from "../../features/ai/types";
import { useUiStore } from "../../stores/ui.store";
import { Button } from "../ui/Button";

interface AIQuickInputProps {
  aiEnabled: boolean;
  onParsed: (result: ParseResult, originalText: string) => void;
}

function getErrorMessage(error: unknown) {
  if (error instanceof AIError && error.code === "EMPTY_INPUT") {
    return "Tulis dulu transaksinya, contoh: bakso 15rb cash 🙏";
  }

  return "Smart parser lagi susah baca kalimatnya. Bisa edit manual dulu ya.";
}

export function AIQuickInput({ aiEnabled, onParsed }: AIQuickInputProps) {
  const showToast = useUiStore((state) => state.showToast);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<AIStatus>("idle");
  const aiAvailability = getAiRefinementAvailability();

  async function handleParse() {
    if (!text.trim()) {
      showToast({
        message: "Tulis dulu transaksinya, contoh: bakso 15rb cash 🙏",
        tone: "warning",
      });
      return;
    }

    setStatus("parsing");

    try {
      const originalText = text.trim();
      const { parseUserText } = await import("../../features/ai/transactionParser");
      const result = await parseUserText(originalText, {
        allowAiRefinement: aiEnabled,
      });
      onParsed(result, originalText);
    } catch (error) {
      showToast({
        message: getErrorMessage(error),
        tone: "warning",
      });
    } finally {
      setStatus("idle");
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-[var(--border-soft)] bg-[var(--bg-card-soft)] p-4">
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          Tulis singkat aja, smart parser bantu rapihin.
        </p>
        <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
          Contoh: <span className="font-semibold text-[var(--text-primary)]">bakso 15rb cash</span>,{" "}
          <span className="font-semibold text-[var(--text-primary)]">beli album 250k BCA</span>,{" "}
          atau <span className="font-semibold text-[var(--text-primary)]">gofood 48rb tadi malam</span>.
        </p>
      </div>

      <label className="flex flex-col gap-2" htmlFor="ai-quick-input">
        <span className="text-sm font-semibold text-[var(--text-secondary)]">
          Teks transaksi
        </span>
        <textarea
          id="ai-quick-input"
          className="min-h-32 rounded-[24px] border border-[var(--border-soft)] bg-[var(--bg-card-soft)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)]"
          onChange={(event) => setText(event.target.value)}
          placeholder="Contoh: makan ramen 45rb pakai dana"
          value={text}
        />
      </label>

      <div className="rounded-[24px] border border-dashed border-[var(--border-soft)] bg-[rgba(232,168,87,0.08)] p-4 text-sm leading-6 text-[var(--text-secondary)]">
        {aiEnabled && aiAvailability.available
          ? "Manual tetap jadi jalur utama. Parser lokal baca dulu, lalu AI-assisted refinement bantu merapikan hasil kalau provider-nya tersedia."
          : aiEnabled
            ? "Smart parser lokal tetap jalan. Refine AI belum tersambung di build ini, jadi hasilnya masih mengandalkan parser lokal dulu."
            : "Smart parser lokal tetap jalan. Kalau nanti mau refine tambahan saat provider tersedia, kamu bisa nyalakan bantuan AI dari Settings."}
      </div>

      <Button
        disabled={status === "parsing"}
        fullWidth
        onClick={() => void handleParse()}
        variant="secondary"
      >
        {status === "parsing" ? "Lagi ngerapihin..." : "Baca cepat ✨"}
      </Button>
    </div>
  );
}
