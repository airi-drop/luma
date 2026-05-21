import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/home", label: "Home", icon: "⌂" },
  { to: "/transactions", label: "Transaksi", icon: "≣" },
  { to: "/target", label: "Target", icon: "◌" },
  { to: "/reports", label: "Laporan", icon: "◔" },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3">
      <div className="mx-auto flex w-full max-w-[480px] items-center gap-2 rounded-[28px] border border-[var(--border-soft)] bg-[color:var(--bg-elevated)]/90 px-3 py-3 shadow-[var(--shadow-card)] backdrop-blur">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                "flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-colors",
                isActive
                  ? "bg-[var(--accent-surface)] text-[var(--accent-primary)]"
                  : "text-[var(--text-muted)]",
              ].join(" ")
            }
          >
            <span aria-hidden="true" className="text-base leading-none">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
