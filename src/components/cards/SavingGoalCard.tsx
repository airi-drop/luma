import { formatCurrency } from "../../lib/currency";
import { formatDateLabel } from "../../lib/date";
import type { SavingGoal, SavingGoalProgress } from "../../types";

interface SavingGoalCardProps {
  goal: SavingGoal;
  progress: SavingGoalProgress;
  onClick?: () => void;
}

function getCardTone(goal: SavingGoal, progress: SavingGoalProgress) {
  if (goal.status === "archived") {
    return {
      wrapper:
        "border-[var(--border-soft)] bg-[rgba(255,243,220,0.05)] text-[var(--text-secondary)]",
      bar: "bg-[var(--text-muted)]",
      badge: "bg-[rgba(255,243,220,0.08)] text-[var(--text-secondary)]",
      label: "Diarsipkan",
    };
  }

  if (progress.isCompleted) {
    return {
      wrapper:
        "border-[rgba(143,184,150,0.28)] bg-[linear-gradient(140deg,rgba(143,184,150,0.2),rgba(232,168,87,0.08))]",
      bar: "bg-[linear-gradient(90deg,var(--accent-secondary),var(--accent-primary))]",
      badge: "bg-[rgba(143,184,150,0.16)] text-[var(--text-primary)]",
      label: "Sudah penuh ✨",
    };
  }

  return {
    wrapper:
      "border-[var(--border-soft)] bg-[linear-gradient(150deg,rgba(232,168,87,0.12),rgba(143,184,150,0.08))]",
    bar: "bg-[linear-gradient(90deg,var(--accent-primary),var(--accent-secondary))]",
    badge: "bg-[rgba(232,168,87,0.14)] text-[var(--text-primary)]",
    label: "Masih jalan pelan-pelan",
  };
}

export function SavingGoalCard({
  goal,
  progress,
  onClick,
}: SavingGoalCardProps) {
  const tone = getCardTone(goal, progress);
  const progressWidth = `${Math.min(progress.percentage, 1) * 100}%`;

  return (
    <button
      className={[
        "w-full rounded-[28px] border p-5 text-left shadow-[var(--shadow-card)] transition-transform duration-150 active:scale-[0.99]",
        tone.wrapper,
      ].join(" ")}
      onClick={onClick}
      type="button"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-3">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[rgba(255,243,220,0.12)] text-2xl">
              {goal.icon}
            </span>
            <div className="min-w-0 space-y-1">
              <p className="truncate text-base font-bold text-[var(--text-primary)]">
                {goal.title}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={[
                    "rounded-full px-3 py-1 text-[11px] font-semibold",
                    tone.badge,
                  ].join(" ")}
                >
                  {tone.label}
                </span>
                {goal.deadline ? (
                  <span className="text-xs text-[var(--text-muted)]">
                    Deadline {formatDateLabel(goal.deadline)}
                  </span>
                ) : (
                  <span className="text-xs text-[var(--text-muted)]">
                    Tanpa deadline dulu
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-end justify-between gap-3">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {formatCurrency(progress.savedAmount)} /{" "}
                {formatCurrency(progress.targetAmount)}
              </p>
              <p className="text-sm font-bold text-[var(--text-primary)]">
                {Math.round(progress.percentage * 100)}%
              </p>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[rgba(255,243,220,0.08)]">
              <div
                className={["h-full rounded-full", tone.bar].join(" ")}
                style={{ width: progressWidth }}
              />
            </div>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Sisa
          </p>
          <p className="mt-2 text-sm font-bold text-[var(--text-primary)]">
            {formatCurrency(progress.remainingAmount)}
          </p>
          <p className="mt-3 text-xs text-[var(--text-muted)]">Lihat detail</p>
        </div>
      </div>
    </button>
  );
}
