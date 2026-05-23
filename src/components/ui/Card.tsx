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
        "rounded-[20px] border border-[var(--border-soft)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)]",
        className,
      ].join(" ")}
      {...props}
    >
      {title || subtitle ? (
        <header className="mb-3 space-y-0.5">
          {title ? (
            <h2 className="text-[15px] font-bold text-[var(--text-primary)]">
              {title}
            </h2>
          ) : null}
          {subtitle ? (
            <p className="text-[12px] leading-5 text-[var(--text-secondary)]">
              {subtitle}
            </p>
          ) : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
