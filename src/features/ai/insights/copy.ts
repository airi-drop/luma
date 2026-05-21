import type { AIInsightCardState, AIInsightType } from "./types";

const typeLabelMap: Record<AIInsightType, string> = {
  night_spending: "ritme malam",
  weekend_spending: "pola weekend",
  mood_category_correlation: "mood dan kategori",
  small_frequent_transactions: "transaksi kecil berulang",
  month_over_month_category_change: "geser antar bulan",
};

const stateMessageMap: Partial<Record<AIInsightCardState, string>> = {
  idle: "AI bisa bantu baca pola yang agak halus dari bulan ini, bukan cuma ngulang angka chart.",
  loading: "Sebentar ya, refleksi bulanan lagi dirangkai dari ringkasan datanya dulu.",
  empty: "Data bulan ini masih terlalu tipis buat dibaca polanya. Coba lagi setelah catat beberapa transaksi lagi ya.",
  limit: "Jatah refleksi AI bulan ini sudah kepakai. Insight yang sudah tersimpan masih bisa kamu baca kapan saja.",
  error: "Refleksi AI belum jadi sekarang. Coba lagi sebentar lagi ya.",
  disabled: "Bantuan AI lagi dimatiin. Kalau mau, bisa diaktifkan dulu dari Settings.",
};

export function getInsightTypeLabel(type: AIInsightType) {
  return typeLabelMap[type] ?? "pola belanja";
}

export function getInsightStateMessage(state: AIInsightCardState) {
  return stateMessageMap[state] ?? "";
}

export function formatInsightUsage(usageCount: number, limit: number) {
  return `${usageCount}/${limit} refleksi bulan ini`;
}
