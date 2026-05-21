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
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          Pilih mood warna yang paling nyaman. Begitu dipilih, seluruh app langsung ikut berubah.
        </p>
        <p className="text-xs leading-5 text-[var(--text-muted)]">
          Theme aktif sekarang: {THEME_PRESETS.find((item) => item.id === settings.activeThemeId)?.name ?? "Cozy Dark"}
        </p>
      </div>

      <div className="grid gap-3">
        {THEME_PRESETS.map((theme) => {
          const active = theme.id === settings.activeThemeId;

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => void onChange(theme.id)}
              className={[
                "rounded-[24px] border p-4 text-left transition-transform duration-150 active:scale-[0.99]",
                active
                  ? "border-[var(--accent-primary)] bg-[var(--accent-surface)]"
                  : "border-[var(--border-soft)] bg-[var(--bg-card-soft)]",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-base font-bold text-[var(--text-primary)]">
                    {theme.name}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                    {getThemeDescription(theme.id)}
                  </p>
                </div>
                <span
                  className={[
                    "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                    active
                      ? "bg-[var(--accent-primary)] text-[var(--text-on-accent)]"
                      : "bg-[var(--bg-card)] text-[var(--text-muted)]",
                  ].join(" ")}
                >
                  {active ? "Aktif" : theme.mode}
                </span>
              </div>

              <div className="mt-4 flex gap-2">
                {[
                  theme.tokens["bg-main"],
                  theme.tokens["bg-card"],
                  theme.tokens["accent-primary"],
                  theme.tokens["accent-secondary"],
                ].map((color) => (
                  <span
                    key={`${theme.id}-${color}`}
                    className="h-9 w-9 rounded-full border border-black/5"
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
      return "Terang, hangat, dan tetap lembut buat baca angka pelan-pelan.";
    case "sakura-dream":
      return "Sedikit dreamy, manis, tapi masih enak buat lihat transaksi.";
    case "midnight-navy":
      return "Lebih tenang dan dalam, cocok kalau kamu suka vibe malam.";
    default:
      return "Tema default yang cozy, kontrasnya aman, dan paling dekat sama arah produk.";
  }
}
