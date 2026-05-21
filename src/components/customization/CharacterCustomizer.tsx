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
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          Karakter bawaan ini masih placeholder, tapi sudah cukup buat nentuin teman kecil yang muncul di Home.
        </p>
        <p className="text-xs leading-5 text-[var(--text-muted)]">
          Pilihan aktif: {activeCharacter.name}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {CHARACTER_PRESETS.map((character) => {
          const active = character.id === settings.activeCharacterId;

          return (
            <button
              key={character.id}
              type="button"
              onClick={() => void onChange(character.id)}
              className={[
                "rounded-[24px] border p-4 text-left transition-transform duration-150 active:scale-[0.99]",
                active
                  ? "border-[var(--accent-primary)] bg-[var(--accent-surface)]"
                  : "border-[var(--border-soft)] bg-[var(--bg-card-soft)]",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--bg-card)] font-display text-lg font-bold text-[var(--text-primary)]">
                  {character.name.slice(0, 2).toUpperCase()}
                </div>
                <span
                  className={[
                    "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                    active
                      ? "bg-[var(--accent-primary)] text-[var(--text-on-accent)]"
                      : "bg-[var(--bg-card)] text-[var(--text-muted)]",
                  ].join(" ")}
                >
                  {active ? "Dipakai" : character.style}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-base font-bold text-[var(--text-primary)]">
                  {character.name}
                </p>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  {character.assetMap.happy}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
