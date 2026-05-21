import type { PropsWithChildren, ReactNode } from "react";
import { BottomNav } from "./BottomNav";

type PageWrapperProps = PropsWithChildren<{
  title: string;
  description?: string;
  headerAction?: ReactNode;
  withBottomNav?: boolean;
}>;

export function PageWrapper({
  children,
  title,
  description,
  headerAction,
  withBottomNav = true,
}: PageWrapperProps) {
  return (
    <div className="min-h-dvh bg-[var(--bg-main)] text-[var(--text-primary)]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(232,168,87,0.18),_transparent_42%),linear-gradient(180deg,var(--overlay-start),var(--overlay-end))]" />
        <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top_right,_rgba(143,184,150,0.18),_transparent_45%)]" />
      </div>

      <div className="relative mx-auto flex min-h-dvh w-full max-w-[480px] flex-col px-5 pb-28 pt-6">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Luma
            </p>
            <div className="space-y-1">
              <h1 className="font-display text-[28px] leading-tight font-bold">
                {title}
              </h1>
              {description ? (
                <p className="max-w-[32ch] text-sm leading-6 text-[var(--text-secondary)]">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
          {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
        </header>

        <main className="flex-1 space-y-6">{children}</main>
      </div>

      {withBottomNav ? <BottomNav /> : null}
    </div>
  );
}
