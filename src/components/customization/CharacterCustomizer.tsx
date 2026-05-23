import { CHARACTER_PRESETS, getCharacterById } from "../../features/customization/presets";
import type { UserSettings } from "../../types";

interface CharacterCustomizerProps {
  settings: UserSettings;
  onChange: (characterId: string) => Promise<void>;
}

export function CharacterCustomizer({
  settings,
  onChange,
}: CharacterCustomizerProps) {
  const activeCharacter = getCharacterById(settings.activeCharacterId);

  return (
    <div className="space-y-3">
      <div className="space-y-0.5">
        <p className="text-[12px] leading-5 text-[var(--text-secondary)]">
          Pilih teman kecil yang mau nemenin empty state, refleksi, dan beberapa momen lembut di Luma.
        </p>
        <p className="text-[10px] leading-4 text-[var(--text-muted)]">
          Aktif: {activeCharacter.name}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {CHARACTER_PRESETS.map((character) => {
          const active = character.id === settings.activeCharacterId;

          return (
            <button
              key={character.id}
              type="button"
              onClick={() => void onChange(character.id)}
              className={[
                "rounded-2xl border p-3 text-left transition-transform duration-150 active:scale-[0.99]",
                active
                  ? "border-[var(--accent-primary)] bg-[var(--accent-surface)]"
                  : "border-[var(--border-soft)] bg-[var(--bg-card-soft)]",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-[18px] border border-[var(--border-soft)] bg-[linear-gradient(160deg,rgba(255,255,255,0.14),rgba(var(--overlay-glow-primary),0.14))] font-display text-[13px] font-bold text-[var(--text-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                  {character.name.slice(0, 2).toUpperCase()}
                </div>
                <span
                  className={[
                    "rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em]",
                    active
                      ? "bg-[var(--accent-primary)] text-[var(--text-on-accent)]"
                      : "bg-[var(--bg-card)] text-[var(--text-muted)]",
                  ].join(" ")}
                >
                  {active ? "Dipakai" : character.style}
                </span>
              </div>

              <div className="mt-2 space-y-0.5">
                <p className="text-[13px] font-bold text-[var(--text-primary)]">
                  {character.name}
                </p>
                <p className="line-clamp-2 text-[11px] leading-4 text-[var(--text-secondary)]">
                  {character.assetMap.chill}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
