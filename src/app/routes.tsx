import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "../pages/HomePage";

const BudgetDetailPage = lazy(async () => {
  const module = await import("../pages/BudgetDetailPage");
  return { default: module.BudgetDetailPage };
});

const ReportsPage = lazy(async () => {
  const module = await import("../pages/ReportsPage");
  return { default: module.ReportsPage };
});

const SettingsPage = lazy(async () => {
  const module = await import("../pages/SettingsPage");
  return { default: module.SettingsPage };
});

const TargetPage = lazy(async () => {
  const module = await import("../pages/TargetPage");
  return { default: module.TargetPage };
});

const TransactionsPage = lazy(async () => {
  const module = await import("../pages/TransactionsPage");
  return { default: module.TransactionsPage };
});

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/target" element={<TargetPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/budget" element={<BudgetDetailPage />} />
      </Routes>
    </Suspense>
  );
}

function RouteFallback() {
  return (
    <div className="min-h-dvh bg-[var(--bg-main)] px-5 py-6 text-[var(--text-primary)]">
      <div className="mx-auto flex min-h-[calc(100dvh-48px)] w-full max-w-[480px] items-center justify-center rounded-[32px] border border-[var(--border-soft)] bg-[var(--bg-card)] p-6 text-center shadow-[var(--shadow-card)]">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Luma
          </p>
          <p className="font-display text-2xl font-bold">Halamannya lagi disiapin</p>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Sebentar ya, biar tetap ringan pas dibuka dari layar utama.
          </p>
        </div>
      </div>
    </div>
  );
}
