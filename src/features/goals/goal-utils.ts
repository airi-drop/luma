import { formatCurrency } from "../../lib/currency";

export const GOAL_ICON_SUGGESTIONS = ["🎧", "✈️", "💻", "🎮", "🎀", "📚", "🏡", "📷"];

export function toCurrencyInput(amount?: number): string {
  return amount ? formatCurrency(amount) : "";
}
