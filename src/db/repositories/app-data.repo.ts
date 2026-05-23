import { getLumaDb } from "../client";

const FINANCE_STORES = [
  "transactions",
  "budgets",
  "savingGoals",
  "savingGoalContributions",
  "aiUsage",
  "aiInsights",
] as const;

export const appDataRepo = {
  async clearFinanceData() {
    const database = await getLumaDb();
    const transaction = database.transaction(FINANCE_STORES, "readwrite");

    const counts = await Promise.all(
      FINANCE_STORES.map(async (storeName) => {
        const store = transaction.objectStore(storeName);
        const total = await store.count();
        await store.clear();
        return total;
      }),
    );

    await transaction.done;

    return counts.reduce((sum, count) => sum + count, 0);
  },
};
