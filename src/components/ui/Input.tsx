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
    <label className="flex w-full flex-col gap-1" htmlFor={inputId}>
      <span className="text-[12px] font-semibold text-[var(--text-secondary)]">
        {label}
      </span>
      <input
        id={inputId}
        className={[
          "min-h-12 rounded-xl border bg-[var(--bg-card-soft)] px-3.5 text-[13px] text-[var(--text-primary)] outline-none transition-colors motion-reduce:transition-none placeholder:text-[var(--text-muted)]",
          error
            ? "border-[var(--danger-soft)]"
            : "border-[var(--border-soft)] focus:border-[var(--accent-primary)]",
          className,
        ].join(" ")}
        {...props}
      />
      {error ? (
        <span className="text-[10px] leading-4 text-[var(--danger-soft)]">
          {error}
        </span>
      ) : hint ? (
        <span className="text-[10px] leading-4 text-[var(--text-muted)]">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
