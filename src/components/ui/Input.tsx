import { useId } from "react";
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function Input({
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  className = "",
  error,
  hint,
  id,
  label,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [ariaDescribedBy, errorId ?? hintId].filter(Boolean).join(" ");
  const isInvalid = error ? true : ariaInvalid;

  return (
    <label
      className="flex w-full flex-col"
      htmlFor={inputId}
      style={{ gap: "var(--space-2)" }}
    >
      <span className="ui-label font-semibold text-[var(--text-secondary)]">
        {label}
      </span>
      <input
        aria-describedby={describedBy || undefined}
        aria-invalid={isInvalid}
        id={inputId}
        className={[
          "min-h-12 border bg-[var(--bg-card-soft)] px-3.5 text-[13px] text-[var(--text-primary)] outline-none transition-colors motion-reduce:transition-none placeholder:text-[var(--text-muted)]",
          error
            ? "border-[var(--danger-soft)]"
            : "border-[var(--border-soft)] focus:border-[var(--accent-primary)]",
          className,
        ].join(" ")}
        style={{ borderRadius: "var(--radius-field)" }}
        {...props}
      />
      {error ? (
        <span
          className="ui-helper text-[var(--danger-soft)]"
          id={errorId}
        >
          {error}
        </span>
      ) : hint ? (
        <span
          className="ui-helper text-[var(--text-muted)]"
          id={hintId}
        >
          {hint}
        </span>
      ) : null}
    </label>
  );
}
