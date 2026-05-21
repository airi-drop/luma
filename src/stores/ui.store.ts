import { create } from "zustand";
import { getCurrentMonth } from "../lib/date";

export type BottomSheetType =
  | "add-transaction"
  | "edit-transaction"
  | "budget"
  | "saving-goal"
  | null;

export interface ToastState {
  message: string;
  tone?: "success" | "info" | "error";
}

interface UiState {
  activeBottomSheet: BottomSheetType;
  selectedMonth: string;
  toast: ToastState | null;
  openBottomSheet: (sheet: BottomSheetType) => void;
  closeBottomSheet: () => void;
  setSelectedMonth: (month: string) => void;
  showToast: (toast: ToastState) => void;
  clearToast: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeBottomSheet: null,
  selectedMonth: getCurrentMonth(),
  toast: null,
  openBottomSheet(sheet) {
    set({ activeBottomSheet: sheet });
  },
  closeBottomSheet() {
    set({ activeBottomSheet: null });
  },
  setSelectedMonth(month) {
    set({ selectedMonth: month });
  },
  showToast(toast) {
    set({ toast });
  },
  clearToast() {
    set({ toast: null });
  },
}));
