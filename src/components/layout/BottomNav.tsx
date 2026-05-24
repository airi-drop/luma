import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useUiStore } from "../../stores/ui.store";

interface NavItem {
  to: string;
  label: string;
  icon: (active: boolean) => ReactNode;
}

const HomeIcon = (active: boolean) => (
  <svg
    aria-hidden="true"
    fill={active ? "currentColor" : "none"}
    height="20"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={active ? "0" : "1.6"}
    viewBox="0 0 24 24"
    width="20"
  >
    <path
      d="M4 11.5 12 5l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-3.5v-5.5h-6V20.5H5.5A1.5 1.5 0 0 1 4 19v-7.5Z"
      stroke={active ? "none" : "currentColor"}
    />
  </svg>
);

const ListIcon = (active: boolean) => (
  <svg
    aria-hidden="true"
    fill="none"
    height="20"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={active ? "2" : "1.6"}
    viewBox="0 0 24 24"
    width="20"
  >
    <path d="M5 7h14M5 12h14M5 17h10" />
  </svg>
);

const TargetIcon = (active: boolean) => (
  <svg
    aria-hidden="true"
    fill="none"
    height="20"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={active ? "2" : "1.6"}
    viewBox="0 0 24 24"
    width="20"
  >
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" fill="currentColor" r="1.4" stroke="none" />
  </svg>
);

const ChartIcon = (active: boolean) => (
  <svg
    aria-hidden="true"
    fill="none"
    height="20"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={active ? "2" : "1.6"}
    viewBox="0 0 24 24"
    width="20"
  >
    <path d="M5 19h14" />
    <path d="M7 16V11" />
    <path d="M12 16V6" />
    <path d="M17 16v-7" />
  </svg>
);

const leftItems: NavItem[] = [
  { to: "/home", label: "Home", icon: HomeIcon },
  { to: "/transactions", label: "Transaksi", icon: ListIcon },
];

const rightItems: NavItem[] = [
  { to: "/target", label: "Target", icon: TargetIcon },
  { to: "/reports", label: "Laporan", icon: ChartIcon },
];

function NavItemLink({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        [
          "group relative flex h-11 w-[60px] flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors duration-200 motion-reduce:transition-none",
          isActive
            ? "text-[var(--accent-primary)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          <span aria-hidden="true" className="leading-none">
            {item.icon(isActive)}
          </span>
          <span className="truncate leading-none">{item.label}</span>
          <span
            aria-hidden="true"
            className={[
              "absolute -bottom-0.5 h-1 w-1 rounded-full transition-opacity duration-200",
              isActive ? "bg-[var(--accent-primary)] opacity-100" : "opacity-0",
            ].join(" ")}
          />
        </>
      )}
    </NavLink>
  );
}

export function BottomNav() {
  const openBottomSheet = useUiStore((state) => state.openBottomSheet);
  const location = useLocation();
  const [hasOpenSheet, setHasOpenSheet] = useState(false);
  const isTargetRoute = location.pathname === "/target";

  const fabConfig = useMemo(
    () =>
      isTargetRoute
        ? {
            ariaLabel: "Buat target baru",
          }
        : {
            ariaLabel: "Tambah transaksi",
          },
    [isTargetRoute],
  );

  useEffect(() => {
    function handleSheetState(event: Event) {
      const detail = (event as CustomEvent<{ hasOpenSheet?: boolean }>).detail;
      setHasOpenSheet(Boolean(detail?.hasOpenSheet));
    }

    window.addEventListener("luma:sheet-state", handleSheetState);
    return () => {
      window.removeEventListener("luma:sheet-state", handleSheetState);
    };
  }, []);

  function handleFabClick() {
    if (isTargetRoute) {
      window.dispatchEvent(new CustomEvent("luma:create-goal"));
      return;
    }

    openBottomSheet("add-transaction");
  }

  if (hasOpenSheet) {
    return null;
  }

  return (
    <div
      aria-hidden="false"
      className="pointer-events-none fixed inset-x-0 z-30 flex justify-center px-4"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
    >
      <div className="pointer-events-auto relative w-full max-w-[420px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(var(--overlay-base-rgb),0.34),transparent_68%)] blur-md"
        />

        <nav
          aria-label="Navigasi utama"
          className="relative flex h-[52px] items-center justify-between rounded-full border border-[var(--border-soft)] bg-[color:var(--bg-elevated)]/84 px-2.5 shadow-[0_8px_22px_rgba(122,90,72,0.11)]"
        >
          <div className="flex items-center gap-1">
            {leftItems.map((item) => (
              <NavItemLink item={item} key={item.to} />
            ))}
          </div>

          <div aria-hidden="true" className="h-10 w-[52px] shrink-0" />

          <div className="flex items-center gap-1">
            {rightItems.map((item) => (
              <NavItemLink item={item} key={item.to} />
            ))}
          </div>
        </nav>

        <button
          aria-label={fabConfig.ariaLabel}
          className="absolute left-1/2 top-0 inline-flex h-[54px] w-[54px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[var(--text-on-accent)] shadow-[0_10px_20px_rgba(242,155,118,0.24),0_3px_8px_rgba(122,90,72,0.12)] transition-transform duration-150 motion-reduce:transition-none motion-safe:active:scale-95"
          onClick={handleFabClick}
          style={{
            background:
              "linear-gradient(160deg, var(--accent-soft) 0%, var(--accent-primary) 100%)",
          }}
          type="button"
        >
          <svg
            aria-hidden="true"
            fill="none"
            height="22"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2.4"
            viewBox="0 0 24 24"
            width="22"
          >
            {isTargetRoute ? (
              <>
                <circle cx="12" cy="12" r="5.4" />
                <circle cx="12" cy="12" r="2.3" />
                <path d="M18.5 5.5v4M16.5 7.5h4" />
              </>
            ) : (
              <path d="M12 5v14M5 12h14" />
            )}
          </svg>
        </button>
      </div>
    </div>
  );
}
