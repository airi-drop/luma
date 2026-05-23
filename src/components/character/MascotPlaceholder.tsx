import { getCharacterById } from "../../features/customization/presets";

type MascotMood = "happy" | "chill" | "worried" | "panic";

interface MoodVisual {
  label: string;
  copy: string;
  eyeShape: "round" | "smile" | "dot" | "wide";
  mouthShape: "smile" | "small" | "flat" | "o";
  cheekVisible: boolean;
}

const moodConfig: Record<MascotMood, MoodVisual> = {
  happy: {
    label: "happy",
    copy: "Lagi happy, dompet juga ikut tenang.",
    eyeShape: "smile",
    mouthShape: "smile",
    cheekVisible: true,
  },
  chill: {
    label: "chill",
    copy: "Santai dulu, semuanya masih on track.",
    eyeShape: "dot",
    mouthShape: "small",
    cheekVisible: true,
  },
  worried: {
    label: "worried",
    copy: "Pelan-pelan ya, masih bisa diatur kok.",
    eyeShape: "round",
    mouthShape: "flat",
    cheekVisible: false,
  },
  panic: {
    label: "panic",
    copy: "Yuk istirahat sebentar, tarik napas dulu.",
    eyeShape: "wide",
    mouthShape: "o",
    cheekVisible: false,
  },
};

type CharacterShape = "otter" | "cat" | "bunny" | "hamster";

interface CharacterStyle {
  shape: CharacterShape;
  // Filter halus dipakai pada palette tema agar tiap karakter punya nuansa
  // berbeda walau tetap mengikuti tema aktif.
  filter: string;
  // Nose / accent extra
  hasNose: boolean;
  hasWhiskers: boolean;
}

const characterStyles: Record<string, CharacterStyle> = {
  otter: {
    shape: "otter",
    filter: "saturate(0.95) brightness(0.95)",
    hasNose: true,
    hasWhiskers: false,
  },
  cat: {
    shape: "cat",
    filter: "saturate(1.1) brightness(1.05) hue-rotate(-6deg)",
    hasNose: true,
    hasWhiskers: true,
  },
  bunny: {
    shape: "bunny",
    filter: "saturate(0.85) brightness(1.1) hue-rotate(4deg)",
    hasNose: true,
    hasWhiskers: false,
  },
  hamster: {
    shape: "hamster",
    filter: "saturate(1.15) brightness(0.98) hue-rotate(-3deg)",
    hasNose: false,
    hasWhiskers: true,
  },
};

interface EarsProps {
  shape: CharacterShape;
}

function Ears({ shape }: EarsProps) {
  if (shape === "bunny") {
    // Telinga panjang, oval, miring sedikit ke luar
    return (
      <>
        <span
          aria-hidden="true"
          className="absolute -top-7 left-4 h-9 w-3.5 rounded-full"
          style={{ background: "var(--mascot-ear)", transform: "rotate(-12deg)" }}
        />
        <span
          aria-hidden="true"
          className="absolute -top-7 right-4 h-9 w-3.5 rounded-full"
          style={{ background: "var(--mascot-ear)", transform: "rotate(12deg)" }}
        />
        <span
          aria-hidden="true"
          className="absolute -top-5 left-[22px] h-5 w-1.5 rounded-full bg-[var(--mascot-cheek)] opacity-70"
          style={{ transform: "rotate(-12deg)" }}
        />
        <span
          aria-hidden="true"
          className="absolute -top-5 right-[22px] h-5 w-1.5 rounded-full bg-[var(--mascot-cheek)] opacity-70"
          style={{ transform: "rotate(12deg)" }}
        />
      </>
    );
  }

  if (shape === "cat") {
    // Telinga segitiga via clip-path
    return (
      <>
        <span
          aria-hidden="true"
          className="absolute -top-2 left-2 h-6 w-6"
          style={{
            background: "var(--mascot-ear)",
            clipPath: "polygon(20% 100%, 100% 100%, 60% 0%)",
          }}
        />
        <span
          aria-hidden="true"
          className="absolute -top-2 right-2 h-6 w-6"
          style={{
            background: "var(--mascot-ear)",
            clipPath: "polygon(0% 100%, 80% 100%, 40% 0%)",
          }}
        />
      </>
    );
  }

  if (shape === "hamster") {
    // Telinga bulat kecil mepet kepala
    return (
      <>
        <span
          aria-hidden="true"
          className="absolute top-0 left-2 h-5 w-5 rounded-full"
          style={{ background: "var(--mascot-ear)" }}
        />
        <span
          aria-hidden="true"
          className="absolute top-0 right-2 h-5 w-5 rounded-full"
          style={{ background: "var(--mascot-ear)" }}
        />
      </>
    );
  }

  // otter: telinga bulat sedang
  return (
    <>
      <span
        aria-hidden="true"
        className="absolute -top-1 left-3 h-7 w-7 rounded-full"
        style={{ background: "var(--mascot-ear)" }}
      />
      <span
        aria-hidden="true"
        className="absolute -top-1 right-3 h-7 w-7 rounded-full"
        style={{ background: "var(--mascot-ear)" }}
      />
    </>
  );
}

interface MascotFaceProps {
  visual: MoodVisual;
  style: CharacterStyle;
}

