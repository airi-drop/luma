import {
  useMemo,
  type PropsWithChildren,
  type ReactNode,
} from "react";
import { BottomNav } from "./BottomNav";
import { BrandMark } from "../ui/BrandMark";
import { useSettingsStore } from "../../stores/settings.store";

type PageWrapperProps = PropsWithChildren<{
  title: string;
  description?: string;
  headerAction?: ReactNode;
  withBottomNav?: boolean;
  contentClassName?: string;
  /**
   * Bottom padding in pixels for the scrollable content area.
   * Must clear the floating bottom nav (~80px) and any FAB above it.
   * Defaults to 120px.
   */
  bottomPadding?: number;
}>;

function useBlobObjectUrl(blob?: Blob) {
  // Buat URL hanya saat blob benar-benar berubah. JANGAN revoke saat unmount.
  // Revoke berisiko menghapus URL yang masih dipakai DOM ketika user pindah
  // halaman atau ganti tema (komponen mount-unmount). Browser akan
  // membersihkan blob URL secara otomatis saat tab ditutup.
  return useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);
}

export function PageWrapper({
  children,
  title,
  description,
  headerAction,
  withBottomNav = true,
  contentClassName = "space-y-4",
  bottomPadding = 120,
}: PageWrapperProps) {
  const settings = useSettingsStore((state) => state.settings);
  const backgrounds = useSettingsStore((state) => state.backgrounds);
  const activeBackgroundId = settings?.backgroundId;
  const activeBackground = activeBackgroundId
    ? backgrounds.find((background) => background.id === activeBackgroundId)
    : undefined;
  const backgroundUrl = useBlobObjectUrl(activeBackground?.blob);

  const overlayOpacity = Math.min(
    88,
    Math.max(20, settings?.backgroundOverlayOpacity ?? 60),
  );
  const blurAmount = Math.min(18, Math.max(0, settings?.backgroundBlur ?? 0));
  const blurStyle = blurAmount > 0 ? { filter: `blur(${blurAmount}px)` } : undefined;
  const overlayAlpha = overlayOpacity / 100;
  const overlayAlphaStrong = Math.min(0.92, overlayAlpha + 0.16);

  return (
    <div className="min-h-dvh overflow-x-clip bg-[var(--bg-main)] text-[var(--text-primary)]">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        {backgroundUrl ? (
          <div
            className="absolute inset-0 scale-105 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${backgroundUrl})`,
              willChange: blurAmount > 0 ? "filter" : undefined,
              ...blurStyle,
            }}
          />
        ) : null}
        <div
          className="absolute inset-0"
          style={{
            background: [
              `radial-gradient(circle at top, rgba(var(--overlay-glow-primary), 0.18), transparent 42%)`,
              `linear-gradient(180deg, rgba(var(--overlay-base-rgb), ${overlayAlpha}), rgba(var(--overlay-base-rgb), ${overlayAlphaStrong}))`,
            ].join(", "),
          }}
        />
        <div
          className="absolute inset-x-0 top-0 h-64"
          style={{
            background:
              "radial-gradient(circle at top right, rgba(var(--overlay-glow-secondary), 0.18), transparent 45%)",
          }}
        />
      </div>

      <div
        className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[480px] flex-col px-4 pt-5"
        style={{
          paddingBottom: `calc(env(safe-area-inset-bottom) + ${bottomPadding}px)`,
        }}
      >
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <BrandMark />
            <div className="space-y-0.5">
              <h1 className="font-display text-[26px] leading-tight font-bold">
                {title}
              </h1>
              {description ? (
                <p className="max-w-[34ch] text-[12px] leading-5 text-[var(--text-secondary)]">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
          {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
        </header>

        <main className={["flex-1", contentClassName].join(" ")}>{children}</main>
      </div>

      {withBottomNav ? <BottomNav /> : null}
    </div>
  );
}
