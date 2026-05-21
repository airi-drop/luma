import { nanoid } from "nanoid";
import { getLumaDb } from "../client";
import { getMonthFromDate, nowIso } from "../../lib/date";
import type {
  CreateTransactionInput,
  Transaction,
  TransactionSearchParams,
  UpdateTransactionInput,
} from "../../types";

function sortTransactions(transactions: Transaction[]) {
  return [...transactions].sort((left, right) =>
    right.date.localeCompare(left.date) ||
    right.createdAt.localeCompare(left.createdAt),
  );
}

export const transactionsRepo = {
  async create(input: CreateTransactionInput) {
    const database = await getLumaDb();
    const timestamp = nowIso();
    const transaction: Transaction = {
      id: nanoid(),
      date: input.date,
      month: getMonthFromDate(input.date),
      createdAt: timestamp,
      updatedAt: timestamp,
      detail: input.detail.trim(),
      nominal: input.nominal,
      account: input.account,
      category: input.category,
      mood: input.mood,
      note: input.note?.trim() || undefined,
      source: input.source ?? "manual",
      isRecurring: input.isRecurring,
      recurringRuleId: input.recurringRuleId,
    };

    await database.put("transactions", transaction);

    return transaction;
  },

  async update(id: string, input: UpdateTransactionInput) {
    const database = await getLumaDb();
    const current = await database.get("transactions", id);

    if (!current) {
      throw new Error("Transaction tidak ditemukan.");
    }

    const date = input.date ?? current.date;
    const next: Transaction = {
      ...current,
      ...input,
      date,
      month: getMonthFromDate(date),
      detail: input.detail?.trim() ?? current.detail,
      note:
        input.note === undefined
          ? current.note
          : input.note.trim() || undefined,
      updatedAt: nowIso(),
    };

    await database.put("transactions", next);

    return next;
  },

  async remove(id: string) {
    const database = await getLumaDb();
    await database.delete("transactions", id);
  },

  async getById(id: string) {
    const database = await getLumaDb();
    return database.get("transactions", id);
  },

  async listAll() {
    const database = await getLumaDb();
    const items = await database.getAll("transactions");
    return sortTransactions(items);
  },

  async listByMonth(month: string) {
    const database = await getLumaDb();
    const items = await database.getAllFromIndex("transactions", "by-month", month);
    return sortTransactions(items);
  },

  async search(params: TransactionSearchParams) {
    const items = params.month
      ? await this.listByMonth(params.month)
      : await this.listAll();

    return items.filter((item) => {
      const matchCategory = params.category ? item.category === params.category : true;
      const matchAccount = params.account ? item.account === params.account : true;
      const query = params.query?.trim().toLowerCase();
      const matchQuery = query
        ? item.detail.toLowerCase().includes(query) ||
          item.note?.toLowerCase().includes(query)
        : true;

      return matchCategory && matchAccount && matchQuery;
    });
  },
};
