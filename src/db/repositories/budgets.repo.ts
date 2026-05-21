import { getLumaDb } from "../client";
import { nowIso } from "../../lib/date";
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

export const budgetsRepo = {
  async getMonthlyBudget(month: string) {
    const database = await getLumaDb();
    const record = await database.get("budgets", getMonthlyBudgetId(month));
    return record?.kind === "monthly" ? record : null;
  },

  async upsertMonthlyBudget(month: string, totalBudget: number) {
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