function MascotFace({ visual, style }: MascotFaceProps) {
  return (
    <div className="relative h-28 w-28" style={{ filter: style.filter }}>
      <Ears shape={style.shape} />

      {/* head */}
      <div
        className="relative h-28 w-28 rounded-full shadow-[inset_0_-6px_12px_rgba(0,0,0,0.15),inset_0_4px_8px_rgba(255,255,255,0.35),0_8px_18px_rgba(0,0,0,0.18)]"
        style={{ background: "var(--mascot-body)" }}
      >
        {/* face inner highlight */}
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-[58%] h-12 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80"
          style={{ background: "var(--mascot-inner)", filter: "blur(0.5px)" }}
        />

        {/* eyes */}
        <span
          aria-hidden="true"
          className="absolute left-[28%] top-[42%] -translate-x-1/2 -translate-y-1/2"
        >
          <Eye shape={visual.eyeShape} />
        </span>
        <span
          aria-hidden="true"
          className="absolute right-[28%] top-[42%] translate-x-1/2 -translate-y-1/2"
        >
          <Eye shape={visual.eyeShape} />
        </span>

        {/* whiskers (hamster, cat) */}
        {style.hasWhiskers ? (
          <>
            <span
              aria-hidden="true"
              className="absolute left-[10%] top-[64%] h-px w-3 rounded-full opacity-60"
              style={{ background: "var(--mascot-ink)" }}
            />
            <span
              aria-hidden="true"
              className="absolute right-[10%] top-[64%] h-px w-3 rounded-full opacity-60"
              style={{ background: "var(--mascot-ink)" }}
            />
          </>
        ) : null}

        {/* cheeks */}
        {visual.cheekVisible ? (
          <>
            <span
              aria-hidden="true"
              className="absolute left-[16%] top-[60%] h-2 w-3 rounded-full blur-[1px]"
              style={{ background: "var(--mascot-cheek)" }}
            />
            <span
              aria-hidden="true"
              className="absolute right-[16%] top-[60%] h-2 w-3 rounded-full blur-[1px]"
              style={{ background: "var(--mascot-cheek)" }}
            />
          </>
        ) : null}

        {/* nose */}
        {style.hasNose ? (
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-[60%] h-1.5 w-2 -translate-x-1/2 rounded-full opacity-80"
            style={{ background: "var(--mascot-ink)" }}
          />
        ) : null}

        {/* mouth */}
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-[70%] -translate-x-1/2"
        >
          <Mouth shape={visual.mouthShape} />
        </span>
      </div>
    </div>
  );
}

function Eye({ shape }: { shape: MoodVisual["eyeShape"] }) {
  const ink = "var(--mascot-ink)";
  if (shape === "smile") {
    return (
      <span
        className="block h-2 w-3 rounded-b-full border-b-[2.5px]"
        style={{ borderColor: ink }}
      />
    );
  }
  if (shape === "dot") {
    return (
      <span
        className="block h-1.5 w-1.5 rounded-full"
        style={{ background: ink }}
      />
    );
  }
  if (shape === "wide") {
    return (
      <span
        className="block h-2.5 w-2.5 rounded-full"
        style={{ background: ink }}
      />
    );
  }
  return (
    <span className="block h-2 w-2 rounded-full" style={{ background: ink }} />
  );
}

function Mouth({ shape }: { shape: MoodVisual["mouthShape"] }) {
  const ink = "var(--mascot-ink)";
  if (shape === "smile") {
    return (
      <span
        className="block h-2 w-4 rounded-b-full border-b-[2px]"
        style={{ borderColor: ink }}
      />
    );
  }
  if (shape === "small") {
    return (
      <span
        className="block h-1 w-2 rounded-full"
        style={{ background: ink }}
      />
    );
  }
  if (shape === "o") {
    return (
      <span
        className="block h-2.5 w-2 rounded-full border-[1.5px]"
        style={{ borderColor: ink, background: "var(--mascot-cheek)" }}
      />
    );
  }
  return (
    <span
      className="block h-[2px] w-3 rounded-full"
      style={{ background: ink }}
    />
  );
}

interface MascotPlaceholderProps {
  characterId: string;
  mood: MascotMood;
}

export function MascotPlaceholder({
  characterId,
  mood,
}: MascotPlaceholderProps) {
  const visual = moodConfig[mood];
  const character = getCharacterById(characterId);
  const style = characterStyles[character.id] ?? characterStyles.otter;

  return (
    <section
      aria-label="Mascot space"
      className="relative isolate overflow-hidden rounded-[20px] border border-[var(--border-soft)] bg-[var(--bg-card)] px-4 pb-4 pt-3 shadow-[var(--shadow-card)] backdrop-blur-sm"
    >
      {/* radial glow behind mascot */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[15%] h-32 w-32 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(var(--overlay-glow-primary),0.22),transparent_70%)] blur-2xl"
      />

      {/* header chips */}
      <div className="relative flex items-center justify-between gap-2">
        <span className="rounded-full bg-[var(--bg-card-soft)] px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
          {character.name}
        </span>
        <span className="rounded-full bg-[var(--accent-surface)] px-2.5 py-0.5 text-[10px] font-semibold capitalize text-[var(--accent-primary)]">
          {visual.label}
        </span>
      </div>

      {/* mascot stage */}
      <div className="relative mt-2 flex flex-col items-center text-center">
        <div className="relative flex h-32 w-28 items-end justify-center">
          <MascotFace style={style} visual={visual} />
        </div>

        {/* platform */}
        <div
          aria-hidden="true"
          className="-mt-1.5 h-2.5 w-32 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.18),transparent_70%)]"
        />
        <div
          aria-hidden="true"
          className="-mt-1.5 h-1 w-16 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(var(--overlay-glow-primary),0.32),transparent_75%)]"
        />

        <p className="mt-2 max-w-[28ch] text-[12px] leading-4 text-[var(--text-secondary)]">
          {visual.copy}
        </p>
      </div>
    </section>
  );
}
