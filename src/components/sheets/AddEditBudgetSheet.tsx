import { useId, useMemo, useState, type FormEvent } from "react";
import { CATEGORY_TYPES, type CategoryType } from "../../types";
import { formatCurrency, parseCurrencyInput } from "../../lib/currency";
import { getCategoryEmoji, getCategoryLabel } from "../../features/budgets/meta";
import { BottomSheet } from "../ui/BottomSheet";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export type BudgetSheetMode = "monthly" | "category";

interface AddEditBudgetSheetProps {
  isOpen: boolean;
  mode: BudgetSheetMode;
  initialCategory?: CategoryType;
  initialLimit?: number;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (input: {
    mode: BudgetSheetMode;
    nominal: number;
    category?: CategoryType;
  }) => Promise<void>;
}

function toInputValue(amount?: number) {
  return amount ? formatCurrency(amount) : "";
}

function isCategoryType(value: string): value is CategoryType {
  return CATEGORY_TYPES.includes(value as CategoryType);
}

export function AddEditBudgetSheet({
  isOpen,
  mode,
  initialCategory,
  initialLimit,
  isSubmitting = false,
  onClose,
  onSubmit,
}: AddEditBudgetSheetProps) {
  const formKey = `${mode}:${initialCategory ?? ""}:${initialLimit ?? 0}:${isOpen ? "open" : "closed"}`;

  return (
    <BottomSheet
      description={
        mode === "monthly"
          ? "Atur batas nyaman bulan ini dulu, nanti progress-nya langsung ikut kebaca."
          : "Bikin batas per kategori biar pengeluaran tetap kebaca tanpa terasa kaku."
      }
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "monthly" ? "Atur Budget Bulanan" : "Atur Budget Kategori"}
    >
      <BudgetSheetForm
        key={formKey}
        initialCategory={initialCategory}
        initialLimit={initialLimit}
        isSubmitting={isSubmitting}
        mode={mode}
        onSubmit={onSubmit}
      />
    </BottomSheet>
  );
}

interface BudgetSheetFormProps {
  mode: BudgetSheetMode;
  initialCategory?: CategoryType;
  initialLimit?: number;
  isSubmitting: boolean;
  onSubmit: AddEditBudgetSheetProps["onSubmit"];
}

function BudgetSheetForm({
  mode,
  initialCategory,
  initialLimit,
  isSubmitting,
  onSubmit,
}: BudgetSheetFormProps) {
  const categoryId = useId();
  const [category, setCategory] = useState<string>(initialCategory ?? "");
  const [nominalText, setNominalText] = useState(toInputValue(initialLimit));
  const [nominalTouched, setNominalTouched] = useState(false);
  const [categoryTouched, setCategoryTouched] = useState(false);
  const parsedNominal = useMemo(
    () => parseCurrencyInput(nominalText),
    [nominalText],
  );

  const nominalError =
    nominalTouched && parsedNominal <= 0 ? "Nominalnya belum diisi nih." : undefined;
  const categoryError =
    mode === "category" && categoryTouched && !category
      ? "Pilih kategori dulu ya."
      : undefined;
  const categoryDescriptionId =
    mode === "category" ? `${categoryId}-${categoryError ? "error" : "hint"}` : undefined;
  const isValidCategory =
    mode === "monthly" ? true : category !== "" && isCategoryType(category);
  const isValid = parsedNominal > 0 && isValidCategory;
  const isEditingCategory = mode === "category" && Boolean(initialCategory);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNominalTouched(true);

    if (mode === "category") {
      setCategoryTouched(true);

      if (!category) {
        return;
      }

      if (!isCategoryType(category)) {
        return;
      }
    }

    if (parsedNominal <= 0) {
      return;
    }

    await onSubmit({
      mode,
      nominal: parsedNominal,
      category: mode === "category" ? (category as CategoryType) : undefined,
    });
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      {mode === "category" ? (
        <label className="flex w-full flex-col gap-1" htmlFor={categoryId}>
          <span className="text-[12px] font-semibold text-[var(--text-secondary)]">
            Kategori
          </span>
          <select
            aria-describedby={categoryDescriptionId}
            aria-invalid={categoryError ? true : undefined}
            className={[
              "min-h-12 rounded-xl border bg-[var(--bg-card-soft)] px-3.5 text-[13px] text-[var(--text-primary)] outline-none transition-colors",
              categoryError
                ? "border-[var(--danger-soft)]"
                : "border-[var(--border-soft)] focus:border-[var(--accent-primary)]",
            ].join(" ")}
            disabled={isEditingCategory}
            id={categoryId}
            onBlur={() => setCategoryTouched(true)}
            onChange={(event) => setCategory(event.target.value)}
            value={category}
          >
            <option value="">Pilih kategori</option>
            {CATEGORY_TYPES.map((item) => (
              <option key={item} value={item}>
                {getCategoryEmoji(item)} {getCategoryLabel(item)}
              </option>
            ))}
          </select>
          {categoryError ? (
            <span
              className="text-[10px] leading-4 text-[var(--danger-soft)]"
              id={categoryDescriptionId}
            >
              {categoryError}
            </span>
          ) : (
            <span
              className="text-[10px] leading-4 text-[var(--text-muted)]"
              id={categoryDescriptionId}
            >
              {isEditingCategory
                ? "Kategori ini lagi diedit, jadi namanya tetap ya."
                : "Pilih kategori yang mau kamu jagain dulu."}
            </span>
          )}
        </label>
      ) : null}

      <Input
        error={nominalError}
        hint={
          nominalError
            ? undefined
            : parsedNominal > 0
              ? `Akan disimpan sebagai ${formatCurrency(parsedNominal)}`
              : "Tulis nominal budget bulan ini dalam Rupiah."
        }
        inputMode="numeric"
        label="Nominal Budget"
        onBlur={() => setNominalTouched(true)}
        onChange={(event) =>
          setNominalText(formatCurrency(parseCurrencyInput(event.target.value)))
        }
        placeholder="Rp0"
        value={nominalText}
      />

      {mode === "category" && categoryTouched && category && !isCategoryType(category) ? (
        <p className="text-[10px] leading-4 text-[var(--danger-soft)]">
          Kategori nggak valid.
        </p>
      ) : null}

      <Button disabled={!isValid || isSubmitting} fullWidth type="submit">
        {isSubmitting ? "Menyimpan..." : "Simpan Budget"}
      </Button>
    </form>
  );
}
