import { Link } from "react-router-dom";
import { BackgroundCustomizer } from "../components/customization/BackgroundCustomizer";
import { CharacterCustomizer } from "../components/customization/CharacterCustomizer";
import { ThemeCustomizer } from "../components/customization/ThemeCustomizer";
import { PageWrapper } from "../components/layout/PageWrapper";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { prepareBackgroundAsset } from "../features/customization/image";
import { getCharacterById, getThemeById } from "../features/customization/presets";
import { appDataRepo } from "../db/repositories/app-data.repo";
import { useBudgetsStore } from "../stores/budgets.store";
import { useSettingsStore } from "../stores/settings.store";
import { useSavingGoalsStore } from "../stores/saving-goals.store";
import { useTransactionsStore } from "../stores/transactions.store";
import { useUiStore } from "../stores/ui.store";
import { useState } from "react";

export function SettingsPage() {
  const settings = useSettingsStore((state) => state.settings);
  const backgrounds = useSettingsStore((state) => state.backgrounds);
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  const createBackground = useSettingsStore((state) => state.createBackground);
  const removeBackground = useSettingsStore((state) => state.removeBackground);
  const resetCustomization = useSettingsStore((state) => state.resetCustomization);
  const currentMonth = useTransactionsStore((state) => state.month);
  const loadTransactions = useTransactionsStore((state) => state.loadMonth);
  const loadAllTransactions = useTransactionsStore((state) => state.loadAll);
  const loadBudgets = useBudgetsStore((state) => state.loadMonth);
  const loadGoals = useSavingGoalsStore((state) => state.loadGoals);
  const showToast = useUiStore((state) => state.showToast);
  const [isClearingData, setIsClearingData] = useState(false);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  if (!settings) {
    return (
      <PageWrapper
        title="Settings"
        description="Bentar ya, space personalmu lagi dimuat."
        withBottomNav={false}
        headerAction={
          <Link
            to="/home"
            className="inline-flex min-h-9 items-center rounded-full border border-[var(--border-soft)] bg-[var(--bg-card)] px-3 text-[12px] font-semibold text-[var(--text-secondary)]"
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

  async function handleClearFinanceData() {
    setIsClearingData(true);

    try {
      const removedCount = await appDataRepo.clearFinanceData();
      await Promise.all([
        loadTransactions(currentMonth),
        loadAllTransactions(),
        loadBudgets(currentMonth),
        loadGoals(),
      ]);
      setIsConfirmingClear(false);
      showToast({
        message:
          removedCount > 0
            ? "Data finansial di device ini sudah dibersihkan."
            : "Data finansialnya memang sudah kosong.",
        tone: "info",
      });
    } catch (error) {
      showToast({
        message:
          error instanceof Error
            ? error.message
            : "Belum berhasil hapus data. Coba lagi ya.",
        tone: "error",
      });
    } finally {
      setIsClearingData(false);
    }
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
          className="inline-flex min-h-9 items-center rounded-full border border-[var(--border-soft)] bg-[var(--bg-card)] px-3 text-[12px] font-semibold text-[var(--text-secondary)]"
        >
          Kembali
        </Link>
      }
    >
      <Card
        title="Sekarang lagi dipakai"
        subtitle="Preview cepat tema dan karakter aktif."
      >
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-card-soft)] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Theme
            </p>
            <p className="mt-1 text-[13px] font-bold text-[var(--text-primary)]">
              {activeTheme.name}
            </p>
            <p className="mt-0.5 text-[11px] capitalize leading-4 text-[var(--text-secondary)]">
              Mode {activeTheme.mode}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-card-soft)] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Character
            </p>
            <p className="mt-1 text-[13px] font-bold text-[var(--text-primary)]">
              {activeCharacter.name}
            </p>
            <p className="mt-0.5 truncate text-[11px] leading-4 text-[var(--text-secondary)]">
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
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-card-soft)] p-3">
          <div className="min-w-0 space-y-0.5">
            <p className="text-[13px] font-semibold text-[var(--text-primary)]">
              Bantuan AI
            </p>
            <p className="text-[11px] leading-4 text-[var(--text-secondary)]">
              Pakai AI buat parse teks jadi transaksi & refleksi bulanan.
              Build production sengaja tidak menyimpan API key di browser.
              Kalau mau AI penuh di production, sambungkan lewat proxy/backend.
            </p>
          </div>
          <button
            aria-pressed={settings.aiEnabled}
            className={[
              "inline-flex min-h-9 min-w-[72px] items-center justify-center rounded-full px-3 text-[12px] font-bold transition-colors",
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[34ch] text-[12px] leading-5 text-[var(--text-secondary)]">
            Reset theme, character, background, blur, dan overlay ke bawaan Luma. File background tetap tersimpan.
          </p>
          <Button variant="secondary" onClick={() => void handleReset()}>
            Reset tampilan
          </Button>
        </div>
      </Card>

      <Card title="Data finansial">
        {isConfirmingClear ? (
          <div className="space-y-3">
            <p className="text-[12px] leading-5 text-[var(--text-secondary)]">
              Semua transaksi, budget, target tabungan, dan cache AI lokal akan dihapus dari device ini. Tampilan personalmu tetap aman.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                className="flex-1"
                disabled={isClearingData}
                onClick={() => setIsConfirmingClear(false)}
                variant="secondary"
              >
                Batal
              </Button>
              <Button
                className="flex-1 bg-[var(--danger-soft)] text-white shadow-none"
                disabled={isClearingData}
                onClick={() => void handleClearFinanceData()}
              >
                {isClearingData ? "Menghapus..." : "Iya, hapus data"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-[34ch] text-[12px] leading-5 text-[var(--text-secondary)]">
              Kalau sempat isi demo data atau mau mulai ulang catatan finansial, hapus semua data inti dari sini.
            </p>
            <Button
              className="bg-[var(--danger-soft)] text-white shadow-none"
              onClick={() => setIsConfirmingClear(true)}
            >
              Hapus Data Finansial
            </Button>
          </div>
        )}
      </Card>
    </PageWrapper>
  );
}
