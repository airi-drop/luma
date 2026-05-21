import { useState, type FormEvent } from "react";
import { formatCurrency, parseCurrencyInput } from "../../lib/currency";
import { BottomSheet } from "../ui/BottomSheet";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import type { CreateSavingGoalInput } from "../../types";

interface CreateGoalSheetProps {
  isOpen: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (input: CreateSavingGoalInput) => Promise<void>;
}

const iconSuggestions = ["🎧", "✈️", "💻", "🎮", "🎀", "📚", "🏡", "📷"];

function toCurrencyInput(amount?: number) {
  return amount ? formatCurrency(amount) : "";
}

export function CreateGoalSheet({
  isOpen,
  isSubmitting = false,
  onClose,
  onSubmit,
}: CreateGoalSheetProps) {
  const formKey = isOpen ? "open" : "closed";

  return (
    <BottomSheet
      description="Bikin target kecil atau besar, yang penting tetap terasa dekat dan gampang dipantau."
      isOpen={isOpen}
      onClose={onClose}
      title="Buat Target Baru"
    >
      <GoalForm key={formKey} isSubmitting={isSubmitting} onSubmit={onSubmit} />
    </BottomSheet>
  );
}

interface GoalFormProps {
  isSubmitting: boolean;
  onSubmit: (input: CreateSavingGoalInput) => Promise<void>;
}

function GoalForm({ isSubmitting, onSubmit }: GoalFormProps) {
  const [title, setTitle] = useState("");
  const [targetAmountText, setTargetAmountText] = useState("");
  const [currentAmountText, setCurrentAmountText] = useState("");
  const [icon, setIcon] = useState("🎧");
  const [deadline, setDeadline] = useState("");
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState({
    title: false,
    targetAmount: false,
    currentAmount: false,
    icon: false,
  });

  const trimmedTitle = title.trim();
  const trimmedIcon = icon.trim();
  const targetAmount = parseCurrencyInput(targetAmountText);
  const currentAmount = parseCurrencyInput(currentAmountText);

  const titleError =
    touched.title && !trimmedTitle ? "Kasih nama targetnya dulu ya." : undefined;
  const targetAmountError =
    touched.targetAmount && targetAmount <= 0
      ? "Target nominalnya belum kebaca nih."
      : undefined;
  const currentAmountError =
    touched.currentAmount && currentAmount < 0
      ? "Nominal tabungan awal belum valid."
      : undefined;
  const iconError =
    touched.icon && !trimmedIcon ? "Pilih emoji kecil biar targetnya terasa hidup." : undefined;
  const isValid =
    Boolean(trimmedTitle) &&
    Boolean(trimmedIcon) &&
    targetAmount > 0 &&
    currentAmount >= 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({
      title: true,
      targetAmount: true,
      currentAmount: true,
      icon: true,
    });

    if (!isValid) {
      return;
    }

    await onSubmit({
      title: trimmedTitle,
      targetAmount,
      currentAmount,
      icon: trimmedIcon,
      deadline: deadline || undefined,
      note: note.trim() || undefined,
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input
        error={titleError}
        hint={titleError ? undefined : "Contoh: Album IU, Trip Jepang, Laptop baru."}
        label="Nama target"
        onBlur={() => setTouched((state) => ({ ...state, title: true }))}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Mau nabung buat apa?"
        value={title}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          error={targetAmountError}
          hint={
            targetAmountError
              ? undefined
              : targetAmount > 0
                ? `Targetnya ${formatCurrency(targetAmount)}`
                : "Tulis total yang pengen dicapai."
          }
          inputMode="numeric"
          label="Target nominal"
          onBlur={() => setTouched((state) => ({ ...state, targetAmount: true }))}
          onChange={(event) =>
            setTargetAmountText(toCurrencyInput(parseCurrencyInput(event.target.value)))
          }
          placeholder="Rp0"
          value={targetAmountText}
        />

        <Input
          error={currentAmountError}
          hint={
            currentAmountError
              ? undefined
              : currentAmount > 0
                ? `Mulai dari ${formatCurrency(currentAmount)}`
                : "Boleh dikosongkan kalau mau mulai dari nol."
          }
          inputMode="numeric"
          label="Tabungan awal"
          onBlur={() => setTouched((state) => ({ ...state, currentAmount: true }))}
          onChange={(event) =>
            setCurrentAmountText(toCurrencyInput(parseCurrencyInput(event.target.value)))
          }
          placeholder="Rp0"
          value={currentAmountText}
        />
      </div>

      <div className="space-y-2">
        <Input
          error={iconError}
          hint={iconError ? undefined : "Satu emoji kecil cukup biar targetnya gampang dikenali."}
          label="Emoji / icon"
          maxLength={4}
          onBlur={() => setTouched((state) => ({ ...state, icon: true }))}
          onChange={(event) => setIcon(event.target.value)}
          placeholder="🎧"
          value={icon}
        />
        <div className="flex flex-wrap gap-2">
          {iconSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              className={[
                "inline-flex h-11 w-11 items-center justify-center rounded-full border text-xl",
                icon === suggestion
                  ? "border-[var(--accent-primary)] bg-[var(--accent-surface)]"
                  : "border-[var(--border-soft)] bg-[var(--bg-card-soft)]",
              ].join(" ")}
              onClick={() => setIcon(suggestion)}
              type="button"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <Input
        hint="Opsional. Kalau belum pengen ditentuin, boleh kosong."
        label="Deadline"
        onChange={(event) => setDeadline(event.target.value)}
        type="date"
        value={deadline}
      />

      <label className="flex flex-col gap-2" htmlFor="goal-note">
        <span className="text-sm font-semibold text-[var(--text-secondary)]">
          Catatan kecil
        </span>
        <textarea
          className="min-h-28 rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-card-soft)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)]"
          id="goal-note"
          onChange={(event) => setNote(event.target.value)}
          placeholder="Misal: pengen selesai sebelum akhir tahun."
          value={note}
        />
        <span className="text-xs leading-5 text-[var(--text-muted)]">
          Opsional, buat ninggalin alasan kecil kenapa target ini penting.
        </span>
      </label>

      <Button disabled={!isValid || isSubmitting} fullWidth type="submit">
        {isSubmitting ? "Menyimpan..." : "Buat Target"}
      </Button>
    </form>
  );
}
