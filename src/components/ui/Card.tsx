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
        "border border-[var(--border-soft)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]",
        className,
      ].join(" ")}
      style={{
        borderRadius: "var(--radius-card-compact)",
        padding: "var(--space-4)",
      }}
      {...props}
    >
      {title || subtitle ? (
        <header
          className="space-y-1"
          style={{ marginBottom: "var(--space-3)" }}
        >
          {title ? (
            <h2 className="ui-card-title text-[var(--text-primary)]">
              {title}
            </h2>
          ) : null}
          {subtitle ? (
            <p className="ui-helper text-[var(--text-secondary)]">
              {subtitle}
            </p>
          ) : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
