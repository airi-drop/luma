import { formatCurrency } from "../../lib/currency";
import { formatDateLabel } from "../../lib/date";
import type { SavingGoal, SavingGoalProgress } from "../../types";
import { IconBadge } from "../ui/IconBadge";

interface SavingGoalCardProps {
  goal: SavingGoal;
  progress: SavingGoalProgress;
  onClick?: () => void;
}

function getCardTone(goal: SavingGoal, progress: SavingGoalProgress) {
  if (goal.status === "archived") {
    return {
      wrapper:
        "border-[var(--border-soft)] bg-[var(--bg-card-soft)] text-[var(--text-secondary)]",
      bar: "bg-[var(--text-muted)]",
      badge: "bg-[var(--bg-card-soft)] text-[var(--text-secondary)]",
      label: "Diarsipkan",
    };
  }

  if (progress.isCompleted) {
    return {
      wrapper:
        "border-[rgba(var(--overlay-glow-secondary),0.32)] bg-[linear-gradient(140deg,rgba(var(--overlay-glow-secondary),0.22),rgba(var(--overlay-glow-primary),0.18))]",
      bar: "bg-[linear-gradient(90deg,var(--accent-secondary),var(--accent-primary))]",
      badge: "bg-[var(--accent-surface)] text-[var(--text-primary)]",
      label: "Sudah penuh ✨",
    };
  }

  return {
    wrapper:
      "border-[var(--border-soft)] bg-[linear-gradient(150deg,rgba(var(--overlay-glow-primary),0.20),rgba(var(--overlay-glow-secondary),0.14))]",
    bar: "bg-[linear-gradient(90deg,var(--accent-primary),var(--accent-secondary))]",
    badge: "bg-[var(--accent-surface)] text-[var(--text-primary)]",
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
        "w-full rounded-[20px] border p-3.5 text-left shadow-[var(--shadow-card)] transition-transform duration-150 active:scale-[0.99]",
        tone.wrapper,
      ].join(" ")}
      onClick={onClick}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start gap-2.5">
            <IconBadge icon={goal.icon} size="md" tone="soft" />
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="truncate text-[14px] font-bold text-[var(--text-primary)]">
                {goal.title}
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className={[
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    tone.badge,
                  ].join(" ")}
                >
                  {tone.label}
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">
                  {goal.deadline
                    ? `Deadline ${formatDateLabel(goal.deadline)}`
                    : "Tanpa deadline"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-end justify-between gap-2">
              <p className="text-[12px] font-semibold text-[var(--text-primary)]">
                {formatCurrency(progress.savedAmount)} /{" "}
                {formatCurrency(progress.targetAmount)}
              </p>
              <p className="text-[12px] font-bold text-[var(--text-primary)]">
                {Math.round(progress.percentage * 100)}%
              </p>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--bg-card-soft)]">
              <div
                className={["h-full rounded-full", tone.bar].join(" ")}
                style={{ width: progressWidth }}
              />
            </div>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Sisa
          </p>
          <p className="mt-0.5 text-[12px] font-bold text-[var(--text-primary)]">
            {formatCurrency(progress.remainingAmount)}
          </p>
          <p className="mt-1.5 text-[10px] text-[var(--text-muted)]">Lihat</p>
        </div>
      </div>
    </button>
  );
}
