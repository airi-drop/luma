import { Link } from "react-router-dom";
import { BackgroundCustomizer } from "../components/customization/BackgroundCustomizer";
import { CharacterCustomizer } from "../components/customization/CharacterCustomizer";
import { ThemeCustomizer } from "../components/customization/ThemeCustomizer";
import { PageWrapper } from "../components/layout/PageWrapper";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { prepareBackgroundAsset } from "../features/customization/image";
import { getCharacterById, getThemeById } from "../features/customization/presets";
import { useSettingsStore } from "../stores/settings.store";

export function SettingsPage() {
  const settings = useSettingsStore((state) => state.settings);
  const backgrounds = useSettingsStore((state) => state.backgrounds);
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  const createBackground = useSettingsStore((state) => state.createBackground);
  const removeBackground = useSettingsStore((state) => state.removeBackground);
  const resetCustomization = useSettingsStore((state) => state.resetCustomization);

  if (!settings) {
    return (
      <PageWrapper
        title="Settings"
        description="Bentar ya, space personalmu lagi dimuat."
        withBottomNav={false}
        headerAction={
          <Link
            to="/home"
            className="inline-flex min-h-11 items-center rounded-full border border-[var(--border-soft)] bg-[var(--bg-card)] px-4 text-sm font-semibold text-[var(--text-secondary)]"
          >
            Kembali
          </Link>
        }
      >
        <Card title="Customization">
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Settings lagi disiapkan dulu biar pilihan theme, character, dan background bisa tampil rapi.
          </p>
        </Card>
      </PageWrapper>
    );
  }

  async function handleThemeChange(themeId: string) {
    await updateSettings({ activeThemeId: themeId, themeMode: getThemeById(themeId).mode });
  }

  async function handleCharacterChange(characterId: string) {
    await updateSettings({ activeCharacterId: characterId });
  }

  async function handleBackgroundUpload(file: File) {
    const prepared = await prepareBackgroundAsset(file);

    try {
      const background = await createBackground({
        name: prepared.name,
        blob: prepared.blob,
        mimeType: prepared.mimeType,
        width: prepared.width,
        height: prepared.height,
        sizeBytes: prepared.sizeBytes,
      });

      await updateSettings({ backgroundId: background.id });
    } finally {
      URL.revokeObjectURL(prepared.previewUrl);
    }
  }

  async function handleBackgroundSelect(backgroundId?: string) {
    await updateSettings({ backgroundId });
  }

  async function handleOverlayChange(backgroundOverlayOpacity: number) {
    await updateSettings({ backgroundOverlayOpacity });
  }

  async function handleBlurChange(backgroundBlur: number) {
    await updateSettings({ backgroundBlur });
  }

  async function handleAiToggle() {
    if (!settings) {
      return;
    }

    await updateSettings({ aiEnabled: !settings.aiEnabled });
  }

  async function handleReset() {
    await resetCustomization();
  }

  const activeTheme = getThemeById(settings.activeThemeId);
  const activeCharacter = getCharacterById(settings.activeCharacterId);

  return (
    <PageWrapper
      title="Settings"
      description="Atur theme, karakter, dan background biar space uangmu terasa makin personal tanpa ganggu keterbacaan."
      withBottomNav={false}
      headerAction={
        <Link
          to="/home"
          className="inline-flex min-h-11 items-center rounded-full border border-[var(--border-soft)] bg-[var(--bg-card)] px-4 text-sm font-semibold text-[var(--text-secondary)]"
        >
          Kembali
        </Link>
      }
    >
      <Card
        title="Sekarang lagi dipakai"
        subtitle="Preview cepat biar kamu nggak perlu nebak perubahan yang sedang aktif."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[20px] border border-[var(--border-soft)] bg-[var(--bg-card-soft)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Theme
            </p>
            <p className="mt-2 text-base font-bold text-[var(--text-primary)]">
              {activeTheme.name}
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
              Mode {activeTheme.mode} dengan tone yang tetap aman buat baca nominal.
            </p>
          </div>
          <div className="rounded-[20px] border border-[var(--border-soft)] bg-[var(--bg-card-soft)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Character
            </p>
            <p className="mt-2 text-base font-bold text-[var(--text-primary)]">
              {activeCharacter.name}
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
              {activeCharacter.assetMap.chill}
            </p>
          </div>
        </div>
      </Card>

      <Card title="Theme Customizer">
        <ThemeCustomizer settings={settings} onChange={handleThemeChange} />
      </Card>

      <Card title="Character Customizer">
        <CharacterCustomizer settings={settings} onChange={handleCharacterChange} />
      </Card>

      <Card title="Background Customizer">
        <BackgroundCustomizer
          settings={settings}
          backgrounds={backgrounds}
          onUpload={handleBackgroundUpload}
          onSelect={handleBackgroundSelect}
          onRemove={removeBackground}
          onOverlayChange={handleOverlayChange}
          onBlurChange={handleBlurChange}
        />
      </Card>

      <Card title="Bantuan AI">
        <div className="flex items-center justify-between gap-4 rounded-[24px] border border-[var(--border-soft)] bg-[var(--bg-card-soft)] p-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              Bantuan AI
            </p>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              Pakai AI buat parse teks jadi transaksi. Bisa dimatiin kapan aja.
            </p>
          </div>
          <button
            aria-pressed={settings.aiEnabled}
            className={[
              "inline-flex min-h-11 min-w-[92px] items-center justify-center rounded-full px-4 text-sm font-bold transition-colors",
              settings.aiEnabled
                ? "bg-[var(--accent-primary)] text-[var(--text-on-accent)]"
                : "border border-[var(--border-soft)] bg-[var(--bg-card)] text-[var(--text-secondary)]",
            ].join(" ")}
            onClick={() => void handleAiToggle()}
            type="button"
          >
            {settings.aiEnabled ? "Aktif" : "Off"}
          </button>
        </div>
      </Card>

      <Card title="Balik ke default">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[34ch] text-sm leading-6 text-[var(--text-secondary)]">
            Kalau mau mulai lagi dari tampilan awal, ini akan mengembalikan theme, character, background aktif, blur, dan overlay ke bawaan Luma. File background yang sudah pernah diupload tetap tersimpan.
          </p>
          <Button variant="secondary" onClick={() => void handleReset()}>
            Reset tampilan
          </Button>
        </div>
      </Card>
    </PageWrapper>
  );
}
