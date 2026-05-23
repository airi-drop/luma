import type { HTMLAttributes } from "react";

type IconBadgeSize = "sm" | "md" | "lg";
type IconBadgeTone = "soft" | "accent";

interface IconBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  icon: string;
  size?: IconBadgeSize;
  tone?: IconBadgeTone;
}

const sizeClasses: Record<IconBadgeSize, string> = {
  sm: "h-9 w-9 rounded-2xl text-base",
  md: "h-10 w-10 rounded-[18px] text-[1.15rem]",
  lg: "h-12 w-12 rounded-[20px] text-[1.35rem]",
};

const toneClasses: Record<IconBadgeTone, string> = {
  soft: "border-[var(--border-soft)] bg-[linear-gradient(160deg,rgba(255,255,255,0.14),rgba(var(--overlay-glow-primary),0.12))] text-[var(--text-primary)]",
  accent:
    "border-[rgba(var(--overlay-glow-primary),0.24)] bg-[linear-gradient(160deg,rgba(var(--overlay-glow-primary),0.18),rgba(var(--overlay-glow-secondary),0.12))] text-[var(--text-primary)]",
};

export function IconBadge({
  className = "",
  icon,
  size = "md",
  tone = "soft",
  ...props
}: IconBadgeProps) {
  return (
    <span
      aria-hidden="true"
      className={[
        "inline-flex shrink-0 items-center justify-center border shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]",
        sizeClasses[size],
        toneClasses[tone],
        className,
      ].join(" ")}
      {...props}
    >
      <span className="translate-y-[0.02em]">{icon}</span>
    </span>
  );
}
