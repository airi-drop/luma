import { getLumaDb } from "../client";
import { nowIso } from "../../lib/date";
import { isValidCategoryType } from "../../lib/transaction-validation";
import type {
  BudgetRecord,
  CategoryBudget,
  CategoryType,
  MonthlyBudget,
} from "../../types";

function getMonthlyBudgetId(month: string) {
  return `monthly:${month}`;
}

function getCategoryBudgetId(month: string, category: CategoryType) {
  return `category:${month}:${category}`;
}

function assertValidMonth(month: string) {
  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw new Error("Bulan budget belum valid.");
  }

  const [year, monthValue] = month.split("-").map(Number);

  if (!year || !monthValue || monthValue < 1 || monthValue > 12) {
    throw new Error("Bulan budget belum valid.");
  }
}

function assertValidBudgetAmount(value: number, label: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} harus angka valid dan tidak boleh negatif.`);
  }
}

export const budgetsRepo = {
  async getMonthlyBudget(month: string) {
    const database = await getLumaDb();
    const record = await database.get("budgets", getMonthlyBudgetId(month));
    return record?.kind === "monthly" ? record : null;
  },

  async upsertMonthlyBudget(month: string, totalBudget: number) {
    assertValidMonth(month);
    assertValidBudgetAmount(totalBudget, "Total budget");

    const database = await getLumaDb();
    const current = await this.getMonthlyBudget(month);
    const timestamp = nowIso();
    const record: MonthlyBudget = {
      id: getMonthlyBudgetId(month),
      kind: "monthly",
      month,
      totalBudget,
      createdAt: current?.createdAt ?? timestamp,
      updatedAt: timestamp,
    };

    await database.put("budgets", record);

    return record;
  },

  async listCategoryBudgets(month: string) {
    const database = await getLumaDb();
    const items = await database.getAllFromIndex(
      "budgets",
      "by-month-kind",
      IDBKeyRange.only([month, "category"]),
    );

    return items
      .filter((item): item is CategoryBudget => item.kind === "category")
      .sort((left, right) => left.category.localeCompare(right.category));
  },

  async upsertCategoryBudget(
    month: string,
    category: CategoryType,
    limit: number,
    resetMonthly = true,
  ) {
    assertValidMonth(month);

    if (!isValidCategoryType(category)) {
      throw new Error("Kategori budget belum valid.");
    }

    assertValidBudgetAmount(limit, "Limit budget");

    const database = await getLumaDb();
    const id = getCategoryBudgetId(month, category);
    const current = await database.get("budgets", id);
    const timestamp = nowIso();
    const record: CategoryBudget = {
      id,
      kind: "category",
      month,
      category,
      limit,
      resetMonthly,
      createdAt: current?.createdAt ?? timestamp,
      updatedAt: timestamp,
    };

    await database.put("budgets", record);

    return record;
  },

  async removeCategoryBudget(month: string, category: CategoryType) {
    const database = await getLumaDb();
    await database.delete("budgets", getCategoryBudgetId(month, category));
  },

  async listByMonth(month: string) {
    const database = await getLumaDb();
    const items = await database.getAllFromIndex("budgets", "by-month", month);
    return items.sort((left: BudgetRecord, right: BudgetRecord) =>
      left.id.localeCompare(right.id),
    );
  },
};
