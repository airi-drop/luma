import { useEffect, useMemo, type PropsWithChildren, type ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { useSettingsStore } from "../../stores/settings.store";
import type { BackgroundAsset } from "../../types";

type PageWrapperProps = PropsWithChildren<{
  title: string;
  description?: string;
  headerAction?: ReactNode;
  withBottomNav?: boolean;
}>;

export function PageWrapper({
  children,
  title,
  description,
  headerAction,
  withBottomNav = true,
}: PageWrapperProps) {
  const settings = useSettingsStore((state) => state.settings);
  const activeBackground = useSettingsStore((state) =>
    state.backgrounds.find(
      (background) => background.id === state.settings?.backgroundId,
    ),
  );
  const backgroundUrl = useMemo(
    () => (activeBackground ? URL.createObjectURL(activeBackground.blob) : null),
    [activeBackground],
  );

  useEffect(() => {
    return () => {
      if (backgroundUrl) {
        URL.revokeObjectURL(backgroundUrl);
      }
    };
  }, [backgroundUrl]);

  const overlayOpacity = Math.min(
    88,
    Math.max(36, settings?.backgroundOverlayOpacity ?? 72),
  );
  const blurAmount = Math.min(18, Math.max(0, settings?.backgroundBlur ?? 0));
  const blurStyle = blurAmount > 0 ? { filter: `blur(${blurAmount}px)` } : undefined;
  const backgroundSize = getBackgroundSize(activeBackground);

  return (
    <div className="min-h-dvh bg-[var(--bg-main)] text-[var(--text-primary)]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {backgroundUrl ? (
          <div
            className="absolute inset-0 scale-105 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${backgroundUrl})`,
              ...blurStyle,
            }}
          />
        ) : null}
        <div
          className="absolute inset-0"
          style={{
            background: [
              `radial-gradient(circle at top, rgba(var(--overlay-glow-primary), 0.18), transparent 42%)`,
              `linear-gradient(180deg, rgba(var(--overlay-base-rgb), ${overlayOpacity / 100}), rgba(var(--overlay-base-rgb), ${Math.min(0.96, overlayOpacity / 100 + 0.18)}))`,
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

      <div className="relative mx-auto flex min-h-dvh w-full max-w-[480px] flex-col px-5 pb-28 pt-6">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Luma
            </p>
            <div className="space-y-1">
              <h1 className="font-display text-[28px] leading-tight font-bold">
                {title}
              </h1>
              {description ? (
                <p className="max-w-[32ch] text-sm leading-6 text-[var(--text-secondary)]">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
          {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
        </header>

        <main className="flex-1 space-y-6">{children}</main>

        {backgroundUrl ? (
          <p className="mt-6 text-center text-xs leading-5 text-[var(--text-muted)]">
            Background aktif {activeBackground?.name}
            {backgroundSize ? ` • ${backgroundSize}` : ""}
          </p>
        ) : null}
      </div>

      {withBottomNav ? <BottomNav /> : null}
    </div>
  );
}

function getBackgroundSize(background?: BackgroundAsset) {
  if (!background) {
    return null;
  }

  return `${background.width}×${background.height}`;
}
