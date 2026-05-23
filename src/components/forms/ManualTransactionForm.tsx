import { useState, type FormEvent } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { formatCurrency } from "../../lib/currency";
import { getCurrentDate } from "../../lib/date";
import { isValidTransactionDate } from "../../lib/transaction-validation";
import {
  ACCOUNT_TYPES,
  CATEGORY_TYPES,
  MOOD_TYPES,
  type AccountType,
  type CategoryType,
  type MoodType,
  type CreateTransactionInput,
} from "../../types";

type FormErrors = Partial<Record<keyof ManualTransactionValues, string>>;
export type ManualTransactionFormInput = Omit<CreateTransactionInput, "source">;

interface ManualTransactionFormProps {
  isSubmitting?: boolean;
  initialValues?: Partial<ManualTransactionFormInput>;
  submitLabel?: string;
  onSubmit: (input: ManualTransactionFormInput) => Promise<void>;
}

interface ManualTransactionValues {
  nominal: string;
  detail: string;
  category: string;
  account: string;
  date: string;
  mood: string;
  note: string;
}

function getFormValues(
  values?: Partial<ManualTransactionFormInput>,
): ManualTransactionValues {
  return {
    nominal: values?.nominal ? String(values.nominal) : "",
    detail: values?.detail ?? "",
    category: values?.category ?? "",
    account: values?.account ?? "",
    date: values?.date ?? getCurrentDate(),
    mood: values?.mood ?? "",
    note: values?.note ?? "",
  };
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder: string;
  error?: string;
}) {
  const inputId = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label className="flex w-full flex-col gap-1" htmlFor={inputId}>
      <span className="text-[12px] font-semibold text-[var(--text-secondary)]">
        {label}
      </span>
      <select
        className={[
          "min-h-12 rounded-xl border bg-[var(--bg-card-soft)] px-3.5 text-[13px] text-[var(--text-primary)] outline-none transition-colors",
          error
            ? "border-[var(--danger-soft)]"
            : "border-[var(--border-soft)] focus:border-[var(--accent-primary)]",
        ].join(" ")}
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
      {error ? (
        <span className="text-[10px] leading-4 text-[var(--danger-soft)]">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const inputId = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label className="flex w-full flex-col gap-1" htmlFor={inputId}>
      <span className="text-[12px] font-semibold text-[var(--text-secondary)]">
        {label}
      </span>
      <textarea
        className="min-h-20 rounded-xl border border-[var(--border-soft)] bg-[var(--bg-card-soft)] px-3.5 py-2.5 text-[13px] text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)]"
        id={inputId}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

function validate(values: ManualTransactionValues) {
  const errors: FormErrors = {};
  const nominal = Number(values.nominal.replace(/[^\d]/g, ""));

  if (!Number.isFinite(nominal) || nominal <= 0) {
    errors.nominal = "Nominalnya belum masuk nih. Isi dulu ya.";
  }

  if (!values.detail.trim()) {
    errors.detail = "Ceritain singkat transaksinya biar gampang dicari nanti.";
  }

  if (!values.category) {
    errors.category = "Pilih kategorinya dulu ya, biar catatannya rapi.";
  }

  if (!values.account) {
    errors.account = "Akun bayarnya belum dipilih nih.";
  }

  if (!values.date) {
    errors.date = "Tanggalnya belum diisi. Pakai hari ini juga boleh.";
  } else if (!isValidTransactionDate(values.date)) {
    errors.date = "Tanggalnya belum kebaca valid. Coba cek lagi ya.";
  }

  return {
    errors,
    nominal,
  };
}

export function ManualTransactionForm({
  initialValues: providedInitialValues,
  isSubmitting = false,
  submitLabel = "Simpan Transaksi",
  onSubmit,
}: ManualTransactionFormProps) {
  const [values, setValues] = useState(() => getFormValues(providedInitialValues));
  const [errors, setErrors] = useState<FormErrors>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validate(values);

    if (Object.keys(result.errors).length > 0) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    await onSubmit({
      nominal: result.nominal,
      detail: values.detail.trim(),
      category: values.category as CategoryType,
      account: values.account as AccountType,
      date: values.date,
      mood: values.mood ? (values.mood as MoodType) : undefined,
      note: values.note.trim() || undefined,
    });
    setValues(getFormValues(providedInitialValues));
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <Input
        error={errors.nominal}
        hint={
          values.nominal
            ? `Akan disimpan sebagai ${formatCurrency(
                Number(values.nominal.replace(/[^\d]/g, "")) || 0,
              )}`
            : "Boleh tulis angka penuh, nanti disimpan dalam Rupiah."
        }
        inputMode="numeric"
        label="Nominal"
        onChange={(event) =>
          setValues((current) => ({
            ...current,
            nominal: event.target.value,
          }))
        }
        placeholder="Contoh: 25000"
        value={values.nominal}
      />
      <Input
        error={errors.detail}
        label="Detail"
        onChange={(event) =>
          setValues((current) => ({
            ...current,
            detail: event.target.value,
          }))
        }
        placeholder="Misal: kopi sore, ongkir, album"
        value={values.detail}
      />
      <div className="grid grid-cols-2 gap-2">
        <SelectField
          error={errors.category}
          label="Kategori"
          onChange={(value) =>
            setValues((current) => ({ ...current, category: value }))
          }
          options={CATEGORY_TYPES}
          placeholder="Pilih"
          value={values.category}
        />
        <SelectField
          error={errors.account}
          label="Akun"
          onChange={(value) =>
            setValues((current) => ({ ...current, account: value }))
          }
          options={ACCOUNT_TYPES}
          placeholder="Pilih"
          value={values.account}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Input
          error={errors.date}
          label="Tanggal"
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              date: event.target.value,
            }))
          }
          type="date"
          value={values.date}
        />
        <SelectField
          label="Mood"
          onChange={(value) =>
            setValues((current) => ({ ...current, mood: value }))
          }
          options={MOOD_TYPES}
          placeholder="Opsional"
          value={values.mood}
        />
      </div>
      <TextareaField
        label="Catatan"
        onChange={(value) =>
          setValues((current) => ({ ...current, note: value }))
        }
        placeholder="Opsional, kalau ada cerita kecil yang mau disimpan."
        value={values.note}
      />
      <Button disabled={isSubmitting} fullWidth type="submit">
        {isSubmitting ? "Menyimpan..." : submitLabel}
      </Button>
    </form>
  );
}
