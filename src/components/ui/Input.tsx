import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function Input({
  className = "",
  error,
  hint,
  id,
  label,
  ...props
}: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label className="flex w-full flex-col gap-2" htmlFor={inputId}>
      <span className="text-sm font-semibold text-[var(--text-secondary)]">
        {label}
      </span>
      <input
        id={inputId}
        className={[
          "min-h-14 rounded-2xl border bg-[var(--bg-card-soft)] px-4 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)]",
          error
            ? "border-[rgba(217,108,95,0.4)]"
            : "border-[var(--border-soft)] focus:border-[var(--accent-primary)]",
          className,
        ].join(" ")}
        {...props}
      />
      {error ? (
        <span className="text-xs leading-5 text-[var(--danger-soft)]">
          {error}
        </span>
      ) : hint ? (
        <span className="text-xs leading-5 text-[var(--text-muted)]">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
