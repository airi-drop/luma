import { Navigate, Route, Routes } from "react-router-dom";
import { BudgetDetailPage } from "../pages/BudgetDetailPage";
import { HomePage } from "../pages/HomePage";
import { ReportsPage } from "../pages/ReportsPage";
import { SettingsPage } from "../pages/SettingsPage";
import { TargetPage } from "../pages/TargetPage";
import { TransactionsPage } from "../pages/TransactionsPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/transactions" element={<TransactionsPage />} />
      <Route path="/target" element={<TargetPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/budget" element={<BudgetDetailPage />} />
    </Routes>
  );
}
