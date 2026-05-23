import { useEffect } from "react";
import { useUiStore } from "../../stores/ui.store";

const toneClasses = {
  error:
    "border-[rgba(217,108,95,0.35)] bg-[rgba(217,108,95,0.16)] text-[var(--text-primary)]",
  info: "border-[var(--border-soft)] bg-[var(--bg-card)] text-[var(--text-primary)]",
  success:
    "border-[rgba(143,184,150,0.32)] bg-[rgba(143,184,150,0.18)] text-[var(--text-primary)]",
  warning:
    "border-[rgba(232,168,87,0.35)] bg-[rgba(232,168,87,0.18)] text-[var(--text-primary)]",
} as const;

export function Toast() {
  const toast = useUiStore((state) => state.toast);
  const clearToast = useUiStore((state) => state.clearToast);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      clearToast();
    }, 2600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [clearToast, toast]);

  if (!toast) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 px-4">
      <div
        aria-atomic="true"
        aria-live="polite"
        className={[
          "mx-auto w-full max-w-[480px] rounded-[24px] border px-4 py-3 shadow-[var(--shadow-card)] backdrop-blur",
          toneClasses[toast.tone ?? "info"],
        ].join(" ")}
        role="status"
      >
        <p className="text-sm font-semibold">{toast.message}</p>
      </div>
    </div>
  );
}
