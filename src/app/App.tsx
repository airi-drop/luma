import { AppProviders } from "./providers";
import { AppRoutes } from "./routes";
import { AddTransactionSheet } from "../components/sheets/AddTransactionSheet";
import { Toast } from "../components/ui/Toast";

export function App() {
  return (
    <AppProviders>
      <AppRoutes />
      <AddTransactionSheet />
      <Toast />
    </AppProviders>
  );
}
