import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { BackgroundCustomizer } from "../components/customization/BackgroundCustomizer";
import { CharacterCustomizer } from "../components/customization/CharacterCustomizer";
import { ThemeCustomizer } from "../components/customization/ThemeCustomizer";
import { PageWrapper } from "../components/layout/PageWrapper";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { IconBadge } from "../components/ui/IconBadge";
import { appDataRepo } from "../db/repositories/app-data.repo";
import { prepareBackgroundAsset } from "../features/customization/image";
import { getCharacterById, getThemeById } from "../features/customization/presets";
import { useBudgetsStore } from "../stores/budgets.store";
import { useSavingGoalsStore } from "../stores/saving-goals.store";
import { useSettingsStore } from "../stores/settings.store";
import { useTransactionsStore } from "../stores/transactions.store";
import { useUiStore } from "../stores/ui.store";

type SettingsSectionId = "theme" | "character" | "background" | "ai";

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
  const [openSection, setOpenSection] = useState<SettingsSectionId | null>("theme");

  if (!settings) {
    return (
      <PageWrapper
        title="Settings"
        description="Bentar ya, space personalmu lagi dimuat."
        withBottomNav={false}
        headerAction={
          <BackLink />
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

    const nextAiEnabled = !settings.aiEnabled;
    await updateSettings({ aiEnabled: nextAiEnabled });
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
      headerAction={<BackLink />}
    >
      <Card
        title="Sekarang lagi dipakai"
        subtitle="Preview cepat biar kamu nggak perlu buka semua pengaturan sekaligus."
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

      <div className="space-y-2.5">
        <SettingsAccordionSection
          icon="🎨"
          isOpen={openSection === "theme"}
          onToggle={() => setOpenSection(openSection === "theme" ? null : "theme")}
          summary={activeTheme.name}
          title="Theme"
        >
          <ThemeCustomizer settings={settings} onChange={handleThemeChange} />
        </SettingsAccordionSection>

        <SettingsAccordionSection
          icon="🐾"
          isOpen={openSection === "character"}
          onToggle={() => setOpenSection(openSection === "character" ? null : "character")}
          summary={activeCharacter.name}
          title="Karakter"
        >
          <CharacterCustomizer settings={settings} onChange={handleCharacterChange} />
        </SettingsAccordionSection>

        <SettingsAccordionSection
          icon="🖼️"
          isOpen={openSection === "background"}
          onToggle={() =>
            setOpenSection(openSection === "background" ? null : "background")
          }
          summary={settings.backgroundId ? "Background custom aktif" : "Pakai background bawaan"}
          title="Background"
        >
          <BackgroundCustomizer
            settings={settings}
            backgrounds={backgrounds}
            onUpload={handleBackgroundUpload}
            onSelect={handleBackgroundSelect}
            onRemove={removeBackground}
            onOverlayChange={handleOverlayChange}
            onBlurChange={handleBlurChange}
          />
        </SettingsAccordionSection>

        <SettingsAccordionSection
          icon="✨"
          isOpen={openSection === "ai"}
          onToggle={() => setOpenSection(openSection === "ai" ? null : "ai")}
          summary={
            settings.aiEnabled
              ? "Aktif untuk input cepat dan refleksi"
              : "Masih dimatikan dulu"
          }
          title="Bantuan AI"
        >
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-card-soft)] p-3">
            <div className="min-w-0 space-y-0.5">
              <p className="text-[13px] font-semibold text-[var(--text-primary)]">
                Bantuan AI
              </p>
              <p className="text-[11px] leading-4 text-[var(--text-secondary)]">
                AI bisa bantu baca input cepat dan bikin refleksi bulanan. Kalau lagi dimatiin, catatan manualmu tetap jalan seperti biasa.
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
        </SettingsAccordionSection>
      </div>

      <Card title="Balik ke default">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[34ch] text-[12px] leading-5 text-[var(--text-secondary)]">
            Reset theme, character, background, blur, dan overlay ke bawaan Luma. File background tetap tersimpan.
          </p>
          <Button onClick={() => void handleReset()} variant="secondary">
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

function BackLink() {
  return (
    <Link
      to="/home"
      className="inline-flex min-h-9 items-center rounded-full border border-[var(--border-soft)] bg-[var(--bg-card)] px-3 text-[12px] font-semibold text-[var(--text-secondary)]"
    >
      Kembali
    </Link>
  );
}

interface SettingsAccordionSectionProps {
  title: string;
  summary: string;
  icon: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

function SettingsAccordionSection({
  title,
  summary,
  icon,
  isOpen,
  onToggle,
  children,
}: SettingsAccordionSectionProps) {
  return (
    <Card className="overflow-hidden">
      <button
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 text-left"
        onClick={onToggle}
        type="button"
      >
        <div className="flex min-w-0 items-center gap-3">
          <IconBadge icon={icon} size="sm" tone="soft" />
          <div className="min-w-0">
            <p className="ui-card-title text-[var(--text-primary)]">{title}</p>
            <p className="mt-0.5 text-[11px] leading-4 text-[var(--text-secondary)]">
              {summary}
            </p>
          </div>
        </div>
        <span aria-hidden="true" className="text-[14px] text-[var(--text-muted)]">
          {isOpen ? "−" : "+"}
        </span>
      </button>

      {isOpen ? <div className="pt-3">{children}</div> : null}
    </Card>
  );
}
