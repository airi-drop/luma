import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/home", label: "Home", icon: "⌂" },
  { to: "/transactions", label: "Transaksi", icon: "≣" },
  { to: "/target", label: "Target", icon: "◌" },
  { to: "/reports", label: "Laporan", icon: "◔" },
];

export function BottomNav() {
  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-20 px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3"
    >
      <div className="mx-auto flex w-full max-w-[480px] items-center gap-2 rounded-[28px] border border-[var(--border-soft)] bg-[color:var(--bg-elevated)]/90 px-3 py-3 shadow-[var(--shadow-card)] backdrop-blur">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                "flex min-h-12 flex-1 items-center justify-center gap-1 rounded-full px-1.5 py-2 text-[12px] font-semibold transition-colors motion-reduce:transition-none sm:gap-2 sm:px-3 sm:text-sm",
                isActive
                  ? "bg-[var(--accent-surface)] text-[var(--accent-primary)]"
                  : "text-[var(--text-muted)]",
              ].join(" ")
            }
          >
            <span aria-hidden="true" className="text-sm leading-none sm:text-base">
              {item.icon}
            </span>
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
