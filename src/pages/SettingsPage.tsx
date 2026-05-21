import { Link } from "react-router-dom";
import { PageWrapper } from "../components/layout/PageWrapper";
import { Card } from "../components/ui/Card";
import { useSettingsStore } from "../stores/settings.store";

export function SettingsPage() {
  const settings = useSettingsStore((state) => state.settings);
  const backgrounds = useSettingsStore((state) => state.backgrounds);

  return (
    <PageWrapper
      title="Settings"
      description="Theme dan character memang tinggal di sini sesuai arahan produk."
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
      <Card title="Theme">
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          Sistem token warna sudah aktif lewat CSS variables. Theme aktif:{" "}
          <span className="font-semibold text-[var(--text-primary)]">
            {settings?.activeThemeId ?? "cozy-dark"}
          </span>
        </p>
      </Card>
      <Card title="Character">
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          Character aktif sekarang{" "}
          <span className="font-semibold text-[var(--text-primary)]">
            {settings?.activeCharacterId ?? "otter"}
          </span>
          . Picker penuh belum dibuat di sprint ini.
        </p>
      </Card>
      <Card title="Background">
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          {backgrounds.length} background tersimpan di IndexedDB sebagai asset terpisah.
        </p>
      </Card>
    </PageWrapper>
  );
}
