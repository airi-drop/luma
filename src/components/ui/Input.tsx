import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export function Input({
  className = "",
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
          "min-h-14 rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-card-soft)] px-4 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)]",
          className,
        ].join(" ")}
        {...props}
      />
      {hint ? (
        <span className="text-xs leading-5 text-[var(--text-muted)]">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
