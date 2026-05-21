type MascotMood = "happy" | "chill" | "worried" | "panic";

const moodConfig: Record<
  MascotMood,
  { face: string; label: string; glow: string }
> = {
  happy: {
    face: "(^_^)",
    label: "happy",
    glow: "from-[rgba(143,184,150,0.28)] to-[rgba(232,168,87,0.18)]",
  },
  chill: {
    face: "(-_-)",
    label: "chill",
    glow: "from-[rgba(232,168,87,0.24)] to-[rgba(143,184,150,0.14)]",
  },
  worried: {
    face: "(._.)",
    label: "worried",
    glow: "from-[rgba(232,168,87,0.28)] to-[rgba(217,108,95,0.16)]",
  },
  panic: {
    face: "(>_<)",
    label: "panic",
    glow: "from-[rgba(217,108,95,0.22)] to-[rgba(232,168,87,0.18)]",
  },
};

interface MascotPlaceholderProps {
  characterId: string;
  mood: MascotMood;
}

export function MascotPlaceholder({
  characterId,
  mood,
}: MascotPlaceholderProps) {
  const config = moodConfig[mood];

  return (
    <div className="relative isolate overflow-hidden rounded-[28px] border border-[rgba(255,243,220,0.14)] bg-[rgba(42,33,27,0.86)] p-4 shadow-[var(--shadow-card)]">
      <div
        aria-hidden="true"
        className={[
          "absolute inset-x-3 bottom-0 top-3 rounded-[24px] bg-linear-to-br blur-2xl",
          config.glow,
        ].join(" ")}
      />
      <div className="relative flex min-h-[184px] flex-col justify-between">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full border border-[var(--border-soft)] bg-[rgba(255,243,220,0.08)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
            Mascot space
          </span>
          <span className="rounded-full bg-[rgba(26,20,16,0.44)] px-3 py-1 text-xs text-[var(--text-secondary)]">
            {characterId}
          </span>
        </div>
        <div className="space-y-3">
          <div className="rounded-[24px] border border-[rgba(255,243,220,0.12)] bg-[rgba(26,20,16,0.52)] px-4 py-6 text-center">
            <p className="font-display text-2xl leading-tight text-[var(--text-primary)]">
              {config.face}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              Placeholder mascot untuk mode{" "}
              <span className="font-semibold text-[var(--text-primary)]">
                {config.label}
              </span>
              .
            </p>
          </div>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Nanti area ini bisa diganti asset karakter tanpa ganggu data budget.
          </p>
        </div>
      </div>
    </div>
  );
}
