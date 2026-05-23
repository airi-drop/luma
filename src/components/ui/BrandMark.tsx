import type { CSSProperties } from "react";

interface BrandMarkProps {
  size?: "sm" | "md";
  className?: string;
}

/**
 * Trademark mark Luma — ikon bulan-sabit lembut + wordmark Fraunces.
 * Cozy, soft, tetap kebaca di tema apapun karena pakai CSS variable.
 */
export function BrandMark({ size = "sm", className = "" }: BrandMarkProps) {
  const dimensions = size === "md" ? { icon: 22, text: 17 } : { icon: 18, text: 14 };

  return (
    <span
      aria-label="Luma"
      className={["inline-flex items-center gap-1.5", className].join(" ")}
      role="img"
    >
      <BrandIcon size={dimensions.icon} />
      <span
        className="font-display font-bold leading-none tracking-[-0.01em] text-[var(--text-primary)]"
        style={{ fontSize: dimensions.text } satisfies CSSProperties}
      >
        luma
        <span
          aria-hidden="true"
          className="ml-0.5 inline-block h-1.5 w-1.5 rounded-full align-baseline"
          style={{ background: "var(--accent-primary)" }}
        />
      </span>
    </span>
  );
}

function BrandIcon({ size }: { size: number }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient cx="35%" cy="35%" id="lumaCircle" r="80%">
          <stop offset="0%" stopColor="var(--accent-soft)" />
          <stop offset="100%" stopColor="var(--accent-primary)" />
        </radialGradient>
      </defs>
      {/* Soft glow halo */}
      <circle
        cx="12"
        cy="12"
        fill="var(--accent-primary)"
        opacity="0.18"
        r="11"
      />
      {/* Main moon-ish rounded shape */}
      <circle cx="12" cy="12" fill="url(#lumaCircle)" r="8" />
      {/* Crescent overlay using bg-card to carve a soft moon */}
      <circle cx="15.5" cy="10" fill="var(--bg-card)" r="6" />
      {/* Small star/dot accent */}
      <circle cx="6.5" cy="7" fill="var(--accent-secondary)" r="0.9" />
    </svg>
  );
}
