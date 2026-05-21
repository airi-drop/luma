import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import type { BackgroundAsset, UserSettings } from "../../types";
import { Button } from "../ui/Button";

interface BackgroundCustomizerProps {
  settings: UserSettings;
  backgrounds: BackgroundAsset[];
  onUpload: (file: File) => Promise<void>;
  onSelect: (backgroundId?: string) => Promise<void>;
  onRemove: (backgroundId: string) => Promise<void>;
  onOverlayChange: (value: number) => Promise<void>;
  onBlurChange: (value: number) => Promise<void>;
}

export function BackgroundCustomizer({
  settings,
  backgrounds,
  onUpload,
  onSelect,
  onRemove,
  onOverlayChange,
  onBlurChange,
}: BackgroundCustomizerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploading(true);
    setFeedback("Background lagi dirapikan dulu biar tetap ringan ✨");
    setError(null);

    try {
      await onUpload(file);
      setFeedback("Background baru sudah aktif. Tampilannya langsung ikut kebawa.");
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Background belum berhasil disimpan.",
      );
      setFeedback(null);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          Upload foto atau wallpaper favoritmu. Sistem akan kompres, resize maksimal 1080px, lalu simpan sebagai Blob di device ini.
        </p>
        <p className="text-xs leading-5 text-[var(--text-muted)]">
          Overlay tetap aktif supaya teks dan angka masih enak dibaca.
        </p>
      </div>

      <label className="flex min-h-14 cursor-pointer items-center justify-center rounded-full border border-dashed border-[var(--border-soft)] bg-[var(--bg-card-soft)] px-5 text-sm font-semibold text-[var(--text-primary)]">
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={(event) => void handleFileChange(event)}
          disabled={isUploading}
        />
        {isUploading ? "Lagi diproses..." : "Upload background baru"}
      </label>

      {feedback ? (
        <p className="text-sm leading-6 text-[var(--text-secondary)]">{feedback}</p>
      ) : null}
      {error ? (
        <p className="text-sm leading-6 text-[var(--danger-soft)]">{error}</p>
      ) : null}

      <div className="space-y-3 rounded-[24px] border border-[var(--border-soft)] bg-[var(--bg-card-soft)] p-4">
        <RangeControl
          label="Overlay"
          value={settings.backgroundOverlayOpacity}
          min={36}
          max={88}
          suffix="%"
          hint="Kalau background ramai, opacity lebih tinggi biasanya lebih nyaman."
          onChange={onOverlayChange}
        />
        <RangeControl
          label="Blur"
          value={settings.backgroundBlur}
          min={0}
          max={18}
          suffix="px"
          hint="Blur tipis cukup bantu keterbacaan tanpa bikin image terasa berat."
          onChange={onBlurChange}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            Koleksi background
          </p>
          <p className="text-xs leading-5 text-[var(--text-muted)]">
            {backgrounds.length > 0
              ? `${backgrounds.length} background tersimpan lokal`
              : "Belum ada background tambahan dulu."}
          </p>
        </div>
        {settings.backgroundId ? (
          <Button variant="ghost" className="min-h-11 px-0" onClick={() => void onSelect(undefined)}>
            Pakai default
          </Button>
        ) : null}
      </div>

      <div className="grid gap-3">
        {backgrounds.map((background) => (
          <BackgroundItem
            key={background.id}
            background={background}
            active={background.id === settings.backgroundId}
            onSelect={onSelect}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}

interface RangeControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  hint: string;
  onChange: (value: number) => Promise<void>;
}

function RangeControl({
  label,
  value,
  min,
  max,
  suffix,
  hint,
  onChange,
}: RangeControlProps) {
  return (
    <label className="block space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-[var(--text-secondary)]">
          {label}
        </span>
        <span className="text-sm font-bold text-[var(--text-primary)]">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => void onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--accent-surface)] accent-[var(--accent-primary)]"
      />
      <p className="text-xs leading-5 text-[var(--text-muted)]">{hint}</p>
    </label>
  );
}

interface BackgroundItemProps {
  background: BackgroundAsset;
  active: boolean;
  onSelect: (backgroundId?: string) => Promise<void>;
  onRemove: (backgroundId: string) => Promise<void>;
}

function BackgroundItem({
  background,
  active,
  onSelect,
  onRemove,
}: BackgroundItemProps) {
  const previewUrl = useMemo(() => URL.createObjectURL(background.blob), [background.blob]);

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="rounded-[24px] border border-[var(--border-soft)] bg-[var(--bg-card-soft)] p-4">
      <div className="flex items-start gap-4">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[18px] bg-[var(--bg-card)]">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={background.name}
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm font-bold text-[var(--text-primary)]">
              {background.name}
            </p>
            <span
              className={[
                "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                active
                  ? "bg-[var(--accent-primary)] text-[var(--text-on-accent)]"
                  : "bg-[var(--bg-card)] text-[var(--text-muted)]",
              ].join(" ")}
            >
              {active ? "Aktif" : "Tersimpan"}
            </span>
          </div>
          <p className="text-xs leading-5 text-[var(--text-muted)]">
            {background.width}×{background.height} • {formatSize(background.sizeBytes)} • {background.mimeType.replace("image/", "").toUpperCase()}
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant={active ? "primary" : "secondary"}
              className="min-h-11 px-4"
              onClick={() => void onSelect(background.id)}
            >
              {active ? "Sedang dipakai" : "Pakai ini"}
            </Button>
            <Button
              variant="ghost"
              className="min-h-11 px-0 text-[var(--danger-soft)]"
              onClick={() => void onRemove(background.id)}
            >
              Hapus
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatSize(sizeBytes: number) {
  if (sizeBytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}
