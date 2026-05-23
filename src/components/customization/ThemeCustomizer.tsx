import { THEME_PRESETS } from "../../features/customization/presets";
import type { UserSettings } from "../../types";

interface ThemeCustomizerProps {
  settings: UserSettings;
  onChange: (themeId: string) => Promise<void>;
}

export function ThemeCustomizer({
  settings,
  onChange,
}: ThemeCustomizerProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-0.5">
        <p className="text-[12px] leading-5 text-[var(--text-secondary)]">
          Pilih mood warna paling nyaman. Begitu dipilih, app langsung berubah.
        </p>
        <p className="text-[10px] leading-4 text-[var(--text-muted)]">
          Aktif: {THEME_PRESETS.find((item) => item.id === settings.activeThemeId)?.name ?? "Pastel Peach"}
        </p>
      </div>

      <div className="grid gap-2">
        {THEME_PRESETS.map((theme) => {
          const active = theme.id === settings.activeThemeId;

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => void onChange(theme.id)}
              className={[
                "rounded-2xl border p-3 text-left transition-transform duration-150 active:scale-[0.99]",
                active
                  ? "border-[var(--accent-primary)] bg-[var(--accent-surface)]"
                  : "border-[var(--border-soft)] bg-[var(--bg-card-soft)]",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-[var(--text-primary)]">
                    {theme.name}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-[var(--text-secondary)]">
                    {getThemeDescription(theme.id)}
                  </p>
                </div>
                <span
                  className={[
                    "shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em]",
                    active
                      ? "bg-[var(--accent-primary)] text-[var(--text-on-accent)]"
                      : "bg-[var(--bg-card)] text-[var(--text-muted)]",
                  ].join(" ")}
                >
                  {active ? "Aktif" : theme.mode}
                </span>
              </div>

              <div className="mt-2 flex gap-1.5">
                {[
                  theme.tokens["bg-main"],
                  theme.tokens["bg-card"],
                  theme.tokens["accent-primary"],
                  theme.tokens["accent-secondary"],
                ].map((color) => (
                  <span
                    key={`${theme.id}-${color}`}
                    className="h-6 w-6 rounded-full border border-black/5"
                    style={{ background: color }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function getThemeDescription(themeId: string) {
  switch (themeId) {
    case "cream-latte":
      return "Terang, hangat, lembut buat baca angka pelan-pelan.";
    case "sakura-dream":
      return "Sedikit dreamy, manis, masih enak buat lihat transaksi.";
    case "midnight-navy":
      return "Lebih tenang dan dalam, cocok buat vibe malam.";
    case "cozy-dark":
      return "Cozy gelap, hangat, rendah cahaya buat malam hari.";
    default:
      return "Default pastel peach yang lembut, ringan, friendly buat dipakai harian.";
  }
}
