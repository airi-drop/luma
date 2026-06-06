import type { Transaction } from "../types";

/**
 * Sort transactions by date descending, then by createdAt descending as tiebreaker.
 * Shared between repository and store layers to avoid duplication.
 */
export function sortTransactions(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((left, right) =>
    right.date.localeCompare(left.date) ||
    right.createdAt.localeCompare(left.createdAt),
  );
}
