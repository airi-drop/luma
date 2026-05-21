import { Link } from "react-router-dom";
import { PageWrapper } from "../components/layout/PageWrapper";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export function HomePage() {
  return (
    <PageWrapper
      title="Space uangmu"
      description="Catatan, budget, dan target nanti bakal tinggal di sini. Untuk sekarang, shell utamanya sudah siap."
      headerAction={
        <Link
          to="/settings"
          className="inline-flex min-h-11 items-center rounded-full border border-[var(--border-soft)] bg-[var(--bg-card)] px-4 text-sm font-semibold text-[var(--text-secondary)]"
        >
          Settings
        </Link>
      }
    >
      <Card className="overflow-hidden bg-[linear-gradient(135deg,rgba(232,168,87,0.22),rgba(143,184,150,0.14))]">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm text-[var(--text-secondary)]">
                Budget bulan ini
              </p>
              <p className="font-display text-4xl font-bold">Rp0</p>
            </div>
            <div className="rounded-full bg-[var(--bg-card)] px-4 py-2 text-3xl">
              otter
            </div>
          </div>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Budget detail belum diisi. Nanti shortcut-nya tetap lewat Home,
            bukan tab terpisah.
          </p>
          <Link
            to="/budget"
            className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--bg-card-soft)] px-5 text-sm font-bold text-[var(--text-primary)]"
          >
            Lihat Budget
          </Link>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card title="Transaksi" subtitle="Flow manual jadi prioritas utama.">
          <p className="text-sm text-[var(--text-secondary)]">
            Placeholder untuk ringkasan harian.
          </p>
        </Card>
        <Card title="Target" subtitle="Tabungan tetap terasa ringan.">
          <p className="text-sm text-[var(--text-secondary)]">
            Placeholder progress target.
          </p>
        </Card>
      </div>

      <Card title="Catatan awal" subtitle="Sprint 0 dan 1 fokus ke fondasi.">
        <p className="mb-4 text-sm leading-6 text-[var(--text-secondary)]">
          AI belum diaktifkan. Login, cloud sync, dan gamification juga belum
          ada.
        </p>
        <Button fullWidth>Simpan Transaksi</Button>
      </Card>
    </PageWrapper>
  );
}
