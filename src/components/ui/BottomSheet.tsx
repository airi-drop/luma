import { useEffect, useId } from "react";
import type { PropsWithChildren, ReactNode } from "react";

type BottomSheetProps = PropsWithChildren<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  footer?: ReactNode;
}>;

export function BottomSheet({
  children,
  description,
  footer,
  isOpen,
  onClose,
  title,
}: BottomSheetProps) {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40">
      <button
        aria-label="Tutup sheet"
        className="absolute inset-0 bg-black/45"
        onClick={onClose}
        type="button"
      />
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[90dvh] w-full max-w-[480px] flex-col rounded-t-[28px] border border-[var(--border-soft)] bg-[var(--bg-elevated)] px-5 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-3 shadow-[0_-12px_40px_rgba(0,0,0,0.32)]"
        role="dialog"
      >
        <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-[var(--border-soft)]" />
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2
              id={titleId}
              className="font-display text-2xl font-bold text-[var(--text-primary)]"
            >
              {title}
            </h2>
            {description ? (
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                {description}
              </p>
            ) : null}
          </div>
          <button
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--bg-card)] text-lg text-[var(--text-secondary)]"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pb-4">{children}</div>
        {footer ? <div className="pt-2">{footer}</div> : null}
      </section>
    </div>
  );
}
