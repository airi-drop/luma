import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import type { BackgroundAsset, UserSettings } from "../../types";

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
    <div className="space-y-3">
      <div className="space-y-0.5">
        <p className="text-[12px] leading-5 text-[var(--text-secondary)]">
          Upload foto favorit. Otomatis di-resize maksimal 1080px lalu disimpan lokal.
        </p>
        <p className="text-[10px] leading-4 text-[var(--text-muted)]">
          Overlay tetap aktif supaya teks dan angka enak dibaca.
        </p>
      </div>

      <label className="flex min-h-12 cursor-pointer items-center justify-center rounded-full border border-dashed border-[var(--border-soft)] bg-[var(--bg-card-soft)] px-4 text-[13px] font-semibold text-[var(--text-primary)]">
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          aria-label="Upload background baru"
          onChange={(event) => void handleFileChange(event)}
          disabled={isUploading}
        />
        {isUploading ? "Lagi diproses..." : "Upload background baru"}
      </label>

      {feedback ? (
        <p className="text-[11px] leading-4 text-[var(--text-secondary)]">{feedback}</p>
      ) : null}
      {error ? (
        <p className="text-[11px] leading-4 text-[var(--danger-soft)]">{error}</p>
      ) : null}

      <div className="space-y-2 rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-card-soft)] p-3">
        <RangeControl
          label="Overlay"
          value={settings.backgroundOverlayOpacity}
          min={20}
          max={88}
          suffix="%"
          hint="Background ramai? Naikin opacity."
          onChange={onOverlayChange}
        />
        <RangeControl
          label="Blur"
          value={settings.backgroundBlur}
          min={0}
          max={18}
          suffix="px"
          hint="Blur tipis bantu keterbacaan."
          onChange={onBlurChange}
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[var(--text-primary)]">
            Koleksi background
          </p>
          <p className="text-[10px] leading-4 text-[var(--text-muted)]">
            {backgrounds.length > 0
              ? `${backgrounds.length} background tersimpan lokal`
              : "Belum ada background tambahan."}
          </p>
        </div>
        {settings.backgroundId ? (
          <button
            type="button"
            className="shrink-0 text-[12px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            onClick={() => void onSelect(undefined)}
          >
            Pakai default
          </button>
        ) : null}
      </div>

      {backgrounds.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
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
      ) : null}
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
    <label className="block space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] font-semibold text-[var(--text-secondary)]">
          {label}
        </span>
        <span className="text-[12px] font-bold text-[var(--text-primary)]">
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
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--accent-surface)] accent-[var(--accent-primary)]"
      />
      <p className="text-[10px] leading-4 text-[var(--text-muted)]">{hint}</p>
    </label>
  );
}

interface BackgroundItemProps {
  background: BackgroundAsset;
  active: boolean;
  onSelect: (backgroundId?: string) => Promise<void>;
  onRemove: (backgroundId: string) => Promise<void>;
}

function useObjectUrl(blob: Blob) {
  const objectUrl = useMemo(() => URL.createObjectURL(blob), [blob]);

  useEffect(
    () => () => {
      URL.revokeObjectURL(objectUrl);
    },
    [objectUrl],
  );

  return objectUrl;
}

function getDisplayName(name: string) {
  // Hilangkan prefix "Default_" yang dihasilkan AI generator dan
  // potong jadi judul singkat manusiawi.
  const cleaned = name
    .replace(/^Default[_\s-]+/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\.\w+$/i, "")
    .trim();

  if (!cleaned) {
    return "Background";
  }

  // Capitalize first letter, biarkan sisanya seperti sudah dirapihkan
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function BackgroundItem({
  background,
  active,
  onSelect,
  onRemove,
}: BackgroundItemProps) {
  // JANGAN pakai useEffect cleanup revokeObjectURL — bikin thumbnail rusak
  // saat parent re-render. Browser akan release URL saat tab ditutup.
  const previewUrl = useObjectUrl(background.blob);

  const displayName = getDisplayName(background.name);

  return (
    <article
      className={[
        "relative overflow-hidden rounded-2xl border bg-[var(--bg-card-soft)] transition-colors",
        active
          ? "border-[var(--accent-primary)]"
          : "border-[var(--border-soft)]",
      ].join(" ")}
    >
      {/* Thumbnail image */}
      <button
        type="button"
        onClick={() => void onSelect(background.id)}
        className="relative block w-full"
      >
        <div className="aspect-[4/3] w-full overflow-hidden bg-[var(--bg-card)]">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={displayName}
              className="h-full w-full object-cover"
              decoding="async"
              loading="lazy"
            />
          ) : null}
        </div>
        {active ? (
          <span className="absolute right-1.5 top-1.5 rounded-full bg-[var(--accent-primary)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--text-on-accent)] shadow-sm">
            Aktif
          </span>
        ) : null}
      </button>

      {/* Meta + actions */}
      <div className="space-y-1.5 px-2.5 py-2">
        <p
          className="truncate text-[12px] font-semibold text-[var(--text-primary)]"
          title={background.name}
        >
          {displayName}
        </p>
        <p className="truncate text-[10px] leading-4 text-[var(--text-muted)]">
          {background.width}×{background.height} ·{" "}
          {formatSize(background.sizeBytes)}
        </p>
        <div className="flex items-center justify-between gap-1 pt-1">
          <button
            type="button"
            onClick={() => void onSelect(background.id)}
            className={[
              "min-h-7 rounded-full px-2.5 text-[11px] font-semibold transition-colors",
              active
                ? "bg-[var(--accent-primary)] text-[var(--text-on-accent)]"
                : "border border-[var(--border-soft)] bg-[var(--bg-card)] text-[var(--text-primary)]",
            ].join(" ")}
          >
            {active ? "Dipakai" : "Pakai"}
          </button>
          <button
            type="button"
            onClick={() => void onRemove(background.id)}
            className="min-h-7 rounded-full px-2 text-[11px] font-semibold text-[var(--danger-soft)] hover:underline"
          >
            Hapus
          </button>
        </div>
      </div>
    </article>
  );
}

function formatSize(sizeBytes: number) {
  if (sizeBytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}
