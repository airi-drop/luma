import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    fullWidth?: boolean;
  }
>;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--accent-primary)] text-[var(--text-on-accent)] shadow-[0_14px_30px_rgba(242,155,118,0.32)]",
  secondary:
    "border border-[var(--border-soft)] bg-[var(--bg-card-soft)] text-[var(--text-primary)]",
  ghost: "bg-transparent text-[var(--text-secondary)]",
};

export function Button({
  children,
  className = "",
  fullWidth = false,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        "inline-flex min-h-[44px] items-center justify-center rounded-full px-4 text-[13px] font-bold transition-[transform,box-shadow,background-color,border-color,color] duration-150 motion-reduce:transform-none motion-reduce:transition-none motion-safe:hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
        fullWidth ? "w-full" : "",
        variantClasses[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
