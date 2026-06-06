import { AppProviders } from "./providers";
import { AppRoutes } from "./routes";
import { AddTransactionSheet } from "../components/sheets/AddTransactionSheet";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { Toast } from "../components/ui/Toast";

export function App() {
  return (
    <AppProviders>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
      <AddTransactionSheet />
      <Toast />
    </AppProviders>
  );
}
