import { useEffect, useId, useRef } from "react";
import type { PropsWithChildren, ReactNode } from "react";

type BottomSheetProps = PropsWithChildren<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  footer?: ReactNode;
}>;

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const openSheetStack: string[] = [];
const SHEET_STATE_EVENT = "luma:sheet-state";

function registerOpenSheet(sheetId: string) {
  if (!openSheetStack.includes(sheetId)) {
    openSheetStack.push(sheetId);
  }
}

function unregisterOpenSheet(sheetId: string) {
  const index = openSheetStack.lastIndexOf(sheetId);
  if (index >= 0) {
    openSheetStack.splice(index, 1);
  }
}

function isTopmostSheet(sheetId: string) {
  return openSheetStack.at(-1) === sheetId;
}

function emitSheetState() {
  window.dispatchEvent(
    new CustomEvent(SHEET_STATE_EVENT, {
      detail: { hasOpenSheet: openSheetStack.length > 0 },
    }),
  );
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(
    (element) =>
      !element.hasAttribute("disabled") &&
      element.getAttribute("aria-hidden") !== "true" &&
      element.tabIndex !== -1,
  );
}

export function BottomSheet({
  children,
  description,
  footer,
  isOpen,
  onClose,
  title,
}: BottomSheetProps) {
  const sheetId = useId();
  const titleId = useId();
  const descriptionId = useId();
  const sheetRef = useRef<HTMLElement | null>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const { overflow } = document.body.style;
    previouslyFocusedElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    registerOpenSheet(sheetId);
    emitSheetState();

    const focusSheet = window.requestAnimationFrame(() => {
      const sheet = sheetRef.current;
      if (!sheet || !isTopmostSheet(sheetId)) {
        return;
      }

      const focusableElements = getFocusableElements(sheet);
      const initialFocusTarget = focusableElements[0] ?? sheet;
      initialFocusTarget.focus();
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (!isTopmostSheet(sheetId)) {
        return;
      }

      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const sheet = sheetRef.current;
      if (!sheet) {
        return;
      }

      const focusableElements = getFocusableElements(sheet);
      if (focusableElements.length === 0) {
        event.preventDefault();
        sheet.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;

      if (event.shiftKey) {
        if (!activeElement || activeElement === firstElement || !sheet.contains(activeElement)) {
          event.preventDefault();
          lastElement.focus();
        }

        return;
      }

      if (!activeElement || activeElement === lastElement || !sheet.contains(activeElement)) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusSheet);
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", handleKeyDown);
      unregisterOpenSheet(sheetId);
      emitSheetState();

      const previousElement = previouslyFocusedElementRef.current;
      if (previousElement && document.contains(previousElement)) {
        previousElement.focus();
      }
    };
  }, [isOpen, onClose, sheetId]);

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
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[90dvh] w-full max-w-[480px] flex-col rounded-t-[28px] border border-[var(--border-soft)] bg-[var(--bg-elevated)] px-5 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-3 shadow-[0_-12px_40px_rgba(122,90,72,0.18)]"
        ref={sheetRef}
        role="dialog"
        tabIndex={-1}
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
              <p
                className="text-sm leading-6 text-[var(--text-secondary)]"
                id={descriptionId}
              >
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
