import type { HTMLAttributes, PropsWithChildren } from "react";

type CardProps = PropsWithChildren<
  HTMLAttributes<HTMLDivElement> & {
    title?: string;
    subtitle?: string;
  }
>;

export function Card({
  children,
  className = "",
  title,
  subtitle,
  ...props
}: CardProps) {
  return (
    <section
      className={[
        "rounded-[24px] border border-[var(--border-soft)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]",
        className,
      ].join(" ")}
      {...props}
    >
      {title || subtitle ? (
        <header className="mb-4 space-y-1">
          {title ? (
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              {title}
            </h2>
          ) : null}
          {subtitle ? (
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              {subtitle}
            </p>
          ) : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
